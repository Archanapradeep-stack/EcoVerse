"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AnimatedHeroProps {
  name: string;
  uncompletedMissionsCount: number;
}

export function AnimatedHero({ name, uncompletedMissionsCount }: AnimatedHeroProps) {
  return (
    <div className="relative w-full h-64 md:h-80 rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-200 via-teal-100 to-green-200 border-4 border-white shadow-xl flex items-center p-8 md:p-12 mb-8">
      
      {/* Decorative Background Elements */}
      <motion.div 
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute top-10 right-20 w-32 h-16 bg-white/40 rounded-full blur-xl"
      />
      
      <motion.div 
        animate={{ x: [0, -30, 0], y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 12, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 w-48 h-24 bg-white/30 rounded-full blur-2xl"
      />

      {/* SVG Earth/Eco Illustration */}
      <div className="absolute right-[-10%] md:right-10 top-1/2 -translate-y-1/2 opacity-30 md:opacity-100 pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
        >
          <svg width="250" height="250" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="4"/>
            <path d="M40 90C60 70 90 80 100 100C110 120 140 100 160 110C170 140 130 160 100 170C70 180 30 140 40 90Z" fill="#34D399" />
            <path d="M120 40C140 50 160 40 170 60C180 80 150 90 140 100C130 110 110 90 120 40Z" fill="#34D399" />
          </svg>
        </motion.div>
        
        {/* Floating Leaves */}
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute -top-4 -left-8"
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#10B981"><path d="M17 8C8 10 5 16 5 16C5 16 7 13 12 11C15 10 17 8 17 8Z"/></svg>
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [15, -15, 15] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-4 right-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#34D399"><path d="M17 8C8 10 5 16 5 16C5 16 7 13 12 11C15 10 17 8 17 8Z"/></svg>
        </motion.div>
      </div>

      {/* Content Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative z-10 bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-white/80 shadow-lg max-w-xl"
      >
        <div className="flex items-center gap-3 mb-2 text-primary font-bold">
          <Sparkles className="w-5 h-5" />
          <span>EcoVerse Hero</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-4 tracking-tight">
          Welcome back,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-green-500">{name}!</span>
        </h1>
        <p className="text-lg font-medium text-slate-700">
          {uncompletedMissionsCount > 0 
            ? `Your forest needs you! You have ${uncompletedMissionsCount} daily missions waiting today.`
            : "Amazing job! You've completed all daily missions. Keep exploring!"}
        </p>
      </motion.div>
    </div>
  );
}
