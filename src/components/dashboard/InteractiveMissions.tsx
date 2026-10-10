"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ShieldCheck, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface Mission {
  id: number;
  title: string;
  completed: boolean;
}

interface InteractiveMissionsProps {
  initialMissions: Mission[];
}

export function InteractiveMissions({ initialMissions }: InteractiveMissionsProps) {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);

  const toggleMission = (id: number) => {
    setMissions(prev => {
      const newMissions = prev.map(m => {
        if (m.id === id && !m.completed) {
          // Trigger confetti if completing
          const rect = document.getElementById(`mission-${id}`)?.getBoundingClientRect();
          if (rect) {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: {
                x: (rect.left + rect.width / 2) / window.innerWidth,
                y: (rect.top + rect.height / 2) / window.innerHeight
              },
              colors: ['#FBBF24', '#34D399', '#60A5FA']
            });
          }
          return { ...m, completed: true };
        }
        return m;
      });
      return newMissions;
    });
    
    // In a real app, you would dispatch a Server Action here to save the state
    // e.g. await saveMissionState(id, true);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border-2 border-border shadow-sm flex-grow h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black flex items-center gap-2 text-foreground">
          <Trophy className="text-yellow-500 w-6 h-6"/> Daily Missions
        </h2>
        <span className="text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
          Resets in 12h
        </span>
      </div>

      <div className="space-y-3 flex-grow">
        <AnimatePresence>
          {missions.map((mission) => (
            <motion.div
              key={mission.id}
              id={`mission-${mission.id}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => toggleMission(mission.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group overflow-hidden
                ${mission.completed 
                  ? 'bg-slate-50 border-slate-200' 
                  : 'bg-white border-yellow-200 hover:border-yellow-400 hover:shadow-md'
                }`}
            >
              {/* Progress fill animation on complete */}
              {mission.completed && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute left-0 top-0 h-full bg-slate-100 origin-left"
                />
              )}

              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300
                ${mission.completed 
                  ? 'bg-green-100 text-green-500 scale-110' 
                  : 'bg-slate-100 text-slate-300 group-hover:bg-yellow-100 group-hover:text-yellow-500'
                }`}
              >
                {mission.completed ? <ShieldCheck size={18} /> : <Check size={16} strokeWidth={3} />}
              </div>
              
              <span className={`relative z-10 font-bold transition-all duration-300 flex-grow
                ${mission.completed ? 'text-slate-400 line-through' : 'text-slate-700 group-hover:text-slate-900'}
              `}>
                {mission.title}
              </span>
              
              {!mission.completed && (
                <span className="relative z-10 text-xs font-bold text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  +20 XP
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
