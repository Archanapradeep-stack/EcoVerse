"use client";

import { motion } from "framer-motion";
import { GameCard } from "./GameCard";
import { Leaf, Droplet, Sun, Wind, Recycle } from "lucide-react";

const ACHIEVEMENTS = [
  { id: 1, title: "Forest Guardian", icon: <Leaf size={24} />, unlocked: true, color: "text-green-500", bg: "bg-green-100" },
  { id: 2, title: "Ocean Saver", icon: <Droplet size={24} />, unlocked: true, color: "text-blue-500", bg: "bg-blue-100" },
  { id: 3, title: "Energy Expert", icon: <Sun size={24} />, unlocked: false, color: "text-yellow-500", bg: "bg-yellow-100" },
  { id: 4, title: "Climate Warrior", icon: <Wind size={24} />, unlocked: false, color: "text-slate-500", bg: "bg-slate-100" },
  { id: 5, title: "Recycling Master", icon: <Recycle size={24} />, unlocked: false, color: "text-slate-500", bg: "bg-slate-100" },
];

export function AchievementsGrid() {
  return (
    <GameCard className="p-6 bg-white/70 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black text-foreground">
          Badges Collection
        </h2>
        <span className="text-xs font-bold text-slate-500">2 / 5 Unlocked</span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide relative z-10 snap-x">
        {ACHIEVEMENTS.map((badge, idx) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, type: "spring" }}
            className={`flex-shrink-0 w-24 h-28 rounded-2xl flex flex-col items-center justify-center p-2 text-center snap-center relative group cursor-pointer
              ${badge.unlocked ? `${badge.bg} border-2 border-white shadow-md hover:shadow-lg` : 'bg-slate-50 border-2 border-dashed border-slate-200 opacity-60'}
            `}
          >
            {badge.unlocked && (
               <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
            <div className={`mb-2 ${badge.color} drop-shadow-sm`}>
              {badge.icon}
            </div>
            <span className={`text-[10px] font-black leading-tight ${badge.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
              {badge.title}
            </span>
          </motion.div>
        ))}
      </div>
    </GameCard>
  );
}
