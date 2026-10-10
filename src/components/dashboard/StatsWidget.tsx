"use client";

import { motion } from "framer-motion";
import { Sparkles, Star, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface StatsWidgetProps {
  level: number;
  xp: number;
  coins: number;
}

// Custom hook to animate numbers counting up
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

export function StatsWidget({ level, xp, coins }: StatsWidgetProps) {
  const animatedXP = useCountUp(xp);
  const animatedCoins = useCountUp(coins);

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", bounce: 0.5 } }
  };

  return (
    <motion.div 
      variants={container} 
      initial="hidden" 
      animate="show" 
      className="grid grid-cols-3 gap-4 mb-8"
    >
      <motion.div variants={item} className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-3xl border-2 border-blue-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 bg-blue-200 w-16 h-16 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        <ShieldCheck className="text-blue-500 w-10 h-10 mb-2 relative z-10" />
        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider relative z-10">Level</span>
        <span className="text-3xl font-black text-blue-900 relative z-10">{level}</span>
      </motion.div>

      <motion.div variants={item} className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-3xl border-2 border-purple-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 bg-purple-200 w-16 h-16 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        <Sparkles className="text-purple-500 w-10 h-10 mb-2 relative z-10" />
        <span className="text-sm font-bold text-purple-600 uppercase tracking-wider relative z-10">Total XP</span>
        <span className="text-3xl font-black text-purple-900 relative z-10">{animatedXP.toLocaleString()}</span>
      </motion.div>

      <motion.div variants={item} className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-3xl border-2 border-yellow-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 bg-yellow-200 w-16 h-16 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
        <Star className="text-yellow-500 w-10 h-10 mb-2 relative z-10" />
        <span className="text-sm font-bold text-yellow-600 uppercase tracking-wider relative z-10">Coins</span>
        <span className="text-3xl font-black text-yellow-900 relative z-10">{animatedCoins.toLocaleString()}</span>
      </motion.div>
    </motion.div>
  );
}
