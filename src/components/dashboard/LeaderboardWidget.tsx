"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { GameCard } from "./GameCard";

const LEADERBOARD_DATA = [
  { rank: 1, name: "Arjun S.", xp: 12450, color: "bg-yellow-400" },
  { rank: 2, name: "Meera K.", xp: 11200, color: "bg-slate-300" },
  { rank: 3, name: "You", xp: 8500, color: "bg-orange-400" },
  { rank: 4, name: "Rohan P.", xp: 8200, color: "bg-transparent border-2 border-slate-200" },
];

export function LeaderboardWidget() {
  return (
    <GameCard className="p-6 bg-white/70 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Trophy className="text-yellow-500" /> Weekly Rankings
        </h2>
        <span className="text-xs font-bold text-accent cursor-pointer hover:underline">View All</span>
      </div>

      <div className="space-y-3 relative z-10 flex-grow">
        {LEADERBOARD_DATA.map((user, idx) => (
          <motion.div 
            key={user.rank}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-2xl ${user.name === "You" ? "bg-accent/10 border border-accent/30" : "hover:bg-slate-50 transition-colors"}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm ${user.color} ${user.name !== "You" && user.rank > 3 ? "text-slate-500" : "text-white"}`}>
                {user.rank}
              </div>
              <span className={`font-bold ${user.name === "You" ? "text-accent" : "text-foreground"}`}>
                {user.name}
              </span>
            </div>
            <span className="font-bold text-sm text-slate-500">{user.xp.toLocaleString()} XP</span>
          </motion.div>
        ))}
      </div>
    </GameCard>
  );
}
