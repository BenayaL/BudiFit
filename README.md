# 🏋️‍♂️ BudiFit

**BudiFit** is a smart fitness web application that helps users stay active, motivated, and consistent through personalized fitness challenges and an AI-powered fitness assistant.

The application includes a smart bot named **Budi**, which interacts with users, recommends daily or weekly challenges, tracks their progress, provides motivational feedback, and helps them improve over time.

This project was developed as part of an **Advanced Web Development** course and demonstrates the use of a modern web architecture that includes a React frontend, backend business logic, REST API communication, database integration, and external AI/API usage.

---

## 📌 Project Description

Many people want to improve their fitness, but struggle with consistency, motivation, and choosing the right level of difficulty.

BudiFit solves this problem by creating a personalized fitness experience.  
Instead of giving the same workout plan to every user, the system considers the user's profile, fitness level, goals, and progress history.

The AI bot helps the user by asking questions, recommending challenges, giving feedback, and encouraging the user to keep going.

BudiFit is not just a workout tracker.  
It is a smart fitness companion designed to make fitness more personal, interactive, and motivating.

---

## ✨ Main Features

### 👤 User Registration and Login
Users can register, log in, and access their personal account.

### 🧍 Personal Fitness Profile
Each user has a profile that stores personal fitness information such as:

- Fitness level
- Goals
- Challenge history
- Completed workouts
- Progress data

### 🤖 AI Fitness Bot — Budi
Budi is the smart assistant of the application.  
The bot can:

- Ask the user questions
- Recommend suitable challenges
- Adjust challenge difficulty
- Give motivational feedback
- Help the user stay consistent

### 🏆 Daily and Weekly Challenges
The system suggests personalized fitness challenges based on the user’s level.

Example challenges:

- 10 push-ups
- 20 squats
- 15-minute walk
- Core workout
- Stretching challenge

### 📊 Progress Dashboard
Users can track their progress through a dashboard that displays:

- Completed challenges
- Current streak
- Total active days
- Progress over time
- General performance

### 💬 Motivational Feedback
After completing challenges, users receive positive feedback and improvement suggestions.

Example:

> Great job! You completed today’s challenge. Keep going and try to maintain your streak tomorrow.

### 📢 Social Sharing
Users can share achievements with friends or on social platforms.

### 🔔 Notifications and Reminders
The system can remind users to complete their daily challenge.

### 📤 Data Export
Users can export workout summaries or progress data, for example as a PDF or by email.

### 📱 Responsive Design
The application is designed to work properly on both desktop and mobile screens.

---

## 🧰 Tech Stack

### Frontend
The frontend is built with:

- React
- JavaScript
- HTML
- CSS
- Responsive design

React is used because the project requires a component-based user interface and a dynamic client-side application.

### Backend
The backend is built with:

- Node.js
- Express.js
- REST API

The backend is responsible for business logic, user requests, challenge handling, progress updates, and communication with the database and external APIs.

### Database
The planned database is:

- MongoDB

MongoDB is used to store user data, profiles, fitness goals, challenge history, completed challenges, streaks, and progress information.

### AI / External API
The project uses an external AI API, such as:

- OpenAI API

The AI API is used by Budi to generate personalized recommendations, motivational feedback, and smart challenge suggestions.

---

## 🏗️ System Architecture

BudiFit follows a client-server architecture.

```text
User
 ↓
React Frontend
 ↓
REST API
 ↓
Node.js + Express Backend
 ↓
MongoDB Database
 ↓
External AI API
```

### Frontend Responsibilities

The frontend handles:

- User interface
- Page navigation
- Forms
- Dashboard display
- Bot chat interface
- Sending requests to the backend

### Backend Responsibilities

The backend handles:

- Authentication logic
- User profile management
- Challenge management
- Progress tracking
- Database communication
- AI API communication

### Database Responsibilities

The database stores:

- Users
- Profiles
- Challenges
- Completed challenges
- Progress history
- User preferences

---

## 🖥️ Main Screens

The application may include the following screens:

- Login page
- Register page
- Home page
- Personal profile page
- Daily challenge page
- Weekly challenge page
- AI bot chat page
- Progress dashboard
- Achievements page
- Sharing/export page

---

## 🚀 Installation and Setup

### Prerequisites

Before running the project locally, make sure you have:

- Node.js installed
- npm installed
- Git installed
- MongoDB connection string
- AI API key, such as OpenAI API key

---

## ▶️ Running the Project Locally

### 1. Clone the Repository

```bash
git clone <repository-url>
cd BudiFit
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Create Environment Variables

Inside the `server` folder, create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
OPENAI_API_KEY=your_openai_api_key
```

### 5. Run the Backend Server

```bash
cd server
npm start
```

Or in development mode:

```bash
npm run dev
```

### 6. Run the Frontend

Open another terminal:

```bash
cd client
npm start
```

If the project uses Vite:

```bash
npm run dev
```

### 7. Open the Application

Open the browser and go to:

```text
http://localhost:3000
```

Or, if using Vite:

```text
http://localhost:5173
```

---

## 🔄 Example User Flow

1. The user registers or logs in.
2. The user creates a personal fitness profile.
3. The user selects fitness level and goals.
4. Budi asks questions and recommends a challenge.
5. The user completes the challenge.
6. The system updates the progress dashboard.
7. Budi gives motivational feedback.
8. The user can share or export progress data.

---

## 🌐 API Overview

### Authentication Routes

```text
POST /api/auth/register
POST /api/auth/login
```

### User Routes

```text
GET /api/users/:id
PUT /api/users/:id
```

### Challenge Routes

```text
GET /api/challenges
POST /api/challenges
PUT /api/challenges/:id/complete
```

### Bot Routes

```text
POST /api/bot/recommend
POST /api/bot/feedback
```

### Progress Routes

```text
GET /api/progress/:userId
POST /api/progress
```

---

## 📁 Suggested Project Structure

```text
BudiFit/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🧠 AI Bot Logic

The AI bot receives information such as:

- User fitness level
- User goals
- Completed challenges
- Current streak
- Previous feedback
- Difficulty level

Based on this information, Budi can generate:

- A new fitness challenge
- A motivational message
- Feedback after completion
- Suggestions for improvement
- Difficulty adjustments

Example:

```text
User level: Beginner
Goal: Build consistency
Previous challenge: 10 push-ups
Result: Completed

Budi recommendation:
"Great job! Today, let's continue with a simple full-body challenge: 10 squats, 10 push-ups, and a 5-minute walk."
```

---

## 📊 Data Models — Example

### User

```json
{
  "id": "user_id",
  "name": "Ben",
  "email": "ben@example.com",
  "fitnessLevel": "Beginner",
  "goal": "Improve consistency"
}
```

### Challenge

```json
{
  "id": "challenge_id",
  "title": "Beginner Full Body Challenge",
  "type": "Daily",
  "exercises": ["10 push-ups", "20 squats", "5-minute walk"],
  "difficulty": "Beginner"
}
```

### Progress

```json
{
  "userId": "user_id",
  "completedChallenges": 12,
  "currentStreak": 4,
  "lastCompletedDate": "2026-05-10"
}
```

---

## 🔮 Future Improvements

Future versions of BudiFit may include:

- Google login
- More advanced AI personalization
- Push notifications
- Group challenges with friends
- Weekly PDF reports
- Admin dashboard
- Wearable device integration
- Fitness level prediction
- Calendar integration
- More detailed statistics and charts

---

## 🧪 Project Status

The project is currently under development as part of an academic course.

Current focus:

- Building the React frontend
- Designing the main user flow
- Creating backend API endpoints
- Planning database models
- Integrating the AI fitness bot

---

## 👥 Team

Benaya Leib

---

## 📄 License

This project is for academic and educational purposes only.
