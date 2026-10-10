import Link from "next/link";
import { Clock, BookOpen, ChevronRight } from "lucide-react";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  thumbnail: string;
  progress?: number;
}

export function CourseCard({ id, title, description, category, difficulty, duration, thumbnail, progress }: CourseCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner":
        return "bg-green-50 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <Link href={`/courses/${id}`} className="group flex flex-col bg-white rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(67,201,123,0.15)] hover:border-primary/20 transition-all duration-300 hover:-translate-y-2 overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <Image 
          src={thumbnail} 
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black shadow-sm text-[#1A4331]">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow bg-white">
        <div className="flex gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getDifficultyColor(difficulty)}`}>
            {difficulty}
          </span>
          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-50 text-slate-600 border border-slate-100 flex items-center gap-1">
            <Clock size={12} /> {duration}
          </span>
        </div>
        
        <h3 className="text-xl font-black text-[#1A4331] mb-2 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#1A4331]/70 font-medium line-clamp-2 mb-6 flex-grow leading-relaxed">
          {description}
        </p>

        {progress !== undefined ? (
          <div className="mt-auto">
            <div className="flex justify-between items-end mb-2 text-sm font-bold">
              <span className="text-[#1A4331]">Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-primary font-bold">
            <span className="flex items-center gap-2 text-sm"><BookOpen size={18} /> View Course</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <ChevronRight size={16} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
