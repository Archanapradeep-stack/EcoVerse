"use client"

import { motion } from "framer-motion";
import { BookOpen, Leaf, Zap, Droplets, Trash2, Globe, Search, Filter } from "lucide-react";
import AppLayout, { ProfileData } from "../layout/AppLayout";
import { CourseCard } from "./CourseCard";

type CoursesUIProps = {
  profile: ProfileData;
  firstName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  role: string;
  courses: any[];
};

const categories = [
  { name: "All", icon: <Globe size={18} /> },
  { name: "Climate Change", icon: <Leaf size={18} /> },
  { name: "Pollution", icon: <Trash2 size={18} /> },
  { name: "Biodiversity", icon: <Leaf size={18} /> },
  { name: "Waste Management", icon: <Trash2 size={18} /> },
  { name: "Water Conservation", icon: <Droplets size={18} /> },
  { name: "Renewable Energy", icon: <Zap size={18} /> },
  { name: "Sustainable Living", icon: <Leaf size={18} /> },
];

export default function CoursesUI({ profile, firstName, fullName, imageUrl, role, courses }: CoursesUIProps) {
  const container: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout profile={profile} firstName={firstName} fullName={fullName} imageUrl={imageUrl} role={role} activePath="/courses">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-24">
        
        {/* HEADER SECTION */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 border border-primary/20 shadow-sm">
            <BookOpen size={28} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1A4331] mb-4">
            Eco<span className="text-primary">Courses</span>
          </h1>
          <p className="text-lg text-[#1A4331]/70 font-medium">
            Dive into our curated learning modules and start making a real impact today. Master sustainability, one step at a time.
          </p>
        </motion.div>

        {/* FILTERS */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex gap-3 overflow-x-auto pb-6 mb-4 custom-scrollbar snap-x">
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap snap-start transition-all shadow-sm
                ${idx === 0 
                  ? 'bg-primary text-white border-transparent' 
                  : 'bg-white text-[#1A4331] border border-gray-100 hover:border-primary/50 hover:shadow-md'
                }`}
            >
              <span className={idx === 0 ? "text-white" : "text-primary"}>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </motion.div>

        <motion.div variants={container} initial="hidden" animate="show">
          {courses.length === 0 ? (
            <motion.div variants={item} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] p-12 text-center max-w-2xl mx-auto mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <BookOpen className="w-16 h-16 mx-auto text-primary/40 mb-4" />
              <h2 className="text-2xl font-black text-[#1A4331] mb-2">No courses found</h2>
              <p className="text-[#1A4331]/70 mb-6 font-medium">
                We are currently updating our course library. Please check back soon!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <motion.div key={course.id} variants={item}>
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    category={course.category}
                    difficulty={course.difficulty}
                    duration={course.duration}
                    thumbnail={course.thumbnail}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
        
      </div>
    </AppLayout>
  );
}
