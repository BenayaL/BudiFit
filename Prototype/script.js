// ==============================
// Fake JSON Data
// ==============================
const fakeData = {
  users: [
    {
      username: "daniel",
      email: "daniel@example.com",
      password: "1234",
      level: "Beginner",
      goal: "Build consistency",
      streak: 6,
      completed: 18,
      points: 340,
      weeklyTarget: 4,
      reminderTime: "18:00",
      isAdmin: false
    },
    {
      username: "admin",
      email: "admin@chadgpt.com",
      password: "admin",
      level: "Advanced",
      goal: "Manage content",
      streak: 0,
      completed: 0,
      points: 0,
      weeklyTarget: 5,
      reminderTime: "12:00",
      isAdmin: true
    }
  ],

  dailyChallenge: {
    title: "Beginner Strength Boost",
    exercises: ["10 Push-ups", "20 Squats", "30 sec Plank"]
  },

  achievements: [
    "First Challenge Completed",
    "5 Days Streak",
    "Workout Comeback"
  ]
};

let currentUser = fakeData.users[0];
let challengeCompleted = false;

let botMessages = [
  {
    sender: "bot",
    text: "Hey! I am Budi. Ready for today's challenge?"
  }
];

// ==============================
// Navigation using DOM
// ==============================
const navButtons = document.querySelectorAll(".nav-btn");

// Add click event listeners to navigation buttons
navButtons.forEach(button => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.screen);
  });
});

// Function to show the selected screen and hide others using DOM manipulation
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");

  navButtons.forEach(button => {
    button.classList.remove("nav-active");
    button.classList.add("hover:bg-purple-700");

    if (button.dataset.screen === screenId) {
      button.classList.add("nav-active");
      button.classList.remove("hover:bg-purple-700");
    }
  });

  if (screenId === "dashboardScreen") {
    renderDashboard();
  }

  if (screenId === "botScreen") {
    renderChat();
  }

  if (screenId === "profileScreen") {
    renderProfile();
  }

  if (screenId === "adminScreen") {
    populateUsersTable();
  }
}

// ==============================
// Login logic
// ==============================
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", event => {
  event.preventDefault();

  const usernameOrEmail = document.getElementById("loginUserInput").value;
  const password = document.getElementById("loginPassInput").value;

  const user = fakeData.users.find(user =>
    (user.username === usernameOrEmail || user.email === usernameOrEmail) &&
    user.password === password
  );

  if (user) {
    currentUser = user;
    localStorage.setItem("currentUser", JSON.stringify(user));

    loginMessage.textContent = "Login successful!";
    loginMessage.className = "mt-4 text-center text-sm font-semibold text-green-600";

    showScreen("dashboardScreen");
  } else {
    loginMessage.textContent = "Invalid username/email or password.";
    loginMessage.className = "mt-4 text-center text-sm font-semibold text-red-600";
  }
});

// ==============================
// Register logic
// ==============================
const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

registerForm.addEventListener("submit", event => {
  event.preventDefault();

  const username = document.getElementById("userInput").value;
  const email = document.getElementById("mailInput").value;
  const password = document.getElementById("passInput").value;
  const confirmPassword = document.getElementById("confirmInput").value;
  const level = document.getElementById("levelInput").value;
  const goal = document.getElementById("goalInput").value;

  registerMessage.textContent = "";

  if (password !== confirmPassword) {
    registerMessage.textContent = "Passwords do not match.";
    registerMessage.className = "mt-4 text-center text-sm font-semibold text-red-600";
    return;
  }

  const exists = fakeData.users.some(user =>
    user.username === username || user.email === email
  );

  if (exists) {
    registerMessage.textContent = "Username or email already exists.";
    registerMessage.className = "mt-4 text-center text-sm font-semibold text-red-600";
    return;
  }

  const newUser = {
    username,
    email,
    password,
    level,
    goal,
    streak: 0,
    completed: 0,
    points: 0,
    weeklyTarget: 4,
    reminderTime: "18:00",
    isAdmin: false
  };

  fakeData.users.push(newUser);
  currentUser = newUser;

  localStorage.setItem("users", JSON.stringify(fakeData.users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  registerMessage.textContent = "Registration successful! Data saved to localStorage for prototype.";
  registerMessage.className = "mt-4 text-center text-sm font-semibold text-green-600";

  registerForm.reset();

  setTimeout(() => {
    showScreen("dashboardScreen");
  }, 700);
});

// ==============================
// Dashboard rendering using DOM
// ==============================

// Function to render the dashboard information and daily challenge using DOM manipulation
function renderDashboard() {
  document.getElementById("welcomeTitle").textContent = `Welcome, ${currentUser.username}`;
  document.getElementById("fitnessLevel").textContent = currentUser.level;
  document.getElementById("streakDays").textContent = `${currentUser.streak + (challengeCompleted ? 1 : 0)} days`;
  document.getElementById("completedCount").textContent = currentUser.completed + (challengeCompleted ? 1 : 0);
  document.getElementById("pointsCount").textContent = currentUser.points + (challengeCompleted ? 20 : 0);
  document.getElementById("challengeTitle").textContent = fakeData.dailyChallenge.title;

  const challengeList = document.getElementById("challengeList");
  challengeList.innerHTML = "";

  fakeData.dailyChallenge.exercises.forEach(exercise => {
    const li = document.createElement("li");
    li.textContent = `• ${exercise}`;
    challengeList.appendChild(li);
  });

  const button = document.getElementById("completeChallengeBtn");

  button.textContent = challengeCompleted ? "Completed ✓" : "Mark as Completed";
  button.disabled = challengeCompleted;

  button.className = challengeCompleted
    ? "w-full bg-gray-600 text-white py-3 rounded font-semibold"
    : "w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded font-semibold";

  const achievementsList = document.getElementById("achievementsList");
  achievementsList.innerHTML = "";

  fakeData.achievements.forEach(achievement => {
    const div = document.createElement("div");
    div.className = "bg-purple-100 text-purple-900 p-3 rounded font-semibold";
    div.textContent = `🏆 ${achievement}`;
    achievementsList.appendChild(div);
  });
}

document.getElementById("completeChallengeBtn").addEventListener("click", () => {
  challengeCompleted = true;

  document.getElementById("challengeMessage").textContent =
    "Great job! Your challenge was marked as completed.";

  document.getElementById("challengeMessage").className =
    "mt-4 text-center font-semibold text-green-600";

  botMessages.push({
    sender: "bot",
    text: "Great job completing your daily challenge! Want a harder one tomorrow?"
  });

  renderDashboard();
});

function shareAchievement() {
  alert("Prototype action: Achievement shared successfully!");
}

// ==============================
// Profile screen logic
// ==============================

// Function to render the user's profile information in the profile screen using DOM manipulation
function renderProfile() {
  document.getElementById("profileAvatar").textContent =
    currentUser.username.charAt(0).toUpperCase();

  document.getElementById("profileName").textContent = currentUser.username;
  document.getElementById("profileEmail").textContent = currentUser.email;
  document.getElementById("profileLevelBadge").textContent = currentUser.level;

  document.getElementById("profileUsernameInput").value = currentUser.username;
  document.getElementById("profileEmailInput").value = currentUser.email;
  document.getElementById("profileLevelInput").value = currentUser.level;
  document.getElementById("profileGoalInput").value = currentUser.goal;
  document.getElementById("profileReminderInput").value = currentUser.reminderTime || "18:00";
  document.getElementById("profileWeeklyTargetInput").value = currentUser.weeklyTarget || 4;
}

document.getElementById("profileForm").addEventListener("submit", event => {
  event.preventDefault();

  currentUser.username = document.getElementById("profileUsernameInput").value;
  currentUser.email = document.getElementById("profileEmailInput").value;
  currentUser.level = document.getElementById("profileLevelInput").value;
  currentUser.goal = document.getElementById("profileGoalInput").value;
  currentUser.reminderTime = document.getElementById("profileReminderInput").value;
  currentUser.weeklyTarget = Number(document.getElementById("profileWeeklyTargetInput").value);

  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("profileMessage").textContent =
    "Profile updated successfully in the prototype.";

  document.getElementById("profileMessage").className =
    "mt-4 text-center font-semibold text-green-600";

  renderProfile();
});

// ==============================
// Budi chat simulation
// ==============================

// Function to render chat messages in the bot screen using DOM manipulation  
function renderChat() {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = "";

  botMessages.forEach(message => {
    const div = document.createElement("div");

    div.className = message.sender === "user"
      ? "bg-purple-600 text-white p-3 rounded ml-auto max-w-xs"
      : "bg-white border border-purple-200 text-purple-900 p-3 rounded max-w-xs";

    div.textContent = message.text;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("sendBotBtn").addEventListener("click", sendBotMessage);

document.getElementById("botInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    sendBotMessage();
  }
});

// Function to handle sending a message to the bot and getting a reply using DOM manipulation
function sendBotMessage() {
  const input = document.getElementById("botInput");
  const text = input.value.trim();

  if (text === "") {
    return;
  }

  botMessages.push({
    sender: "user",
    text
  });

  botMessages.push({
    sender: "bot",
    text: getBotReply(text)
  });

  input.value = "";
  renderChat();
}

// Add click event listeners to quick prompt buttons to send predefined messages to the bot using DOM manipulation
document.querySelectorAll(".quick-prompt").forEach(button => {
  button.addEventListener("click", () => {
    botMessages.push({
      sender: "user",
      text: button.dataset.prompt
    });

    botMessages.push({
      sender: "bot",
      text: getBotReply(button.dataset.prompt)
    });

    renderChat();
  });
});

// Function to generate a bot reply based on user input using simple keyword matching
function getBotReply(text) {
  const lower = text.toLowerCase();

  if (lower.includes("easier")) {
    return "Sure. Try only 5 push-ups, 10 squats and 20 seconds plank today.";
  }

  if (lower.includes("5 minutes")) {
    return "Here is a 5 minute challenge: 1 minute warm-up, 2 minutes squats, 1 minute plank, 1 minute stretch.";
  }

  if (lower.includes("motivate")) {
    return "You do not need a perfect workout. You only need one small action to keep the habit alive.";
  }

  return "Based on your level, I recommend a short bodyweight challenge today.";
}

// ==============================
// Admin table
// ==============================
let editable = {
  ccell: null,
  cval: null,

  edit: cell => {
    editable.ccell = cell;
    editable.cval = cell.innerHTML;

    cell.classList.add("edit");
    cell.contentEditable = true;
    cell.focus();

    cell.onblur = editable.done;

    cell.onkeydown = event => {
      if (event.key === "Enter") {
        editable.done();
      }

      if (event.key === "Escape") {
        editable.done(1);
      }
    };
  },

  done: discard => {
    editable.ccell.onblur = "";
    editable.ccell.onkeydown = "";
    editable.ccell.classList.remove("edit");
    editable.ccell.contentEditable = false;

    if (discard === 1) {
      editable.ccell.innerHTML = editable.cval;
    }
  }
};
// Function to populate the users table in the admin screen using DOM manipulation
function populateUsersTable() {
  const table = document.getElementById("usersData");
  const thead = table.querySelector("thead tr");
  const tbody = table.querySelector("tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  const headers = [
    "username",
    "email",
    "level",
    "goal",
    "streak",
    "completed",
    "points",
    "weeklyTarget",
    "isAdmin"
  ];

  headers.forEach(header => {
    const th = document.createElement("th");
    th.textContent = header;
    th.classList.add("px-4", "py-2", "text-left");
    thead.appendChild(th);
  });

  fakeData.users.forEach(user => {
    const tr = document.createElement("tr");

    headers.forEach(header => {
      const td = document.createElement("td");

      td.textContent = user[header];
      td.classList.add("border", "border-purple-200", "px-4", "py-2");

      td.addEventListener("dblclick", () => editable.edit(td));

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

// Initial render
renderDashboard();