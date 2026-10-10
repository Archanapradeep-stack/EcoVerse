"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface GameWrapperProps {
  title: string;
  instructions: string;
  gameState: "MENU" | "COUNTDOWN" | "PLAYING" | "GAMEOVER";
  setGameState: (state: "MENU" | "COUNTDOWN" | "PLAYING" | "GAMEOVER") => void;
  onGameStart: () => void;
  children: ReactNode;
}

export default function GameWrapper({
  title,
  instructions,
  gameState,
  setGameState,
  onGameStart,
  children,
}: GameWrapperProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "COUNTDOWN") {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameState("PLAYING");
            onGameStart();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      timer = interval;
    }
    return () => clearInterval(timer);
  }, [gameState, setGameState, onGameStart]);

  return (
    <div className="relative w-full h-full min-h-[600px] max-h-[800px] bg-[#1a1a1a] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-white/10 m-4 flex flex-col">
      {/* Back Button (Always Visible) */}
      <div className="absolute top-6 left-6 z-50 pointer-events-auto">
        <button
          onClick={() => router.push("/games")}
          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative flex flex-col">
        {/* The Game Engine (always rendered so refs work, but hidden via z-index or opacity if needed, actually it's better to render it fully and just overlay menu) */}
        {children}

        {/* Menu Overlay */}
        <AnimatePresence>
          {gameState === "MENU" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-green-900 to-black flex items-center justify-center z-40"
            >
              <div className="text-center p-8 max-w-2xl">
                <h1 className="text-6xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl">
                  {title.split(' ').map((word, i) => (
                    <span key={i} className={i % 2 === 0 ? "text-white" : "text-green-400"}>
                      {word}{" "}
                    </span>
                  ))}
                </h1>
                <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl mb-10 shadow-xl">
                  <h3 className="text-xl font-bold text-green-300 mb-4 uppercase tracking-widest">How to Play</h3>
                  <p className="text-white/80 text-lg leading-relaxed whitespace-pre-line">
                    {instructions}
                  </p>
                </div>
                <button
                  onClick={() => setGameState("COUNTDOWN")}
                  className="bg-green-500 hover:bg-green-400 text-white px-12 py-5 rounded-full font-black text-2xl shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-transform hover:scale-110 flex items-center gap-3 mx-auto"
                >
                  <Play size={28} className="fill-white" /> START GAME
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {gameState === "COUNTDOWN" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-9xl font-black text-green-400 drop-shadow-[0_0_30px_rgba(74,222,128,0.8)]"
              >
                {countdown > 0 ? countdown : "GO!"}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
