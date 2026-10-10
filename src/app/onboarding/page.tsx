"use client"

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap } from "lucide-react";


export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  // If user already has a role, redirect them
  if (isLoaded && user?.publicMetadata?.role) {
    const role = user.publicMetadata.role as string;
    router.push(`/dashboard/${role.toLowerCase()}`);
    return null;
  }

  const handleRoleSelection = async (role: "STUDENT" | "TEACHER") => {
    setIsUpdating(true);
    try {
      // In a real app, this would hit an API route that updates Prisma DB
      // and then syncs back to Clerk metadata.
      await user?.update({
        unsafeMetadata: { role }
      });
      
      // We will pretend we hit the DB, and just redirect based on role
      router.push(`/dashboard/${role.toLowerCase()}`);
    } catch (error) {
      console.error("Error setting role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border-2 border-border/50 rounded-[2rem] p-8 md:p-12 shadow-xl text-center"
      >
        <h1 className="text-3xl md:text-4xl font-black mb-4">Welcome to EcoVerse!</h1>
        <p className="text-text-secondary text-lg mb-10 font-medium">
          To personalize your gamified learning experience, please tell us how you will be using the platform.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <button 
            onClick={() => handleRoleSelection("STUDENT")}
            disabled={isUpdating}
            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-border/50 bg-muted hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1 transition-all"
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform text-primary">
              <BookOpen size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Student</h2>
            <p className="text-sm text-text-secondary font-medium">I want to play games, complete missions, and learn.</p>
          </button>

          <button 
            onClick={() => handleRoleSelection("TEACHER")}
            disabled={isUpdating}
            className="group relative flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-border/50 bg-muted hover:border-accent/50 hover:bg-accent/5 hover:-translate-y-1 transition-all"
          >
            <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform text-accent">
              <GraduationCap size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Teacher</h2>
            <p className="text-sm text-text-secondary font-medium">I want to track student progress and assign missions.</p>
          </button>
        </div>

        {isUpdating && <p className="text-sm font-bold text-primary animate-pulse">Setting up your profile...</p>}
      </motion.div>
    </div>
  );
}
