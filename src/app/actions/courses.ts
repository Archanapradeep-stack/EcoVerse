"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitQuizResult(
  courseId: string, 
  quizId: string, 
  scorePercent: number, 
  weakTopics: string[],
  xpReward: number,
  coinReward: number
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await prisma.user.findFirst({
      where: { clerkId: userId },
      include: { profile: true }
    });

    if (!user || !user.profile) throw new Error("User profile not found");

    const passed = scorePercent >= 60;

    // Record the Quiz Result
    await prisma.quizResult.create({
      data: {
        userId: user.id,
        quizId: quizId,
        score: scorePercent,
        weakTopics: weakTopics
      }
    });

    // Update Progress
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
    const lessonId = quiz?.lessonId;

    if (lessonId && passed) {
      const progress = await prisma.courseProgress.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: courseId } }
      });

      if (!progress) {
        await prisma.courseProgress.create({
          data: {
            userId: user.id,
            courseId: courseId,
            completedLessons: [lessonId],
            percentComplete: 10, // simplified, ideally dynamic based on total lessons
          }
        });
      } else if (!progress.completedLessons.includes(lessonId)) {
        await prisma.courseProgress.update({
          where: { id: progress.id },
          data: {
            completedLessons: { push: lessonId },
            percentComplete: Math.min(progress.percentComplete + 10, 100) // simplified logic
          }
        });
      }
    }

    // Award XP and Coins if passed
    if (passed) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: {
          xp: { increment: xpReward },
          coins: { increment: coinReward },
          currentCourse: courseId // Set this as their most recently active course
        }
      });
    }

    revalidatePath("/dashboard/student");
    revalidatePath(`/courses/${courseId}`);
    return { success: true };

  } catch (error) {
    console.error("Error submitting quiz result:", error);
    throw new Error("Failed to submit quiz");
  }
}
