import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import GamesUI from "@/components/games/GamesUI";
import { getOrCreateDbUser } from "@/lib/user";

export default async function GamesPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  const dbUser = await getOrCreateDbUser(clerkUser);

  if (!dbUser || !dbUser.profile) {
    redirect("/"); // If no profile, go to main dashboard to initialize it
  }

  let gameProgress: any[] = [];
  try {
    const freshUser = await prisma.user.findUnique({
      where: { id: dbUser.id },
      include: { 
        gameProgress: {
          include: { game: true },
          orderBy: { lastPlayed: 'desc' }
        }
      }
    });
    if (freshUser?.gameProgress) {
      gameProgress = freshUser.gameProgress;
    }
  } catch (e) {
    console.error("DB Error fetching game progress:", e);
  }

  return (
    <GamesUI 
      profile={dbUser.profile} 
      firstName={clerkUser.firstName} 
      fullName={dbUser.name || clerkUser.fullName}
      imageUrl={dbUser.profilePicture || clerkUser.imageUrl}
      role={dbUser.role}
      gameProgress={gameProgress}
    />
  );
}
