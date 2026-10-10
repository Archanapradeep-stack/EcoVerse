"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Zap, CheckCircle2, XCircle } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";

type TrashItem = {
  id: string;
  name: string;
  type: "organic" | "plastic" | "paper" | "metal";
  emoji: string;
};

const TRASH_ITEMS: TrashItem[] = [
  { id: "1", name: "Apple Core", type: "organic", emoji: "🍎" },
  { id: "2", name: "Banana Peel", type: "organic", emoji: "🍌" },
  { id: "3", name: "Water Bottle", type: "plastic", emoji: "🧴" },
  { id: "4", name: "Plastic Bag", type: "plastic", emoji: "🛍️" },
  { id: "5", name: "Newspaper", type: "paper", emoji: "📰" },
  { id: "6", name: "Cardboard Box", type: "paper", emoji: "📦" },
  { id: "7", name: "Soda Can", type: "metal", emoji: "🥫" },
  { id: "8", name: "Tin Foil", type: "metal", emoji: "🪙" },
];

const BINS = [
  { id: "organic", label: "Organic", color: "from-green-500 to-emerald-700", border: "border-green-400" },
  { id: "plastic", label: "Plastic", color: "from-yellow-400 to-orange-500", border: "border-yellow-300" },
  { id: "paper", label: "Paper", color: "from-blue-500 to-indigo-600", border: "border-blue-400" },
  { id: "metal", label: "Metal", color: "from-gray-400 to-gray-600", border: "border-gray-300" },
];

export default function TrashSortingEngine() {
  const audio = useAudio();
  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const [currentItem, setCurrentItem] = useState<TrashItem | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  
  const totalSorted = useRef(0);
  const correctSorted = useRef(0);
  const lastSortTime = useRef(Date.now());

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setEarnedXp(0);
    setEarnedCoins(0);
    setCombo(0);
    totalSorted.current = 0;
    correctSorted.current = 0;
    spawnItem();
  };

  const spawnItem = () => {
    const randomItem = TRASH_ITEMS[Math.floor(Math.random() * TRASH_ITEMS.length)];
    setCurrentItem({ ...randomItem, id: Math.random().toString() });
    setFeedback(null);
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
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, audio]);

  const handleDragStart = (e: React.DragEvent, item: TrashItem) => {
    e.dataTransfer.setData("text/plain", item.type);
    audio.playSfx("click");
  };

  const handleDrop = (e: React.DragEvent, binId: string) => {
    e.preventDefault();
    if (!currentItem) return;

    const itemType = e.dataTransfer.getData("text/plain");
    totalSorted.current += 1;

    const now = Date.now();
    let currentCombo = combo;
    
    // Reset combo if took too long (more than 3 seconds between sorts)
    if (now - lastSortTime.current > 3000) {
      currentCombo = 0;
    }
    lastSortTime.current = now;

    if (itemType === binId) {
      currentCombo += 1;
      const multiplier = Math.min(5, 1 + Math.floor(currentCombo / 3));
      
      setScore((s) => s + (10 * multiplier));
      setEarnedXp((x) => x + (2 * multiplier));
      setEarnedCoins((c) => c + (1 * multiplier));
      setFeedback("correct");
      correctSorted.current += 1;
      
      if (currentCombo % 3 === 0) audio.playSfx("combo");
      else audio.playSfx("success");
    } else {
      currentCombo = 0;
      setScore((s) => Math.max(0, s - 5));
      setFeedback("wrong");
      audio.playSfx("error");
    }

    setCombo(currentCombo);

    setTimeout(() => {
      spawnItem();
    }, 400);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const accuracy = totalSorted.current > 0 ? Math.round((correctSorted.current / totalSorted.current) * 100) : 0;

  return (
    <PremiumGameWrapper
      title="Trash Sorting Frenzy"
      themeColor="from-blue-500 to-indigo-600"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col p-6 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />

        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="flex justify-between items-start z-10 w-full mb-8 pointer-events-none">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col ml-16 md:ml-20 pointer-events-auto shadow-lg">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-3xl font-black italic">{score}</span>
              </div>
              
              <AnimatePresence>
                {combo > 1 && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={combo}
                    className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-3 border border-white/20 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.5)] pointer-events-auto"
                  >
                    <span className="text-white/90 text-xs font-black uppercase tracking-wider leading-none">COMBO</span>
                    <span className="text-white text-2xl font-black italic">x{combo}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 mr-16 md:mr-20 pointer-events-auto">
              <div className={`bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg transition-colors ${timeLeft <= 10 ? 'border-red-500/50 bg-red-500/10 animate-pulse' : 'border-white/10'}`}>
                <Clock size={24} className={timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'} />
                <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Game Area */}
        {gameState === "PLAYING" && (
          <div className="flex-1 flex flex-col items-center justify-between pb-4 z-10">
            
            {/* Spawner / Current Item */}
            <div className="h-48 flex items-center justify-center w-full relative">
              <AnimatePresence mode="wait">
                {currentItem && !feedback && (
                  <motion.div
                    key={currentItem.id}
                    initial={{ scale: 0, y: -50, rotate: Math.random() * 20 - 10 }}
                    animate={{ scale: 1, y: 0, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, currentItem)}
                    className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center cursor-grab active:cursor-grabbing border border-white/20 hover:border-white/50 hover:bg-white/20 transition-all z-20"
                  >
                    <span className="text-6xl mb-2 drop-shadow-md">{currentItem.emoji}</span>
                    <span className="text-xs font-black text-white/90 text-center leading-tight uppercase tracking-wider">{currentItem.name}</span>
                  </motion.div>
                )}
                {feedback && (
                  <motion.div
                    key="feedback"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute flex flex-col items-center z-10"
                  >
                    {feedback === "correct" ? (
                      <CheckCircle2 size={100} className="text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]" />
                    ) : (
                      <XCircle size={100} className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bins */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mt-auto">
              {BINS.map((bin) => (
                <div
                  key={bin.id}
                  onDrop={(e) => handleDrop(e, bin.id)}
                  onDragOver={handleDragOver}
                  className={`bg-gradient-to-b ${bin.color} border-t-[10px] ${bin.border} rounded-t-xl rounded-b-[2rem] h-48 md:h-64 flex flex-col items-center justify-center text-white shadow-2xl transition-all hover:scale-105 hover:-translate-y-2 cursor-pointer relative overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  <span className="relative z-10 text-2xl md:text-3xl font-black italic uppercase tracking-widest drop-shadow-lg">
                    {bin.label}
                  </span>
                  <div className="relative z-10 w-20 h-3 bg-black/40 rounded-full mt-6 shadow-inner" />
                </div>
              ))}
            </div>

          </div>
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            accuracy={accuracy}
            gameId="trash-sorting"
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
