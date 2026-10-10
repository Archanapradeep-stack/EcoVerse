"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, TreePine, Droplets, Sun, Sparkles, Coins, ArrowUpCircle } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";

type GrowthStage = "seed" | "sprout" | "sapling" | "tree";

const STAGE_REQUIREMENTS = {
  seed: 0,
  sprout: 20,
  sapling: 60,
  tree: 100,
};

export default function TreePlantingEngine() {
  const audio = useAudio();
  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  
  // Game Stats
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds to plant as many trees as possible
  
  // Tree State
  const [growth, setGrowth] = useState(0);
  const [waterDrops, setWaterDrops] = useState(100); // Resource management
  const [treesPlanted, setTreesPlanted] = useState(0);
  
  const currentStage: GrowthStage = 
    growth >= STAGE_REQUIREMENTS.tree ? "tree" :
    growth >= STAGE_REQUIREMENTS.sapling ? "sapling" :
    growth >= STAGE_REQUIREMENTS.sprout ? "sprout" : "seed";

  const startGame = () => {
    setScore(0);
    setEarnedXp(0);
    setEarnedCoins(0);
    setTimeLeft(60);
    setGrowth(0);
    setWaterDrops(100);
    setTreesPlanted(0);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "PLAYING" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            audio.pauseBgm();
            setGameState("GAMEOVER");
            return 0;
          }
          if (prev <= 10) audio.playSfx("click");
          return prev - 1;
        });
        
        // Passive water regeneration
        setWaterDrops(prev => Math.min(100, prev + 5));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, audio]);

  const handleWater = () => {
    if (gameState !== "PLAYING" || waterDrops < 10) return;
    
    audio.playSfx("click"); // Replace with water sound if available
    setWaterDrops(prev => prev - 10);
    setGrowth(prev => Math.min(100, prev + 15));
    setScore(prev => prev + 5);
  };

  const handleSunlight = () => {
    if (gameState !== "PLAYING") return;
    // Free but slow growth
    audio.playSfx("click");
    setGrowth(prev => Math.min(100, prev + 2));
    setScore(prev => prev + 1);
  };

  const handleHarvest = () => {
    if (gameState !== "PLAYING" || currentStage !== "tree") return;

    audio.playSfx("success");
    setTreesPlanted(prev => prev + 1);
    setEarnedXp(prev => prev + 15);
    setEarnedCoins(prev => prev + 5);
    setScore(prev => prev + 100);
    
    // Reset for next tree
    setGrowth(0);
  };

  return (
    <PremiumGameWrapper
      title="Tree Planting Simulator"
      themeColor="from-green-500 to-emerald-700"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col p-6 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-green-900/20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="flex justify-between items-start z-10 w-full mb-8 pointer-events-none">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-3xl font-black italic">{score}</span>
              </div>
              
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col items-center shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Trees</span>
                <div className="flex items-center gap-2">
                  <TreePine size={20} className="text-green-400" />
                  <span className="text-white text-2xl font-black">{treesPlanted}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg pointer-events-auto transition-colors border-white/10">
              <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        )}

        {/* Game Area */}
        {gameState === "PLAYING" && (
          <div className="flex-1 flex flex-col items-center justify-center pb-10 z-10 w-full max-w-4xl mx-auto">
            
            {/* Tree Container */}
            <div className="relative w-full h-64 md:h-96 flex items-end justify-center mb-12">
              {/* Ground */}
              <div className="absolute bottom-0 w-full h-8 bg-[#3E2723] rounded-full blur-sm opacity-50" />
              <div className="absolute bottom-2 w-3/4 h-4 bg-[#4E342E] rounded-full" />
              
              <AnimatePresence mode="wait">
                {currentStage === "seed" && (
                  <motion.div key="seed" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ scale: 0 }} className="relative z-10 mb-2">
                    <div className="w-6 h-4 bg-[#8D6E63] rounded-full shadow-inner" />
                  </motion.div>
                )}
                {currentStage === "sprout" && (
                  <motion.div key="sprout" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative z-10 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">
                    <Sprout size={64} />
                  </motion.div>
                )}
                {currentStage === "sapling" && (
                  <motion.div key="sapling" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="relative z-10 text-emerald-500 drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                    <TreePine size={120} />
                  </motion.div>
                )}
                {currentStage === "tree" && (
                  <motion.div key="tree" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative z-10 text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)] cursor-pointer" onClick={handleHarvest} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <TreePine size={200} />
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                      <Sparkles className="text-yellow-400 absolute -top-10 -right-10" size={40} />
                      <Sparkles className="text-yellow-400 absolute -bottom-10 -left-10" size={30} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Growth Progress Bar */}
              <div className="absolute -bottom-8 w-64 h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-300"
                  style={{ width: `${growth}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            {currentStage !== "tree" ? (
              <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                <button 
                  onClick={handleWater}
                  disabled={waterDrops < 10}
                  className={`flex flex-col items-center justify-center p-6 rounded-3xl border-b-8 transition-all active:border-b-0 active:translate-y-2 ${waterDrops >= 10 ? 'bg-blue-500/20 border-blue-600 hover:bg-blue-500/30' : 'bg-gray-800 border-gray-900 opacity-50 cursor-not-allowed'}`}
                >
                  <Droplets size={48} className={waterDrops >= 10 ? 'text-blue-400 mb-2' : 'text-gray-500 mb-2'} />
                  <span className="font-black text-white tracking-wider">WATER (-10)</span>
                  <div className="w-full h-2 bg-black/40 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-blue-400 transition-all" style={{ width: `${waterDrops}%` }} />
                  </div>
                </button>

                <button 
                  onClick={handleSunlight}
                  className="flex flex-col items-center justify-center p-6 rounded-3xl bg-yellow-500/20 border-b-8 border-yellow-600 hover:bg-yellow-500/30 transition-all active:border-b-0 active:translate-y-2"
                >
                  <Sun size={48} className="text-yellow-400 mb-2" />
                  <span className="font-black text-white tracking-wider">SUNLIGHT</span>
                  <span className="text-yellow-200/50 text-xs font-bold mt-2">FREE / SLOW</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={handleHarvest}
                className="flex items-center justify-center gap-4 p-6 rounded-3xl bg-green-500/20 border-b-8 border-green-600 hover:bg-green-500/30 transition-all active:border-b-0 active:translate-y-2 w-full max-w-md shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce"
              >
                <ArrowUpCircle size={40} className="text-green-400" />
                <span className="font-black text-white text-3xl tracking-wider">HARVEST!</span>
              </button>
            )}

          </div>
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="tree-planting"
            onPlayAgain={() => {
              audio.playSfx("click");
              setGameState("COUNTDOWN");
            }}
          />
        )}
      </div>
    </PremiumGameWrapper>
  );
}
