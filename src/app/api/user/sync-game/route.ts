import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateDbUser } from "@/lib/user";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { gameId, score = 0, xpEarned = 0, coinsEarned = 0, treesPlanted = 0 } = body;

    // Find or create user
    const dbUser = await getOrCreateDbUser(clerkUser);

    if (!dbUser || !dbUser.profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Find or create the Game record based on the string ID/slug passed from frontend (e.g., "eco-runner")
    let game = null;
    if (gameId) {
      // Look for a game by type (which we'll use as the slug)
      game = await prisma.game.findFirst({
        where: { type: gameId }
      });

      if (!game) {
        // Create it if it doesn't exist
        game = await prisma.game.create({
          data: {
            title: gameId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            description: `Play ${gameId} and earn rewards!`,
            thumbnail: "/placeholder.png",
            type: gameId
          }
        });
      }

      // Update GameProgress
      const existingProgress = await prisma.gameProgress.findUnique({
        where: {
          userId_gameId: {
            userId: dbUser.id,
            gameId: game.id
          }
        }
      });

      if (existingProgress) {
        await prisma.gameProgress.update({
          where: { id: existingProgress.id },
          data: {
            playCount: existingProgress.playCount + 1,
            highScore: Math.max(existingProgress.highScore, score),
            lastPlayed: new Date()
          }
        });
      } else {
        await prisma.gameProgress.create({
          data: {
            userId: dbUser.id,
            gameId: game.id,
            highScore: score,
            playCount: 1
          }
        });
      }

      // Update Leaderboard for HighScore
      const existingLeaderboard = await prisma.leaderboard.findFirst({
        where: {
          userId: dbUser.id,
          gameId: game.id,
          category: "HighScore"
        }
      });

      if (existingLeaderboard) {
        if (score > existingLeaderboard.score) {
          await prisma.leaderboard.update({
            where: { id: existingLeaderboard.id },
            data: { score }
          });
        }
      } else {
        await prisma.leaderboard.create({
          data: {
            userId: dbUser.id,
            gameId: game.id,
            category: "HighScore",
            score
          }
        });
      }
    }

    // Calculate new stats
    const currentXp = dbUser.profile.xp + xpEarned;
    const currentCoins = dbUser.profile.coins + coinsEarned;
    const currentTrees = dbUser.profile.treesPlanted + treesPlanted;

    // Simple Leveling System: 1 level per 1000 XP
    const newLevel = Math.floor(currentXp / 1000) + 1;

    // Update Profile
    const updatedProfile = await prisma.profile.update({
      where: { userId: dbUser.id },
      data: {
        xp: currentXp,
        coins: currentCoins,
        treesPlanted: currentTrees,
        level: newLevel,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Failed to sync game progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
