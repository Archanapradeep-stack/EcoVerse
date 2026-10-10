"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

export default function PlasticCollectorEngine() {
  const audio = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [combo, setCombo] = useState(0);

  const animationFrameId = useRef<number | null>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setEarnedXp(0);
    setEarnedCoins(0);
    setCombo(0);
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

    canvas.width = containerRef.current.clientWidth;
    canvas.height = containerRef.current.clientHeight;

    const BIN_WIDTH = 100;
    const BIN_HEIGHT = 80;
    const bin = {
      x: canvas.width / 2 - BIN_WIDTH / 2,
      y: canvas.height - BIN_HEIGHT - 20,
      width: BIN_WIDTH,
      height: BIN_HEIGHT,
      color: "#3b82f6" // blue bin
    };

    let items: any[] = [];
    let particles: any[] = [];
    let currentScore = score;
    let currentXp = earnedXp;
    let currentCoins = earnedCoins;
    let currentCombo = combo;

    let frames = 0;
    let baseSpeed = 4;
    
    const spawnParticles = (x: number, y: number, color: string, count: number = 20) => {
      for(let i=0; i<count; i++) {
        particles.push({
          x, y, 
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 1,
          color
        });
      }
    };

    // Mouse/Touch movement
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX;
      if (window.TouchEvent && e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
      } else {
        clientX = (e as MouseEvent).clientX;
      }
      const rect = canvas.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      bin.x = Math.max(0, Math.min(canvas.width - bin.width, relativeX - bin.width / 2));
    };

    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchmove", handlePointerMove);

    const gameLoop = () => {
      // Dynamic City Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#0f172a"); // slate-900
      bgGradient.addColorStop(1, "#1e293b"); // slate-800
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Speed increases over time
      baseSpeed = 4 + (frames / 1000);

      // Draw Bin
      ctx.fillStyle = bin.color;
      ctx.beginPath();
      ctx.moveTo(bin.x, bin.y);
      ctx.lineTo(bin.x + bin.width, bin.y);
      ctx.lineTo(bin.x + bin.width - 15, bin.y + bin.height);
      ctx.lineTo(bin.x + 15, bin.y + bin.height);
      ctx.fill();
      
      // Bin Rim
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(bin.x - 5, bin.y - 10, bin.width + 10, 15);

      // Spawn items
      if (frames % Math.max(20, 60 - Math.floor(frames/100)) === 0) {
        const isGood = Math.random() > 0.3; // 70% recyclable, 30% bad (organic/hazard in wrong bin)
        items.push({
          x: Math.random() * (canvas.width - 40),
          y: -50,
          width: 40,
          height: 40,
          isGood,
          color: isGood ? "#cbd5e1" : "#ef4444", // gray plastic or red hazard
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.2,
          speed: baseSpeed + (Math.random() * 3)
        });
      }

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += item.speed;
        item.rotation += item.rotSpeed;
        
        ctx.save();
        ctx.translate(item.x + item.width/2, item.y + item.height/2);
        ctx.rotate(item.rotation);
        
        if (item.isGood) {
          // Plastic Bottle
          ctx.fillStyle = "rgba(255,255,255,0.7)";
          ctx.fillRect(-10, -20, 20, 40);
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(-5, -25, 10, 5);
        } else {
          // Apple Core (Hazard for plastic bin)
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.arc(0, 0, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#84cc16";
          ctx.fillRect(-2, -22, 4, 10);
        }
        ctx.restore();

        // Collision with bin opening
        if (
          item.y + item.height > bin.y &&
          item.y < bin.y + 10 &&
          item.x + item.width > bin.x &&
          item.x < bin.x + bin.width
        ) {
          if (item.isGood) {
            currentCombo += 1;
            const multiplier = Math.min(5, 1 + Math.floor(currentCombo / 5));
            
            currentScore += (10 * multiplier);
            currentXp += (1 * multiplier);
            currentCoins += (Math.random() > 0.5 ? 1 : 0); // 50% chance for coin
            
            if (currentCombo % 5 === 0) audio.playSfx("combo");
            else audio.playSfx("success");
            
            spawnParticles(item.x, item.y, "#60a5fa", 15);
          } else {
            currentScore = Math.max(0, currentScore - 20);
            currentCombo = 0;
            ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            audio.playSfx("error");
            spawnParticles(item.x, item.y, "#ef4444", 30);
          }
          
          setScore(currentScore);
          setEarnedXp(currentXp);
          setEarnedCoins(currentCoins);
          setCombo(currentCombo);

          items.splice(i, 1);
          i--;
          continue;
        }

        // Missed good item
        if (item.y > canvas.height && item.isGood) {
          currentCombo = 0;
          setCombo(0);
          items.splice(i, 1);
          i--;
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
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("touchmove", handlePointerMove);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, audio]);

  return (
    <PremiumGameWrapper
      title="Plastic Collector"
      themeColor="from-slate-600 to-slate-900"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        
        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col gap-1 ml-16 md:ml-32 shadow-lg">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-4xl font-black italic">{score}</span>
              </div>
              
              <AnimatePresence>
                {combo > 2 && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={combo}
                    className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl px-4 py-3 border border-white/20 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(96,165,250,0.5)]"
                  >
                    <span className="text-white/90 text-xs font-black uppercase tracking-wider leading-none">COMBO</span>
                    <span className="text-white text-2xl font-black italic">x{combo}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-4 mr-16 md:mr-32">
              <div className={`bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg transition-colors ${timeLeft <= 10 ? 'border-red-500/50 bg-red-500/10 animate-pulse' : 'border-white/10'}`}>
                <Clock size={24} className={timeLeft <= 10 ? 'text-red-400' : 'text-blue-400'} />
                <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>
          </div>
        )}

        <canvas 
          ref={canvasRef} 
          className={`w-full h-full block ${gameState === "PLAYING" ? 'pointer-events-auto cursor-none' : 'opacity-0'}`} 
        />
        
        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="plastic-collector"
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
