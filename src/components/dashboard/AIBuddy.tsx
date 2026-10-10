"use client";

import { motion } from "framer-motion";
import { Brain, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AIBuddyProps {
  recommendedTopic: string | null;
}

export function AIBuddy({ recommendedTopic }: AIBuddyProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-indigo-100 shadow-sm relative overflow-hidden group h-full flex flex-col items-center text-center justify-center">
      
      {/* Animated Robot Mascot */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="relative z-10 mb-4 cursor-pointer"
        whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Antenna */}
          <line x1="50" y1="20" x2="50" y2="10" stroke="#818CF8" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="50" cy="8" r="4" fill="#FBBF24" />
          
          {/* Head */}
          <rect x="25" y="20" width="50" height="40" rx="12" fill="#E0E7FF" stroke="#6366F1" strokeWidth="4" />
          
          {/* Eyes */}
          <motion.circle 
            animate={{ scaleY: [1, 0.1, 1], scaleX: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1], repeatDelay: 3 }}
            cx="40" cy="35" r="5" fill="#4F46E5" 
          />
          <motion.circle 
            animate={{ scaleY: [1, 0.1, 1], scaleX: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 4, times: [0, 0.05, 0.1], repeatDelay: 3 }}
            cx="60" cy="35" r="5" fill="#4F46E5" 
          />
          
          {/* Screen/Mouth */}
          <rect x="35" y="45" width="30" height="8" rx="4" fill="#818CF8" />
          <path d="M40 49H60" stroke="#E0E7FF" strokeWidth="2" strokeLinecap="round" />
          
          {/* Body */}
          <path d="M35 60L30 85C30 90 35 95 40 95H60C65 95 70 90 70 85L65 60H35Z" fill="#C7D2FE" stroke="#6366F1" strokeWidth="4" strokeLinejoin="round" />
          
          {/* Badge */}
          <circle cx="50" cy="75" r="8" fill="#34D399" />
          <path d="M47 75L49 77L53 73" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* Speech Bubble */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100 relative w-full"
      >
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-indigo-100 rotate-45"></div>
        
        <h2 className="text-lg font-black mb-1 flex items-center justify-center gap-1 text-indigo-900 relative z-10">
          <Brain className="text-indigo-500 w-4 h-4"/> EcoBuddy
        </h2>
        
        {recommendedTopic ? (
          <div className="relative z-10">
            <p className="text-indigo-700 font-medium text-sm mb-3">
              Based on your recent quizzes, I recommend reviewing:
            </p>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100/50 mb-3">
              <h3 className="font-bold text-md text-indigo-900">{recommendedTopic}</h3>
            </div>
            <Link href="/courses" className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors w-full">
              Find Lessons <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="relative z-10">
            <p className="text-indigo-700 font-medium text-sm mb-3">
              Complete more quizzes so I can give you personalized learning recommendations!
            </p>
            <Link href="/courses" className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors w-full">
              Explore Courses <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
