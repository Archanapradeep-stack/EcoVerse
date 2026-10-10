"use client";

import { motion } from "framer-motion";
import { TreePine } from "lucide-react";
import { GameCard } from "./GameCard";

interface EcoForestProps {
  xp: number;
}

export function EcoForest({ xp }: EcoForestProps) {
  const totalTrees = Math.min(Math.floor(xp / 100) || 1, 30);
  const treesArray = Array.from({ length: totalTrees });

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, scale: 0, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.6 } }
  };

  return (
    <GameCard className="bg-gradient-to-b from-[#CFF7E3] to-[#A8E6CF] h-full flex flex-col relative overflow-hidden group">
      <div className="p-6 md:p-8 flex justify-between items-center relative z-20">
        <div>
          <h2 className="text-2xl font-black text-[#1A4331] flex items-center gap-2 drop-shadow-sm">
            <TreePine className="text-[#43C97B]" /> Eco Forest
          </h2>
          <p className="text-sm font-bold text-[#4B6B58]">Level up to grow your ecosystem</p>
        </div>
        <div className="bg-white/50 backdrop-blur-md text-[#1A4331] border border-white font-black px-4 py-2 rounded-xl shadow-sm">
          {totalTrees} Trees
        </div>
      </div>

      {/* Sun glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 z-0"></div>

      {/* The Forest Grid */}
      <motion.div 
        variants={container} 
        initial="hidden" 
        whileInView="show"
        viewport={{ once: true }}
        className="flex-grow flex flex-wrap content-end gap-2 relative z-10 p-6 pt-20"
      >
        {treesArray.map((_, i) => {
          const scale = 0.7 + Math.random() * 0.6;
          const isDark = Math.random() > 0.5;
          const zIndex = Math.floor(Math.random() * 10);
          
          return (
            <motion.div 
              key={i} 
              variants={item} 
              className="flex justify-center items-end -ml-4 first:ml-0"
              style={{ originY: 1, zIndex }}
            >
              <svg 
                width="40" 
                height="50" 
                viewBox="0 0 40 50" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: `scale(${scale})` }}
                className="drop-shadow-md transition-transform hover:scale-125 hover:-translate-y-2 cursor-pointer duration-300"
              >
                <path d="M20 5L35 30H25L30 40H10L15 30H5L20 5Z" fill={isDark ? "#2D9A5D" : "#43C97B"} />
                <rect x="17" y="40" width="6" height="10" fill="#78350F" />
                <path d="M20 5L20 40" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
              </svg>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Floating Butterflies (CSS Animation) */}
      <motion.div 
        animate={{ y: [0, -20, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
        className="absolute bottom-20 left-10 z-20"
      >
        <span className="text-xl filter drop-shadow-md opacity-80">🦋</span>
      </motion.div>
      <motion.div 
        animate={{ y: [0, 15, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
        className="absolute top-32 right-16 z-20"
      >
        <span className="text-sm filter drop-shadow-md opacity-80">🦋</span>
      </motion.div>

      {/* Ground layer */}
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#43C97B]/40 to-transparent z-10 backdrop-blur-[2px]"></div>
    </GameCard>
  );
}
