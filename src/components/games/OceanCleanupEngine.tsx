"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";

export default function OceanCleanupEngine() {
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

    const BOAT_SPEED = 8;
    let ITEM_SPEED = 3;

    const boat = {
      x: canvas.width / 2 - 40,
      y: canvas.height - 120,
      width: 80,
      height: 80,
      color: "#facc15" 
    };

    let items: any[] = [];
    let particles: any[] = [];
    let currentScore = score;
    let currentXp = earnedXp;
    let currentCoins = earnedCoins;
    let currentCombo = combo;

    let frames = 0;
    
    const spawnParticles = (x: number, y: number, color: string, count: number = 15) => {
      for(let i=0; i<count; i++) {
        particles.push({
          x, y, 
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 1,
          color
        });
      }
    };

    // Key states
    const keys = { ArrowLeft: false, ArrowRight: false, a: false, d: false };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (keys.hasOwnProperty(e.key)) keys[e.key as keyof typeof keys] = false;
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
      boat.x = Math.max(0, Math.min(canvas.width - boat.width, relativeX - boat.width / 2));
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("touchmove", handlePointerMove);

    const gameLoop = () => {
      // Dynamic Ocean Background
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#0369a1");
      bgGradient.addColorStop(1, "#082f49");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 3;
      for(let i=0; i<8; i++) {
        ctx.beginPath();
        const yPos = (frames * 2 + i * 150) % canvas.height;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.lineTo(x, yPos + Math.sin(x * 0.05 + frames * 0.1) * 10);
        }
        ctx.stroke();
      }

      // Move boat
      if ((keys.ArrowLeft || keys.a) && boat.x > 0) boat.x -= BOAT_SPEED;
      if ((keys.ArrowRight || keys.d) && boat.x < canvas.width - boat.width) boat.x += BOAT_SPEED;

      // Draw boat wake
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.moveTo(boat.x + boat.width/2, boat.y + boat.height);
      ctx.lineTo(boat.x - 20, boat.y + boat.height + 40);
      ctx.lineTo(boat.x + boat.width + 20, boat.y + boat.height + 40);
      ctx.fill();

      // Draw boat
      ctx.fillStyle = boat.color;
      ctx.beginPath();
      ctx.moveTo(boat.x + 20, boat.y);
      ctx.lineTo(boat.x + boat.width - 20, boat.y);
      ctx.lineTo(boat.x + boat.width, boat.y + boat.height);
      ctx.lineTo(boat.x, boat.y + boat.height);
      ctx.fill();
      
      // Boat details
      ctx.fillStyle = "#333";
      ctx.fillRect(boat.x + 30, boat.y + 20, 20, 20);

      // Spawn items
      if (frames % Math.max(20, 60 - Math.floor(frames/500)) === 0) {
        const isFish = Math.random() > 0.6;
        items.push({
          x: Math.random() * (canvas.width - 40),
          y: -50,
          width: 40,
          height: 40,
          isFish,
          color: isFish ? "#f97316" : "#94a3b8", // Orange fish or gray plastic
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1
        });
      }

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.y += ITEM_SPEED + (frames / 1000);
        item.rotation += item.rotSpeed;
        
        ctx.save();
        ctx.translate(item.x + item.width/2, item.y + item.height/2);
        ctx.rotate(item.rotation);
        
        if (item.isFish) {
          ctx.fillStyle = item.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(-35, -10);
          ctx.lineTo(-35, 10);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(255,255,255,0.8)";
          ctx.fillRect(-10, -20, 20, 40); // Bottle body
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(-5, -25, 10, 5); // Bottle cap
        }
        ctx.restore();

        // Collision
        if (
          boat.x < item.x + item.width &&
          boat.x + boat.width > item.x &&
          boat.y < item.y + item.height &&
          boat.y + boat.height > item.y
        ) {
          if (item.isFish) {
            // Hit fish - penalty
            currentScore = Math.max(0, currentScore - 20);
            currentCombo = 0;
            ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            audio.playSfx("error");
            spawnParticles(item.x, item.y, "#ef4444", 30);
          } else {
            // Collected plastic
            currentCombo += 1;
            const multiplier = Math.min(5, 1 + Math.floor(currentCombo / 4));
            
            currentScore += (10 * multiplier);
            currentXp += (2 * multiplier);
            currentCoins += (1 * multiplier);
            
            if (currentCombo % 4 === 0) audio.playSfx("combo");
            else audio.playSfx("success");
            
            spawnParticles(item.x, item.y, "#ffffff", 20);
          }
          
          setScore(currentScore);
          setEarnedXp(currentXp);
          setEarnedCoins(currentCoins);
          setCombo(currentCombo);

          items.splice(i, 1);
          i--;
        }
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;
        
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }

      items = items.filter(item => item.y < canvas.height);

      frames++;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      canvas.removeEventListener("mousemove", handlePointerMove);
      canvas.removeEventListener("touchmove", handlePointerMove);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, audio]);

  return (
    <PremiumGameWrapper
      title="Ocean Defender"
      themeColor="from-cyan-400 to-blue-600"
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
                {combo > 1 && (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={combo}
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl px-4 py-3 border border-white/20 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)]"
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
            gameId="ocean-cleanup"
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
