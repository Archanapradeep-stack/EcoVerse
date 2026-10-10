import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Brain, CheckCircle } from "lucide-react";

export default async function LearnLessonPage({ params }: { params: Promise<{ courseId: string, lessonId: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  
  const { courseId, lessonId } = await params;

  let lesson;
  try {
    lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: true,
        quiz: true
      }
    });
  } catch (error) {
    return notFound();
  }

  if (!lesson || lesson.courseId !== courseId) {
    return notFound();
  }

  // Parse rich content (assuming it's a stringified JSON array of blocks)
  let blocks: any[] = [];
  try {
    const parsed = JSON.parse(lesson.content);
    if (parsed && parsed.blocks) {
      blocks = parsed.blocks;
    } else {
      blocks = [{ type: 'text', content: lesson.content }];
    }
  } catch (e) {
    blocks = [{ type: 'text', content: lesson.content }];
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <Link 
        href={`/courses/${courseId}`}
        className="inline-flex items-center gap-2 text-text-secondary hover:text-primary font-bold mb-8 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Course
      </Link>

      <div className="mb-10">
        <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
          Lesson {lesson.order}
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
          {lesson.title}
        </h1>
      </div>

      <div className="space-y-8 text-lg text-slate-700 leading-relaxed font-medium">
        {blocks.map((block, idx) => {
          if (block.type === 'text') {
            return <p key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-border">{block.content}</p>;
          }
          if (block.type === 'image') {
            return (
              <div key={idx} className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-md my-8">
                <Image src={block.url} alt={block.caption || 'Lesson image'} fill className="object-cover" />
                {block.caption && (
                  <div className="absolute bottom-0 w-full bg-black/50 backdrop-blur-sm text-white p-3 text-sm text-center">
                    {block.caption}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Completion & Next Steps */}
      <div className="mt-16 bg-primary/10 border-2 border-primary/20 rounded-3xl p-8 text-center flex flex-col items-center">
        <CheckCircle className="text-primary w-16 h-16 mb-4" />
        <h2 className="text-2xl font-black mb-2">Lesson Completed!</h2>
        <p className="text-text-secondary mb-8">Ready to test your knowledge and earn XP?</p>
        
        {lesson.quiz ? (
          <Link 
            href={`/courses/${courseId}/quiz/${lesson.id}`}
            className="bg-primary hover:bg-primary/90 text-white font-black text-xl px-10 py-4 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
          >
            <Brain size={28} /> Take the Quiz
          </Link>
        ) : (
          <Link 
            href={`/courses/${courseId}`}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Return to Syllabus
          </Link>
        )}
      </div>
    </div>
  );
}
