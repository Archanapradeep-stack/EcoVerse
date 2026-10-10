"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface GameOverScreenProps {
  score: number;
  xpEarned: number;
  coinsEarned: number;
  treesPlanted?: number;
  accuracy?: number;
  gameId: string;
  onPlayAgain: () => void;
}

export default function GameOverScreen({
  score,
  xpEarned,
  coinsEarned,
  treesPlanted = 0,
  accuracy,
  gameId,
  onPlayAgain,
}: GameOverScreenProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  // Play a sound when the game over screen mounts
  useEffect(() => {
    const audio = new Audio("/audio/sfx-success.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  }, []);

  const handleSaveAndReturn = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/user/sync-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId,
          score,
          xpEarned,
          coinsEarned,
          treesPlanted,
        }),
      });
      router.refresh();
      router.push("/games");
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="relative bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/10 p-10 rounded-[2.5rem] max-w-lg w-full shadow-[0_0_80px_rgba(59,130,246,0.3)] text-center overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/30 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-green-500/30 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <h2 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 drop-shadow-lg">
            STAGE CLEARED
          </h2>
          <p className="text-white/60 mb-10 font-bold uppercase tracking-widest text-sm">Outstanding Performance</p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner">
              <div className="text-white/50 text-xs font-black uppercase mb-1">Final Score</div>
              <div className="text-4xl font-black text-white drop-shadow-md">{score}</div>
            </motion.div>
            
            {treesPlanted > 0 ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner">
                <div className="text-white/50 text-xs font-black uppercase mb-1">Trees Planted</div>
                <div className="text-4xl font-black text-green-400 drop-shadow-md">{treesPlanted}</div>
              </motion.div>
            ) : accuracy !== undefined ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner">
                <div className="text-white/50 text-xs font-black uppercase mb-1">Accuracy</div>
                <div className="text-4xl font-black text-blue-400 drop-shadow-md">{accuracy}%</div>
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 rounded-3xl p-5 border border-white/10 shadow-inner flex items-center justify-center">
                 <div className="text-white/30 text-xs font-black uppercase">-</div>
              </motion.div>
            )}

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-blue-500/20 to-transparent rounded-3xl p-5 border border-blue-500/30 shadow-inner">
              <div className="text-blue-300/80 text-xs font-black uppercase mb-1">XP Earned</div>
              <div className="text-3xl font-black text-blue-400 drop-shadow-md">+{xpEarned}</div>
            </motion.div>
            
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-yellow-500/20 to-transparent rounded-3xl p-5 border border-yellow-500/30 shadow-inner">
              <div className="text-yellow-300/80 text-xs font-black uppercase mb-1">Coins Found</div>
              <div className="text-3xl font-black text-yellow-400 drop-shadow-md">+{coinsEarned}</div>
            </motion.div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onPlayAgain}
              className="flex-1 py-4 rounded-2xl border-2 border-white/10 text-white font-black hover:bg-white/5 transition-colors shadow-lg"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={handleSaveAndReturn}
              disabled={isSaving}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-600 text-white font-black hover:scale-105 shadow-[0_0_30px_rgba(52,211,153,0.4)] transition-transform flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : "COLLECT REWARDS"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
