//import React from "react";
import { AppButton } from "../components/ui/AppButton";

// 1. Define strict types for the data we expect
export type Goal = "strength" | "cardio" | "flex" | "consistency" | "weightLoss";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  icon: string;
};

export type UserProfile = {
  name: string;
  level: string;
  memberSince: string;
  streak: number;
  totalWorkouts: number;
  totalMinutes: number;
  goals: Goal[];
  achievements: Achievement[];
};

// SVG Helper for clean code
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    flame: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />,
    dumbbell: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    trophy: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
  };
  return (
    <svg className={className || "w-6 h-6"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {icons[name] || icons.trophy}
    </svg>
  );
};

// 2. Main Component
export function ProfilePage() {
  // Dummy data (In the future, pass this as a prop from App.tsx or fetch from an API)
  const user: UserProfile = {
    name: "Julian",
    level: "Intermediate",
    memberSince: "April 2025",
    streak: 14,
    totalWorkouts: 42,
    totalMinutes: 2520,
    goals: ["consistency", "strength", "cardio", "weightLoss"],
    achievements: [
      { id: "1", title: "First Step", description: "Completed your first workout", earned: true, icon: "flame" },
      { id: "2", title: "7-Day Streak", description: "Showed up for a full week", earned: true, icon: "flame" },
      { id: "3", title: "Early Bird", description: "Workout before 7 AM", earned: true, icon: "clock" },
    ]
  };

  const earnedCount = user.achievements.filter(a => a.earned).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-[24px] bg-slate-900 shadow-lg">
        {/* Colorful top banner */}
        <div className="h-32 w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-orange-400 opacity-90" />
        
        <div className="px-8 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end">
            {/* Floating Avatar */}
            <div className="w-24 h-24 rounded-full bg-purple-600 border-4 border-slate-900 flex items-center justify-center text-4xl font-extrabold text-white shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            <div className="mb-1 text-white translate-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium backdrop-blur-sm mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active now
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{user.name}</h1>
              <p className="text-slate-400 text-sm mt-1">
                {user.level} · Joined {user.memberSince}
              </p>
            </div>
          </div>

          <AppButton variant="secondary" className="bg-white/10 border-none text-white hover:bg-white/20 translate-y-4">
            <Icon name="settings" className="w-4 h-4 mr-2 inline" /> Edit Profile
          </AppButton>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatTile label="Day Streak" value={user.streak.toString()} sub="days" icon="flame" color="text-orange-500" bg="bg-orange-100" />
        <StatTile label="Workouts" value={user.totalWorkouts.toString()} sub="sessions" icon="dumbbell" color="text-blue-500" bg="bg-blue-100" />
        <StatTile label="Time Moved" value={Math.round(user.totalMinutes / 60).toString()} sub="hours" icon="clock" color="text-emerald-500" bg="bg-emerald-100" />
        <StatTile label="Badges" value={`${earnedCount}/${user.achievements.length}`} sub="earned" icon="trophy" color="text-purple-500" bg="bg-purple-100" />
      </div>

      {/* Achievements Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user.achievements.map((badge) => (
            <div 
              key={badge.id} 
              className={`p-5 rounded-2xl border ${badge.earned ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${badge.earned ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-400'}`}>
                <Icon name={badge.icon} />
              </div>
              <h3 className="font-bold text-slate-900">{badge.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{badge.description}</p>
              {badge.earned && (
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  ✓ Earned
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Small helper component for the top stats
function StatTile({ label, value, sub, icon, color, bg }: { label: string; value: string; sub: string; icon: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-[20px] p-5 border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color}`}>
          <Icon name={icon} className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">{value}</span>
        <span className="text-sm font-medium text-slate-500 ml-1">{sub}</span>
      </div>
    </div>
  );
}