"use client";

import DashboardUI from "./DashboardUI";

interface StudentDashboardClientProps {
  name: string;
  profile: {
    level: number;
    xp: number;
    coins: number;
    streak?: number;
    treesPlanted?: number;
    completedCourses?: string[];
    badges?: string[];
    dailyMissions?: string;
  };
  missions: any[];
  currentCourseDetails: any | null;
  percentComplete: number;
  recommendedTopic: string | null;
}

export function StudentDashboardClient({
  name,
  profile,
  missions,
  currentCourseDetails,
  percentComplete,
  recommendedTopic
}: StudentDashboardClientProps) {
  
  // Transform the profile data to match ProfileData type for DashboardUI
  const fullProfile = {
    level: profile.level || 1,
    xp: profile.xp || 0,
    coins: profile.coins || 0,
    streak: profile.streak || 0,
    treesPlanted: profile.treesPlanted || 0,
    completedCourses: profile.completedCourses || [],
    badges: profile.badges || [],
    dailyMissions: profile.dailyMissions || "[]"
  };

  return (
    <DashboardUI 
      profile={fullProfile}
      firstName={name?.split(' ')[0] || "Student"}
      fullName={name || "Student"}
      imageUrl={null}
      role="STUDENT"
      missions={missions}
      currentCourseDetails={currentCourseDetails}
      percentComplete={percentComplete}
      recommendedTopic={recommendedTopic}
    />
  );
}
