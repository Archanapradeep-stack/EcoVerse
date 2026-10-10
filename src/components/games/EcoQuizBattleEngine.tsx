"use client";

import { useEffect, useState } from "react";
import { Clock, Swords, Trophy, Flame } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  {
    q: "Which of the following is a greenhouse gas?",
    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Argon"],
    answer: 1
  },
  {
    q: "What is the most common type of trash found in the ocean?",
    options: ["Glass bottles", "Metal cans", "Plastic bags/wrappers", "Paper"],
    answer: 2
  },
  {
    q: "How long does it take for a plastic bottle to decompose?",
    options: ["10 years", "50 years", "100 years", "450+ years"],
    answer: 3
  },
  {
    q: "Which renewable energy source uses the power of moving water?",
    options: ["Solar", "Geothermal", "Hydroelectric", "Wind"],
    answer: 2
  },
  {
    q: "What percentage of the Earth's water is fresh (drinkable)?",
    options: ["3%", "10%", "25%", "50%"],
    answer: 0
  },
  {
    q: "Which layer of the atmosphere protects us from harmful UV rays?",
    options: ["Troposphere", "Ozone Layer", "Mesosphere", "Thermosphere"],
    answer: 1
  }
];

export default function EcoQuizBattleEngine() {
  const audio = useAudio();
  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [opponentName] = useState(() => {
    const names = ["EcoMaster99", "GreenGuru", "PlanetSaver", "CaptainEarth"];
    return names[Math.floor(Math.random() * names.length)];
  });

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setEarnedXp(0);
    setEarnedCoins(0);
    setQuestionIndex(0);
    setPlayerHp(100);
    setOpponentHp(100);
    setSelectedAnswer(null);
    setIsCorrect(null);
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

  // Opponent AI
  useEffect(() => {
    if (gameState !== "PLAYING" || selectedAnswer !== null) return;
    
    // Opponent answers after random delay between 2-5 seconds
    const delay = Math.random() * 3000 + 2000;
    const aiTimer = setTimeout(() => {
      // 70% chance opponent gets it right
      const aiGetsRight = Math.random() > 0.3;
      if (aiGetsRight) {
        setPlayerHp(prev => Math.max(0, prev - 15));
        // audio.playSfx("error"); // maybe unique sound for taking damage
      } else {
        setOpponentHp(prev => Math.max(0, prev - 5)); // slight penalty for wrong answer
      }

      // If player hasn't answered, maybe they feel pressure?
    }, delay);

    return () => clearTimeout(aiTimer);
  }, [questionIndex, gameState, selectedAnswer]);

  // Check Game Over condition based on HP
  useEffect(() => {
    if (playerHp <= 0 || opponentHp <= 0) {
      if (opponentHp <= 0) {
        // Bonus for winning
        setScore(s => s + 200);
        setEarnedXp(x => x + 50);
        setEarnedCoins(c => c + 25);
      }
      setTimeout(() => {
        audio.pauseBgm();
        setGameState("GAMEOVER");
      }, 1000);
    }
  }, [playerHp, opponentHp, audio]);

  const handleAnswer = (index: number) => {
    if (gameState !== "PLAYING" || selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    const correct = index === QUESTIONS[questionIndex].answer;
    setIsCorrect(correct);

    if (correct) {
      audio.playSfx("success");
      setScore(prev => prev + 50);
      setEarnedXp(prev => prev + 5);
      setEarnedCoins(prev => prev + 2);
      setOpponentHp(prev => Math.max(0, prev - 25));
    } else {
      audio.playSfx("error");
      setPlayerHp(prev => Math.max(0, prev - 10));
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setIsCorrect(null);
      setQuestionIndex((prev) => (prev + 1) % QUESTIONS.length);
    }, 1500);
  };

  const q = QUESTIONS[questionIndex];

  return (
    <PremiumGameWrapper
      title="Eco Quiz Battle"
      themeColor="from-purple-600 to-indigo-900"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col p-6 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-[#0F172A] to-indigo-900/40 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="flex justify-between items-start z-10 w-full mb-8 pointer-events-none">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-3xl font-black italic">{score}</span>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg pointer-events-auto transition-colors border-white/10">
              <Clock size={24} className={timeLeft <= 10 ? 'text-red-400' : 'text-purple-400'} />
              <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        )}

        {/* Game Area */}
        {gameState === "PLAYING" && (
          <div className="flex-1 flex flex-col items-center justify-center pb-10 z-10 w-full max-w-4xl mx-auto">
            
            {/* Battle Arena Header */}
            <div className="w-full flex justify-between items-center mb-12 px-8">
              {/* Player HP */}
              <div className="flex flex-col items-start gap-2 w-1/3">
                <span className="text-white font-bold text-lg">You</span>
                <div className="w-full h-6 bg-black/50 rounded-full border border-white/10 overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                    animate={{ width: `${playerHp}%` }}
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                </div>
                <span className="text-white/60 text-sm font-black">{playerHp} HP</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)] border-2 border-white/20">
                  <Swords className="text-white" size={32} />
                </div>
                <span className="text-purple-300 font-black tracking-widest mt-2 uppercase text-sm">VS</span>
              </div>

              {/* Opponent HP */}
              <div className="flex flex-col items-end gap-2 w-1/3">
                <span className="text-white font-bold text-lg">{opponentName}</span>
                <div className="w-full h-6 bg-black/50 rounded-full border border-white/10 overflow-hidden flex justify-end">
                  <motion.div 
                    className="h-full bg-gradient-to-l from-red-400 to-rose-600"
                    animate={{ width: `${opponentHp}%` }}
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                </div>
                <span className="text-white/60 text-sm font-black">{opponentHp} HP</span>
              </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div 
                key={questionIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
                  {q.q}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {q.options.map((opt, idx) => {
                    let btnClass = "bg-white/5 hover:bg-white/10 border-white/10 text-white";
                    
                    if (selectedAnswer !== null) {
                      if (idx === q.answer) {
                        btnClass = "bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
                      } else if (idx === selectedAnswer) {
                        btnClass = "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]";
                      } else {
                        btnClass = "bg-black/20 border-transparent text-white/30";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleAnswer(idx)}
                        className={`p-6 rounded-2xl border-2 transition-all font-bold text-lg ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="eco-quiz-battle"
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
