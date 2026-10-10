import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { StudentDashboardClient } from "@/components/dashboard/StudentDashboardClient";
import { getOrCreateDbUser } from "@/lib/user";

interface Mission {
  id: number;
  title: string;
  completed: boolean;
}

export default async function StudentDashboard() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch or create user in DB
  const clerkUser = await currentUser();
  const dbUser = await getOrCreateDbUser(clerkUser);

  const profile = dbUser?.profile;
  let missions: Mission[] = [];
  try {
    if (profile?.dailyMissions) {
      missions = JSON.parse(profile.dailyMissions);
    }
  } catch (e) {
    console.error("Failed to parse daily missions:", e);
  }

  // Fetch Progress & Current Course dynamically
  let currentCourseDetails = null;
  let percentComplete = 0;
  if (dbUser && profile?.currentCourse) {
    try {
      currentCourseDetails = await prisma.course.findUnique({
        where: { id: profile.currentCourse }
      });
      const progress = await prisma.courseProgress.findFirst({
        where: { userId: dbUser.id, courseId: profile.currentCourse }
      });
      percentComplete = progress?.percentComplete || 0;
    } catch (e) {
      console.error("Error fetching progress:", e);
    }
  }

  // Simple AI Recommendation Engine: look at recent Quiz Results
  let recommendedTopic = null;
  if (dbUser) {
    try {
      const recentResults = await prisma.quizResult.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        take: 3
      });
      
      const allWeakTopics = recentResults.flatMap(r => r.weakTopics);
      if (allWeakTopics.length > 0) {
        // Find most frequent weak topic
        const counts = allWeakTopics.reduce((acc: any, val: string) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {});
        recommendedTopic = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      }
    } catch (e) {
      console.error("Error generating recommendation:", e);
    }
  }

  return (
    <StudentDashboardClient 
      name={dbUser?.name || 'Eco-Warrior'}
      profile={{
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        coins: profile?.coins || 0
      }}
      missions={missions}
      currentCourseDetails={currentCourseDetails}
      percentComplete={percentComplete}
      recommendedTopic={recommendedTopic}
    />
  );
}

