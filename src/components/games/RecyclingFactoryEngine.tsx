"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Recycle, ArrowRight, ArrowDown } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

type ItemType = "organic" | "plastic" | "paper" | "metal";

type ConveyorItem = {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  direction: "right" | "down";
  emoji: string;
};

const SPAWN_X = -50;
const SPAWN_Y = 100;
const MAIN_BELT_Y = 100;
const BRANCH_X_POSITIONS = [150, 300, 450, 600]; // x positions where belts branch down
const BIN_Y = 300;

export default function RecyclingFactoryEngine() {
  const audio = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [combo, setCombo] = useState(0);

  // Switch states (true = straight right, false = branch down)
  const [switches, setSwitches] = useState([true, true, true, true]);
  
  const animationFrameId = useRef<number | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setEarnedXp(0);
    setEarnedCoins(0);
    setCombo(0);
    setSwitches([true, true, true, true]);
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

  useEffect(() => {
    if (gameState !== "PLAYING" || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fixed canvas size for reliable logic
    const WIDTH = 800;
    const HEIGHT = 500;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let items: ConveyorItem[] = [];
    let particles: any[] = [];
    let currentScore = score;
    let currentCombo = combo;
    let currentXp = earnedXp;
    let currentCoins = earnedCoins;

    let frames = 0;
    let gameSpeed = 2; // pixel movement per frame

    const itemPool = [
      { type: "organic", emoji: "🍎" },
      { type: "plastic", emoji: "🧴" },
      { type: "paper", emoji: "📰" },
      { type: "metal", emoji: "🥫" },
    ];

    const BINS = [
      { type: "organic", x: BRANCH_X_POSITIONS[0], color: "#22c55e", label: "Organic" },
      { type: "plastic", x: BRANCH_X_POSITIONS[1], color: "#eab308", label: "Plastic" },
      { type: "paper", x: BRANCH_X_POSITIONS[2], color: "#3b82f6", label: "Paper" },
      { type: "metal", x: BRANCH_X_POSITIONS[3], color: "#64748b", label: "Metal" },
    ];

    const spawnParticles = (x: number, y: number, color: string, count: number = 20) => {
      for(let i=0; i<count; i++) {
        particles.push({
          x, y, 
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 2, // shoot slightly up
          life: 1,
          color
        });
      }
    };

    const drawBelt = (x: number, y: number, width: number, height: number, horizontal: boolean) => {
      ctx.fillStyle = "#334155"; // slate-700
      ctx.fillRect(x, y, width, height);
      
      // Rollers
      ctx.fillStyle = "#1e293b"; // slate-800
      if (horizontal) {
        for (let i = 0; i < width; i += 30) {
          ctx.fillRect(x + ((i - (frames * gameSpeed)) % 30 + 30) % 30, y, 5, height);
        }
      } else {
        for (let i = 0; i < height; i += 30) {
          ctx.fillRect(x, y + ((i + (frames * gameSpeed)) % 30), width, 5);
        }
      }
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw Main Belt
      drawBelt(0, MAIN_BELT_Y, WIDTH, 60, true);

      // Draw Branch Belts and Bins
      BINS.forEach((bin, index) => {
        // Branch belt
        drawBelt(bin.x - 30, MAIN_BELT_Y + 60, 60, BIN_Y - MAIN_BELT_Y - 60, false);
        
        // Bin
        ctx.fillStyle = bin.color;
        ctx.beginPath();
        ctx.moveTo(bin.x - 40, BIN_Y);
        ctx.lineTo(bin.x + 40, BIN_Y);
        ctx.lineTo(bin.x + 30, BIN_Y + 80);
        ctx.lineTo(bin.x - 30, BIN_Y + 80);
        ctx.fill();
        
        // Bin label
        ctx.fillStyle = "white";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(bin.label, bin.x, BIN_Y + 40);

        // Switch visual indicator
        const switchState = switches[index]; // Note: React state closure in loop might be stale if not careful.
        // Actually, we use the mutable ref or latest state.
        // Because useEffect dependencies include `switches`, this loop gets recreated when `switches` changes.
        ctx.fillStyle = switchState ? "#22c55e" : "#eab308";
        ctx.fillRect(bin.x - 10, MAIN_BELT_Y + 20, 20, 20);
        
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (switchState) {
          // Arrow right
          ctx.moveTo(bin.x - 5, MAIN_BELT_Y + 30);
          ctx.lineTo(bin.x + 5, MAIN_BELT_Y + 30);
          ctx.lineTo(bin.x + 2, MAIN_BELT_Y + 27);
          ctx.moveTo(bin.x + 5, MAIN_BELT_Y + 30);
          ctx.lineTo(bin.x + 2, MAIN_BELT_Y + 33);
        } else {
          // Arrow down
          ctx.moveTo(bin.x, MAIN_BELT_Y + 25);
          ctx.lineTo(bin.x, MAIN_BELT_Y + 35);
          ctx.lineTo(bin.x - 3, MAIN_BELT_Y + 32);
          ctx.moveTo(bin.x, MAIN_BELT_Y + 35);
          ctx.lineTo(bin.x + 3, MAIN_BELT_Y + 32);
        }
        ctx.stroke();
      });

      gameSpeed = 2 + (frames / 1200); // Speed up over time

      // Spawn Items
      if (frames % Math.max(40, 100 - Math.floor(frames/50)) === 0) {
        const item = itemPool[Math.floor(Math.random() * itemPool.length)];
        items.push({
          id: Math.random().toString(),
          type: item.type as ItemType,
          x: SPAWN_X,
          y: MAIN_BELT_Y + 10,
          direction: "right",
          emoji: item.emoji
        });
      }

      // Move & Draw Items
      for (let i = 0; i < items.length; i++) {
        let item = items[i];

        // Logic check for switches
        if (item.direction === "right") {
          item.x += gameSpeed;
          
          // Check if we passed a branch center
          for (let s = 0; s < BRANCH_X_POSITIONS.length; s++) {
            const bx = BRANCH_X_POSITIONS[s];
            // If item is right exactly on top of the branch center
            if (item.x > bx - gameSpeed && item.x <= bx) {
              // Lock it precisely to the center
              if (!switches[s]) {
                item.x = bx;
                item.direction = "down";
                break;
              }
            }
          }
        } else if (item.direction === "down") {
          item.y += gameSpeed;
        }

        // Draw item
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.emoji, item.x, item.y + 15);

        // Check bin collision (down direction)
        if (item.direction === "down" && item.y > BIN_Y) {
          // Find which bin it fell into based on X position
          const binIndex = BRANCH_X_POSITIONS.findIndex(bx => Math.abs(bx - item.x) < 5);
          if (binIndex !== -1) {
            const bin = BINS[binIndex];
            if (bin.type === item.type) {
              // Success
              currentCombo += 1;
              const multi = Math.min(5, 1 + Math.floor(currentCombo / 5));
              currentScore += 10 * multi;
              currentXp += 2 * multi;
              currentCoins += Math.random() > 0.7 ? 1 : 0;
              
              if (currentCombo % 5 === 0) audio.playSfx("combo");
              else audio.playSfx("success");
              
              spawnParticles(item.x, BIN_Y, bin.color, 15);
            } else {
              // Failure
              currentCombo = 0;
              currentScore = Math.max(0, currentScore - 15);
              audio.playSfx("error");
              
              ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
              ctx.fillRect(0, 0, WIDTH, HEIGHT);
              spawnParticles(item.x, BIN_Y, "#ef4444", 30);
            }
          }
          
          items.splice(i, 1);
          i--;
          
          setScore(currentScore);
          setCombo(currentCombo);
          setEarnedXp(currentXp);
          setEarnedCoins(currentCoins);
          continue;
        }

        // Check if item fell off the end of main belt
        if (item.x > WIDTH) {
          currentCombo = 0;
          currentScore = Math.max(0, currentScore - 5); // small penalty
          setCombo(currentCombo);
          setScore(currentScore);
          items.splice(i, 1);
          i--;
          continue;
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      frames++;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, switches, audio]); // re-run loop setup when switches change so closure has latest state

  const toggleSwitch = (index: number) => {
    if (gameState !== "PLAYING") return;
    audio.playSfx("click");
    setSwitches(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  return (
    <PremiumGameWrapper
      title="Recycling Factory"
      themeColor="from-slate-700 to-indigo-900"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col items-center justify-center overflow-hidden p-4">
        
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-3xl font-black italic">{score}</span>
              </div>
              <AnimatePresence>
                {combo > 2 && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={combo}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl px-4 py-3 border border-white/20 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.5)] pointer-events-auto"
                  >
                    <span className="text-white/90 text-xs font-black uppercase tracking-wider leading-none">COMBO</span>
                    <span className="text-white text-2xl font-black italic">x{combo}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg pointer-events-auto transition-colors border-white/10">
              <Clock size={24} className={timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'} />
              <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
        )}

        <div className="relative w-full max-w-[800px] aspect-[800/500] bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <canvas 
            ref={canvasRef} 
            className={`w-full h-full block ${gameState === "PLAYING" ? '' : 'opacity-0'}`} 
          />
          
          {/* Controls overlay */}
          {gameState === "PLAYING" && (
            <div className="absolute top-[80px] left-0 w-full flex pl-[150px] gap-[150px]">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => toggleSwitch(i)}
                  className={`w-12 h-12 -ml-6 flex items-center justify-center rounded-full border-4 shadow-lg transition-transform active:scale-90
                    ${switches[i] ? 'bg-green-500 border-green-300' : 'bg-yellow-500 border-yellow-300'}`}
                >
                  {switches[i] ? <ArrowRight className="text-white font-black" /> : <ArrowDown className="text-white font-black" />}
                </button>
              ))}
            </div>
          )}
          {gameState === "PLAYING" && (
             <div className="absolute top-[350px] w-full flex justify-center text-white/50 text-sm font-black tracking-widest text-center px-4">
               TAP THE ROUND SWITCH BUTTONS TO DIVERT WASTE INTO THE CORRECT BINS!
             </div>
          )}
        </div>
        
        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="recycling-factory"
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
