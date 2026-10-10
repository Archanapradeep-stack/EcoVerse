import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { QuizComponent } from "@/components/learning/QuizComponent";

export default async function QuizPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  
  const { courseId, lessonId } = await params;

  let quiz;
  try {
    quiz = await prisma.quiz.findUnique({
      where: { lessonId: lessonId },
      include: {
        lesson: true,
        questions: true
      }
    });
  } catch (error) {
    return notFound();
  }

  if (!quiz || quiz.lesson.courseId !== courseId) {
    return notFound();
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-black mb-4">Quiz coming soon!</h1>
        <p className="text-text-secondary">We are currently preparing questions for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-foreground mb-2">Knowledge Check</h1>
        <p className="text-text-secondary font-medium text-lg">
          Let&apos;s see what you learned in <span className="font-bold text-primary">{quiz.lesson.title}</span>
        </p>
      </div>

      <QuizComponent 
        quizId={quiz.id}
        courseId={courseId}
        questions={quiz.questions}
        xpReward={quiz.xpReward}
        coinReward={quiz.coinReward}
      />
    </div>
  );
}
