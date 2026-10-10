"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Shield, Leaf, CloudFog, Coins, Activity } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

type Enemy = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  type: "co2" | "methane" | "smog";
};

type Tower = {
  id: string;
  x: number;
  y: number;
  range: number;
  damage: number;
  cooldown: number; // frames between shots
  lastShot: number;
  type: "oak" | "pine" | "bamboo";
};

type Projectile = {
  x: number;
  y: number;
  targetId: string;
  speed: number;
  damage: number;
  color: string;
};

// Simple winding path
const PATH_POINTS = [
  { x: 0, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 300 },
  { x: 600, y: 300 },
  { x: 600, y: 150 },
  { x: 800, y: 150 }
];

export default function CarbonDefenderEngine() {
  const audio = useAudio();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [money, setMoney] = useState(50);
  const [cityHp, setCityHp] = useState(100);
  
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const [selectedTowerType, setSelectedTowerType] = useState<"oak" | "pine" | "bamboo" | null>(null);

  const animationFrameId = useRef<number | null>(null);

  // Tower Stats
  const TOWER_STATS = {
    oak: { cost: 20, range: 100, damage: 10, cooldown: 60, color: "#22c55e", label: "Oak" }, // slow, high dmg
    pine: { cost: 15, range: 150, damage: 5, cooldown: 30, color: "#10b981", label: "Pine" }, // fast, low dmg, long range
    bamboo: { cost: 10, range: 80, damage: 3, cooldown: 10, color: "#84cc16", label: "Bamboo" } // very fast, low dmg, short range
  };

  const startGame = () => {
    setScore(0);
    setWave(1);
    setMoney(50);
    setCityHp(100);
    setEarnedXp(0);
    setEarnedCoins(0);
    setSelectedTowerType(null);
  };

  useEffect(() => {
    if (gameState !== "PLAYING" || !canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const WIDTH = 800;
    const HEIGHT = 500;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let enemies: Enemy[] = [];
    let towers: Tower[] = [];
    let projectiles: Projectile[] = [];
    let particles: any[] = [];
    
    let currentScore = score;
    let currentMoney = money;
    let currentCityHp = cityHp;
    let currentWave = wave;

    let frames = 0;
    let enemiesToSpawn = 5;
    let spawnTimer = 0;
    let waveTimer = 180; // frames before wave starts

    const spawnParticles = (x: number, y: number, color: string, count: number = 10) => {
      for(let i=0; i<count; i++) {
        particles.push({
          x, y, 
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          life: 1,
          color
        });
      }
    };

    const drawPath = () => {
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 40;
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(PATH_POINTS[0].x, PATH_POINTS[0].y);
      for(let i=1; i<PATH_POINTS.length; i++) {
        ctx.lineTo(PATH_POINTS[i].x, PATH_POINTS[i].y);
      }
      ctx.stroke();
      
      // Path center line
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const handleCanvasClick = (e: MouseEvent) => {
      if (!selectedTowerType) return;
      
      const rect = canvas.getBoundingClientRect();
      // Calculate scale since canvas might be CSS-scaled
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // Check if valid placement (not on path, not on other tower)
      // Simple path collision: check distance to path segments
      let isOnPath = false;
      for (let i = 0; i < PATH_POINTS.length - 1; i++) {
        const p1 = PATH_POINTS[i];
        const p2 = PATH_POINTS[i+1];
        
        // Point to line segment distance
        const l2 = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        let t = ((x - p1.x) * (p2.x - p1.x) + (y - p1.y) * (p2.y - p1.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = p1.x + t * (p2.x - p1.x);
        const projY = p1.y + t * (p2.y - p1.y);
        const dist = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
        
        if (dist < 30) {
          isOnPath = true;
          break;
        }
      }

      let isOnTower = towers.some(t => Math.sqrt(Math.pow(t.x - x, 2) + Math.pow(t.y - y, 2)) < 30);

      if (!isOnPath && !isOnTower) {
        const stats = TOWER_STATS[selectedTowerType];
        if (currentMoney >= stats.cost) {
          currentMoney -= stats.cost;
          setMoney(currentMoney);
          towers.push({
            id: Math.random().toString(),
            x, y,
            range: stats.range,
            damage: stats.damage,
            cooldown: stats.cooldown,
            lastShot: 0,
            type: selectedTowerType
          });
          audio.playSfx("success");
          setSelectedTowerType(null); // Deselect after placing
        } else {
          audio.playSfx("error");
        }
      } else {
        audio.playSfx("error");
      }
    };

    canvas.addEventListener("click", handleCanvasClick);

    const gameLoop = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Draw Background
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      
      // Draw Grid for aesthetics
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      for(let i=0; i<WIDTH; i+=40) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, HEIGHT); ctx.stroke();
      }
      for(let i=0; i<HEIGHT; i+=40) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WIDTH, i); ctx.stroke();
      }

      drawPath();

      // City representation
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(WIDTH - 60, 100, 60, 100);
      ctx.fillStyle = "white";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CITY", WIDTH - 30, 150);

      // Wave Logic
      if (enemiesToSpawn > 0 && waveTimer <= 0) {
        if (spawnTimer <= 0) {
          const type = Math.random() > 0.8 ? "methane" : (Math.random() > 0.5 ? "smog" : "co2");
          const hp = currentWave * 10 + (type === "methane" ? 20 : 0);
          const speed = type === "smog" ? 2 : 1;
          
          enemies.push({
            id: Math.random().toString(),
            x: PATH_POINTS[0].x,
            y: PATH_POINTS[0].y,
            hp, maxHp: hp,
            speed,
            pathIndex: 0,
            type
          });
          enemiesToSpawn--;
          spawnTimer = 60 - Math.min(40, currentWave * 2); // spawn faster in later waves
        } else {
          spawnTimer--;
        }
      } else if (waveTimer > 0) {
        waveTimer--;
        // Show wave incoming text
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "bold 24px Arial";
        ctx.fillText(`Wave ${currentWave} starts in ${Math.ceil(waveTimer/60)}...`, WIDTH/2, 50);
      } else if (enemies.length === 0 && enemiesToSpawn === 0) {
        // Wave complete
        currentWave++;
        setWave(currentWave);
        enemiesToSpawn = 5 + currentWave * 2;
        waveTimer = 180;
        currentMoney += 20 + currentWave * 5; // wave bonus
        setMoney(currentMoney);
        audio.playSfx("success");
      }

      // Process Enemies
      for (let i = 0; i < enemies.length; i++) {
        let e = enemies[i];
        const target = PATH_POINTS[e.pathIndex + 1];
        
        if (target) {
          const dx = target.x - e.x;
          const dy = target.y - e.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist < e.speed) {
            e.x = target.x;
            e.y = target.y;
            e.pathIndex++;
          } else {
            e.x += (dx/dist) * e.speed;
            e.y += (dy/dist) * e.speed;
          }
        } else {
          // Reached city
          currentCityHp -= 10;
          setCityHp(currentCityHp);
          audio.playSfx("error");
          spawnParticles(e.x, e.y, "#ef4444", 20);
          enemies.splice(i, 1);
          i--;
          
          if (currentCityHp <= 0) {
            setGameState("GAMEOVER");
            audio.pauseBgm();
          }
          continue;
        }

        // Draw Enemy
        ctx.fillStyle = e.type === "co2" ? "#64748b" : (e.type === "methane" ? "#ca8a04" : "#a8a29e");
        ctx.beginPath();
        ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // HP Bar
        ctx.fillStyle = "red";
        ctx.fillRect(e.x - 10, e.y - 20, 20, 4);
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(e.x - 10, e.y - 20, 20 * (e.hp / e.maxHp), 4);
      }

      // Process Towers
      towers.forEach(t => {
        // Draw Tower
        ctx.fillStyle = TOWER_STATS[t.type].color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#064e3b";
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Draw Range if selected (can't easily do hover without more state, so skip for now)
        
        // Attack Logic
        if (frames - t.lastShot >= t.cooldown) {
          // Find closest enemy in range
          let targetEnemy = null;
          let minD = t.range;
          
          for (const e of enemies) {
            const d = Math.sqrt(Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2));
            if (d <= minD) {
              minD = d;
              targetEnemy = e;
            }
          }

          if (targetEnemy) {
            projectiles.push({
              x: t.x,
              y: t.y,
              targetId: targetEnemy.id,
              speed: 8,
              damage: t.damage,
              color: TOWER_STATS[t.type].color
            });
            t.lastShot = frames;
          }
        }
      });

      // Process Projectiles
      for (let i = 0; i < projectiles.length; i++) {
        let p = projectiles[i];
        let target = enemies.find(e => e.id === p.targetId);
        
        if (!target) {
          projectiles.splice(i, 1);
          i--;
          continue;
        }
        
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < p.speed) {
          // Hit
          target.hp -= p.damage;
          spawnParticles(target.x, target.y, p.color, 5);
          
          if (target.hp <= 0) {
            currentMoney += 5;
            currentScore += 10;
            const xpGain = 1;
            setEarnedXp(x => x + xpGain);
            if (Math.random() > 0.8) setEarnedCoins(c => c + 1);
            
            setScore(currentScore);
            setMoney(currentMoney);
            audio.playSfx("combo");
            
            enemies = enemies.filter(e => e.id !== target.id);
          }
          
          projectiles.splice(i, 1);
          i--;
        } else {
          p.x += (dx/dist) * p.speed;
          p.y += (dy/dist) * p.speed;
          
          // Draw Projectile
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Particles
      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        
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

      // Draw Cursor for Tower Placement
      if (selectedTowerType) {
        // We need mouse pos, but since we don't have it tracked in game loop easily,
        // we'll just indicate they need to click on canvas in the UI.
      }

      frames++;
      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      canvas.removeEventListener("click", handleCanvasClick);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState, selectedTowerType, audio]);

  return (
    <PremiumGameWrapper
      title="Carbon Defender"
      themeColor="from-gray-800 to-green-900"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col p-4 overflow-hidden">
        
        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10 pointer-events-none">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Wave</span>
                <span className="text-white text-2xl font-black">{wave}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-2xl font-black">{score}</span>
              </div>
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 border border-yellow-500/30 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-yellow-500/80 text-xs font-black uppercase tracking-wider">Funds</span>
                <span className="text-yellow-400 text-2xl font-black">${money}</span>
              </div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-2 border flex items-center gap-3 shadow-lg pointer-events-auto transition-colors border-white/10">
              <Shield size={20} className={cityHp <= 30 ? 'text-red-400' : 'text-blue-400'} />
              <div className="flex flex-col">
                 <span className="text-white/60 text-[10px] font-black uppercase tracking-wider leading-none">City HP</span>
                 <span className={`text-xl font-black ${cityHp <= 30 ? 'text-red-400' : 'text-white'}`}>
                   {cityHp}%
                 </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 w-full flex items-center justify-center mt-12">
          <div className="relative w-full max-w-[800px] aspect-[800/500] bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-crosshair">
            <canvas 
              ref={canvasRef} 
              className={`w-full h-full block ${gameState === "PLAYING" ? 'pointer-events-auto' : 'opacity-0'}`} 
            />
          </div>
        </div>

        {/* Tower Shop */}
        {gameState === "PLAYING" && (
          <div className="w-full max-w-[800px] mx-auto mt-4 bg-black/40 border border-white/10 rounded-2xl p-4 flex gap-4 justify-center pointer-events-auto">
            <button 
              onClick={() => { audio.playSfx("click"); setSelectedTowerType("oak"); }}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedTowerType === "oak" ? 'border-green-500 bg-green-500/20' : 'border-transparent hover:bg-white/5'} ${money < 20 ? 'opacity-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#22c55e] border-4 border-[#064e3b] mb-2" />
              <span className="text-white font-bold text-sm">Oak Tree</span>
              <span className="text-yellow-400 font-black text-xs">$20</span>
            </button>
            <button 
              onClick={() => { audio.playSfx("click"); setSelectedTowerType("pine"); }}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedTowerType === "pine" ? 'border-green-400 bg-green-400/20' : 'border-transparent hover:bg-white/5'} ${money < 15 ? 'opacity-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#10b981] border-4 border-[#064e3b] mb-2" />
              <span className="text-white font-bold text-sm">Pine</span>
              <span className="text-yellow-400 font-black text-xs">$15</span>
            </button>
            <button 
              onClick={() => { audio.playSfx("click"); setSelectedTowerType("bamboo"); }}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${selectedTowerType === "bamboo" ? 'border-lime-500 bg-lime-500/20' : 'border-transparent hover:bg-white/5'} ${money < 10 ? 'opacity-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#84cc16] border-4 border-[#064e3b] mb-2" />
              <span className="text-white font-bold text-sm">Bamboo</span>
              <span className="text-yellow-400 font-black text-xs">$10</span>
            </button>
            
            <div className="ml-4 pl-4 border-l border-white/10 flex flex-col justify-center max-w-[200px]">
              <span className="text-white/60 text-xs leading-tight">
                {selectedTowerType ? `Click on the grid to place the ${selectedTowerType} tower.` : "Select a tree to plant. It will absorb CO2 clouds before they reach the city."}
              </span>
            </div>
          </div>
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="carbon-defender"
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
