"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Pause, Play, RotateCcw, X, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAudio } from "@/hooks/useAudio";

type GameState = "MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER";

type PremiumGameWrapperProps = {
  title: string;
  themeColor: string; // e.g. "from-green-500 to-emerald-700"
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onGameStart: () => void;
  onRestart: () => void;
  children: ReactNode;
  audio: ReturnType<typeof useAudio>;
};

export default function PremiumGameWrapper({
  title,
  themeColor,
  gameState,
  setGameState,
  onGameStart,
  onRestart,
  children,
  audio
}: PremiumGameWrapperProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  // Countdown logic
  useEffect(() => {
    if (gameState === "COUNTDOWN") {
      setCountdown(3);
      audio.playSfx("click");
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("PLAYING");
            audio.playSfx("success");
            audio.playBgm();
            onGameStart();
            return 0;
          }
          audio.playSfx("click");
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, setGameState, onGameStart, audio]);

  return (
    <div className={`relative w-full h-full max-w-6xl max-h-[850px] bg-[#0A0A0A] rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] border border-white/10 m-4 flex flex-col font-sans select-none`}>
      
      {/* GLOBAL HUD OVERLAY (Always visible on top of game) */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-50 pointer-events-none">
        
        {/* Left Side: Pause / Quit */}
        <div className="flex gap-3 pointer-events-auto">
          {gameState === "PLAYING" && (
            <button 
              onClick={() => {
                setGameState("PAUSED");
                audio.pauseBgm();
                audio.playSfx("click");
              }}
              className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors shadow-lg"
            >
              <Pause size={20} className="fill-white" />
            </button>
          )}
          
          {(gameState === "MENU" || gameState === "GAMEOVER") && (
            <button 
              onClick={() => router.push("/games")}
              className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors shadow-lg"
            >
              <Home size={20} />
            </button>
          )}
        </div>

        {/* Right Side: Audio Toggle */}
        <div className="flex gap-3 pointer-events-auto">
          <button 
            onClick={audio.toggleMute}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-colors shadow-lg"
          >
            {audio.isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* GAME CONTENT */}
      <div className="flex-1 relative z-10">
        {children}
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        
        {/* COUNTDOWN */}
        {gameState === "COUNTDOWN" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b ${themeColor} drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]`}
              style={{ WebkitTextStroke: "2px white" }}
            >
              {countdown > 0 ? countdown : "GO!"}
            </motion.div>
          </motion.div>
        )}

        {/* PAUSE MENU */}
        {gameState === "PAUSED" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-white/10 p-10 rounded-[32px] w-full max-w-sm shadow-2xl flex flex-col gap-4"
            >
              <h2 className="text-3xl font-black text-white text-center mb-6 tracking-tight">PAUSED</h2>
              
              <button 
                onClick={() => {
                  setGameState("PLAYING");
                  audio.playBgm();
                  audio.playSfx("click");
                }}
                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${themeColor} text-white font-black text-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2`}
              >
                <Play size={20} className="fill-white" /> RESUME
              </button>

              <button 
                onClick={() => {
                  audio.playSfx("click");
                  onRestart();
                  setGameState("COUNTDOWN");
                }}
                className="w-full py-4 rounded-2xl bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={20} /> RESTART
              </button>

              <button 
                onClick={() => {
                  audio.playSfx("click");
                  router.push("/games");
                }}
                className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-bold text-lg transition-colors flex items-center justify-center gap-2 mt-4 border border-red-500/20"
              >
                <X size={20} /> QUIT GAME
              </button>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
