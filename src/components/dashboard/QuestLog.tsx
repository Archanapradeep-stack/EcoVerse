"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import { GameCard } from "./GameCard";

interface Quest {
  id: number;
  title: string;
  completed: boolean;
  xpReward: number;
  icon: string;
}

interface QuestLogProps {
  initialQuests: { id: number; title: string; completed: boolean }[];
}

export function QuestLog({ initialQuests }: QuestLogProps) {
  // Enhance initial missions into "Quests"
  const [quests, setQuests] = useState<Quest[]>(
    initialQuests.map((q, i) => ({
      ...q,
      xpReward: (i + 1) * 20,
      icon: ["🌱", "♻️", "💧", "🌍", "☀️"][i % 5]
    }))
  );

  const completeQuest = (id: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id && !q.completed) {
        // Find DOM element for confetti origin
        const el = document.getElementById(`quest-${id}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          confetti({
            particleCount: 60,
            spread: 70,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight
            },
            colors: ['#43C97B', '#79C8FF', '#FFD66B']
          });
        }
        return { ...q, completed: true };
      }
      return q;
    }));
  };

  return (
    <GameCard className="p-6 md:p-8 flex flex-col h-full bg-white/70">
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="text-accent" /> Daily Quests
        </h2>
        <div className="bg-primary/20 text-foreground font-bold px-3 py-1 rounded-full text-xs">
          Resets in 12h
        </div>
      </div>

      <div className="space-y-4 flex-grow relative z-10">
        <AnimatePresence>
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              id={`quest-${quest.id}`}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={!quest.completed ? { scale: 1.02 } : {}}
              onClick={() => completeQuest(quest.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 overflow-hidden group
                ${quest.completed 
                  ? 'bg-muted/50 border-border/50 opacity-60' 
                  : 'bg-white border-accent/30 shadow-md hover:border-accent hover:shadow-accent/20'
                }`}
            >
              {quest.completed && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full bg-accent/10 origin-left z-0"
                />
              )}

              <div className="text-3xl relative z-10 filter drop-shadow-sm group-hover:scale-110 transition-transform">
                {quest.icon}
              </div>
              
              <div className="flex-grow relative z-10">
                <h3 className={`font-bold text-lg ${quest.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {quest.title}
                </h3>
                {!quest.completed && (
                  <p className="text-accent font-bold text-sm flex items-center gap-1">
                    +{quest.xpReward} XP
                  </p>
                )}
              </div>
              
              <div className="relative z-10">
                {quest.completed ? (
                  <CheckCircle2 className="text-accent w-8 h-8" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <ChevronRight />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GameCard>
  );
}
