import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen, CheckCircle2, PlayCircle, Lock } from "lucide-react";
import { getOrCreateDbUser } from "@/lib/user";

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { userId } = await auth();
  const { courseId } = await params;

  let course;
  try {
    course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });
  } catch (error) {
    console.error("DB error fetching course details:", error);
    return notFound();
  }

  if (!course) {
    return notFound();
  }

  // Fetch user progress if logged in
  let completedLessons: string[] = [];
  if (userId) {
    try {
      const clerkUser = await currentUser();
      const user = await getOrCreateDbUser(clerkUser);
      if (user) {
        const progress = await prisma.courseProgress.findFirst({
          where: { userId: user.id, courseId: course.id }
        });
        if (progress) {
          completedLessons = progress.completedLessons;
        }
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  }

  const firstIncompleteLesson = course.lessons.find(l => !completedLessons.includes(l.id)) || course.lessons[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Course Header */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border-2 border-border shadow-sm mb-12 flex flex-col md:flex-row gap-8 items-center">
        <div className="relative w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden bg-slate-100 shadow-md">
          <Image 
            src={course.thumbnail} 
            alt={course.title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="w-full md:w-1/2 flex flex-col items-start">
          <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm mb-4">
            {course.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-4">
            {course.title}
          </h1>
          <p className="text-text-secondary text-lg mb-6">
            {course.description}
          </p>
          
          <div className="flex gap-4 mb-8">
            <div className="bg-slate-100 rounded-xl px-4 py-2 font-bold text-sm text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-slate-500" />
              {course.duration}
            </div>
            <div className="bg-slate-100 rounded-xl px-4 py-2 font-bold text-sm text-slate-700">
              {course.difficulty}
            </div>
          </div>
          
          {course.lessons.length > 0 ? (
            <Link 
              href={`/courses/${course.id}/learn/${firstIncompleteLesson.id}`}
              className="bg-primary hover:bg-primary/90 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-md transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <PlayCircle size={24} />
              {completedLessons.length > 0 ? "Resume Course" : "Start Learning"}
            </Link>
          ) : (
             <button disabled className="bg-slate-200 text-slate-500 font-bold text-lg px-8 py-4 rounded-xl flex items-center gap-2">
               Lessons coming soon
             </button>
          )}
        </div>
      </div>

      {/* Syllabus */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
          <BookOpen className="text-primary" /> Course Syllabus
        </h2>
        
        <div className="space-y-4">
          {course.lessons.map((lesson, idx) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isLocked = idx > 0 && !completedLessons.includes(course.lessons[idx-1].id);
            
            return (
              <div 
                key={lesson.id} 
                className={`bg-white border-2 rounded-2xl p-5 flex items-center gap-4 transition-all
                  ${isCompleted ? 'border-green-200 shadow-sm' : 
                    isLocked ? 'border-border/50 opacity-60' : 'border-primary/30 shadow-md hover:border-primary'}`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${isCompleted ? 'bg-green-100 text-green-600' : 
                    isLocked ? 'bg-slate-100 text-slate-400' : 'bg-primary/10 text-primary'}`}
                >
                  {isCompleted ? <CheckCircle2 size={24} /> : 
                   isLocked ? <Lock size={20} /> : idx + 1}
                </div>
                
                <div className="flex-grow">
                  <h3 className={`font-bold text-lg ${isLocked ? 'text-slate-500' : 'text-foreground'}`}>
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-text-secondary flex items-center gap-2 mt-1">
                    <Clock size={14} /> ~10 mins
                  </p>
                </div>
                
                {!isLocked && (
                  <Link 
                    href={`/courses/${course.id}/learn/${lesson.id}`}
                    className={`font-bold px-4 py-2 rounded-lg transition-colors ${
                      isCompleted ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {isCompleted ? 'Review' : 'Start'}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
