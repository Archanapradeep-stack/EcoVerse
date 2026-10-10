"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GameError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Game crash:", error);
  }, [error]);

  return (
    <div className="absolute inset-0 bg-[#0F172A] flex items-center justify-center p-4 z-[200]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-black/40 backdrop-blur-xl border border-red-500/30 p-10 rounded-[2.5rem] max-w-lg w-full text-center shadow-[0_0_80px_rgba(239,68,68,0.2)]"
      >
        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-500/50">
          <AlertTriangle className="text-red-500" size={48} />
        </div>
        
        <h2 className="text-3xl font-black italic text-white mb-2 tracking-tighter">GAME CRASHED</h2>
        <p className="text-white/60 mb-8 font-medium">
          We hit a snag loading the game assets. Don't worry, your progress is safe!
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => reset()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-black hover:scale-105 shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-transform flex justify-center items-center gap-2"
          >
            <RotateCcw size={20} /> TRY AGAIN
          </button>
          
          <Link
            href="/games"
            className="w-full py-4 rounded-2xl border-2 border-white/10 text-white font-black hover:bg-white/10 transition-colors flex justify-center items-center gap-2"
          >
            <Home size={20} /> BACK TO GAMES
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
