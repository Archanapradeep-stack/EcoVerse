import prisma from "@/lib/prisma";

const starterMissions = JSON.stringify([
  { id: 1, title: "Play Eco Runner", xp: 50, coins: 20, color: "green", completed: false },
  { id: 2, title: "Complete your first lesson", xp: 25, coins: 10, color: "blue", completed: false },
  { id: 3, title: "Plant your first virtual tree", xp: 100, coins: 50, color: "yellow", completed: false }
]);

export async function getOrCreateDbUser(clerkUser: any) {
  if (!clerkUser) return null;
  
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  try {
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { profile: true }
    });

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: { clerkId: clerkUser.id },
        data: {
          email,
          name,
          profilePicture: clerkUser.imageUrl,
        },
        include: { profile: true }
      });
    } else {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          name,
          profilePicture: clerkUser.imageUrl,
          profile: {
            create: {
              dailyMissions: starterMissions
            } 
          }
        },
        include: { profile: true }
      });
    }
    
    // Fallback: If user existed but profile was missing somehow, create it
    if (dbUser && !dbUser.profile) {
      const profile = await prisma.profile.create({
        data: { userId: dbUser.id, dailyMissions: starterMissions }
      });
      dbUser.profile = profile;
    }
    
    return dbUser;
  } catch (error) {
    console.error("Error in getOrCreateDbUser:", error);
    
    // Return a fallback mock so the app doesn't crash on Prisma failures
    return {
      id: "fallback-id",
      clerkId: clerkUser.id,
      email,
      name,
      role: "STUDENT",
      profilePicture: clerkUser.imageUrl,
      profile: {
        id: "fallback-profile-id",
        userId: "fallback-id",
        bio: null,
        school: null,
        xp: 0,
        coins: 0,
        level: 1,
        streak: 0,
        treesPlanted: 0,
        badges: [],
        completedCourses: [],
        completedGames: [],
        dailyMissions: starterMissions,
        currentCourse: null,
        energy: 100,
        maxEnergy: 100,
        currentSkin: "default"
      }
    };
  }
}
