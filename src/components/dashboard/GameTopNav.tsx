"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Sparkles, Star, Flame } from "lucide-react";
import { useEffect, useState } from "react";

interface GameTopNavProps {
  level: number;
  xp: number;
  coins: number;
  streak?: number;
}

// Utility to animate numbers counting up
function useCountUp(end: number, duration: number = 2) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [end, duration]);

  return count;
}

export function GameTopNav({ level, xp, coins, streak = 5 }: GameTopNavProps) {
  const animatedXP = useCountUp(xp);
  const animatedCoins = useCountUp(coins);

  return (
    <motion.div 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
      className="sticky top-4 z-50 mx-auto w-fit mb-12"
    >
      <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-6 shadow-2xl border-white/50">
        
        {/* Level */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-gradient-to-br from-accent to-green-600 w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-white" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground/50 tracking-wider">Level</span>
            <span className="text-lg font-black text-foreground leading-none">{level}</span>
          </div>
        </div>

        <div className="w-[2px] h-8 bg-border/50"></div>

        {/* XP */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-gradient-to-br from-[#79C8FF] to-blue-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative">
            <Sparkles className="text-white" size={20} />
            <motion.div 
              className="absolute inset-0 bg-white rounded-full opacity-50"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground/50 tracking-wider">Total XP</span>
            <span className="text-lg font-black text-foreground leading-none">{animatedXP.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-[2px] h-8 bg-border/50"></div>

        {/* Coins */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="bg-gradient-to-br from-[#FFD66B] to-orange-400 w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Star className="text-white" size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground/50 tracking-wider">Coins</span>
            <span className="text-lg font-black text-foreground leading-none">{animatedCoins.toLocaleString()}</span>
          </div>
        </div>

        <div className="w-[2px] h-8 bg-border/50"></div>

        {/* Streak */}
        <div className="flex items-center gap-2 group cursor-pointer pr-2">
          <div className="bg-gradient-to-br from-[#FFBFAE] to-red-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Flame className="text-white" size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-foreground/50 tracking-wider">Streak</span>
            <span className="text-lg font-black text-foreground leading-none">{streak} Days</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
