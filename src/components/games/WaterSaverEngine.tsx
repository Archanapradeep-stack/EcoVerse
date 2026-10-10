"use client";

import { useEffect, useState } from "react";
import { Clock, Droplets, Droplet, Sprout, RotateCcw } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

// Pipe types and their connection points: 0=Top, 1=Right, 2=Bottom, 3=Left
type PipeType = "straight" | "corner" | "t_shape" | "cross" | "empty";
type PipeConnections = [boolean, boolean, boolean, boolean]; 

type GridCell = {
  id: string;
  type: PipeType;
  rotation: number; // 0, 90, 180, 270
  filled: boolean;
  baseConnections: PipeConnections;
  isSource?: boolean;
  isTarget?: boolean;
};

const GRID_SIZE = 5;

// Helper to get connections based on rotation
const getRotatedConnections = (base: PipeConnections, rot: number): PipeConnections => {
  const steps = rot / 90;
  const res = [...base];
  for (let i = 0; i < steps; i++) {
    const last = res.pop()!;
    res.unshift(last);
  }
  return res as PipeConnections;
};

const LEVEL_TEMPLATES = [
  // Level 1: Simple
  {
    start: { x: 0, y: 0 },
    end: { x: 4, y: 4 },
    grid: [
      [{t:"straight",r:90}, {t:"corner",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}],
      [{t:"empty",r:0}, {t:"straight",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}],
      [{t:"empty",r:0}, {t:"corner",r:270}, {t:"straight",r:90}, {t:"corner",r:90}, {t:"empty",r:0}],
      [{t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"straight",r:0}, {t:"empty",r:0}],
      [{t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"corner",r:270}, {t:"straight",r:90}],
    ]
  },
  // Level 2: Slightly harder
  {
    start: { x: 0, y: 2 },
    end: { x: 4, y: 2 },
    grid: [
      [{t:"empty",r:0}, {t:"empty",r:0}, {t:"corner",r:90}, {t:"straight",r:90}, {t:"corner",r:180}],
      [{t:"empty",r:0}, {t:"corner",r:90}, {t:"corner",r:270}, {t:"empty",r:0}, {t:"straight",r:0}],
      [{t:"straight",r:90}, {t:"corner",r:180}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"corner",r:270}],
      [{t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}],
      [{t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}, {t:"empty",r:0}],
    ]
  }
];

const PIPE_DEFS: Record<PipeType, PipeConnections> = {
  straight: [true, false, true, false],
  corner: [true, true, false, false],
  t_shape: [true, true, true, false],
  cross: [true, true, true, true],
  empty: [false, false, false, false]
};

export default function WaterSaverEngine() {
  const audio = useAudio();
  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [level, setLevel] = useState(0);

  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [waterFlowing, setWaterFlowing] = useState(false);

  const initLevel = (lvlIndex: number) => {
    const template = LEVEL_TEMPLATES[lvlIndex % LEVEL_TEMPLATES.length];
    
    // Create grid with scrambled rotations
    const newGrid: GridCell[][] = template.grid.map((row, y) => 
      row.map((cell: any, x) => ({
        id: `${x}-${y}`,
        type: cell.t,
        rotation: (cell.t === "empty" ? 0 : Math.floor(Math.random() * 4) * 90), // random start rotation
        filled: false,
        baseConnections: PIPE_DEFS[cell.t as PipeType],
        isSource: x === template.start.x && y === template.start.y,
        isTarget: x === template.end.x && y === template.end.y,
      }))
    );
    
    // Source is always filled initially
    newGrid[template.start.y][template.start.x].filled = true;
    
    setGrid(newGrid);
    setWaterFlowing(false);
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setEarnedXp(0);
    setEarnedCoins(0);
    setLevel(0);
    initLevel(0);
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

  // Flow traversal logic
  useEffect(() => {
    if (!grid.length) return;

    const newGrid = grid.map(row => 
      row.map(cell => ({ ...cell, filled: cell.isSource || false }))
    );

    let changed = true;
    while (changed) {
      changed = false;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const cell = newGrid[y][x];
          if (!cell.filled || cell.type === "empty") continue;

          const myConns = getRotatedConnections(cell.baseConnections, cell.rotation);

          // Top neighbor (my Top [0] connects to their Bottom [2])
          if (myConns[0] && y > 0) {
            const neighbor = newGrid[y-1][x];
            if (neighbor.type !== "empty" && !neighbor.filled) {
              const neighborConns = getRotatedConnections(neighbor.baseConnections, neighbor.rotation);
              if (neighborConns[2]) { neighbor.filled = true; changed = true; }
            }
          }
          // Right neighbor (my Right [1] connects to their Left [3])
          if (myConns[1] && x < GRID_SIZE - 1) {
            const neighbor = newGrid[y][x+1];
            if (neighbor.type !== "empty" && !neighbor.filled) {
              const neighborConns = getRotatedConnections(neighbor.baseConnections, neighbor.rotation);
              if (neighborConns[3]) { neighbor.filled = true; changed = true; }
            }
          }
          // Bottom neighbor (my Bottom [2] connects to their Top [0])
          if (myConns[2] && y < GRID_SIZE - 1) {
            const neighbor = newGrid[y+1][x];
            if (neighbor.type !== "empty" && !neighbor.filled) {
              const neighborConns = getRotatedConnections(neighbor.baseConnections, neighbor.rotation);
              if (neighborConns[0]) { neighbor.filled = true; changed = true; }
            }
          }
          // Left neighbor (my Left [3] connects to their Right [1])
          if (myConns[3] && x > 0) {
            const neighbor = newGrid[y][x-1];
            if (neighbor.type !== "empty" && !neighbor.filled) {
              const neighborConns = getRotatedConnections(neighbor.baseConnections, neighbor.rotation);
              if (neighborConns[1]) { neighbor.filled = true; changed = true; }
            }
          }
        }
      }
    }

    const isDifferent = newGrid.some((row, y) => 
      row.some((cell, x) => cell.filled !== grid[y][x].filled)
    );

    if (isDifferent) {
      setGrid(newGrid);
      
      // Check win
      let won = false;
      for(let y=0; y<GRID_SIZE; y++){
        for(let x=0; x<GRID_SIZE; x++){
          if(newGrid[y][x].isTarget && newGrid[y][x].filled) {
            won = true;
          }
        }
      }

      if (won && !waterFlowing) {
        setWaterFlowing(true);
        audio.playSfx("success");
        setTimeout(() => {
          setScore(s => s + 50);
          setEarnedXp(x => x + 15);
          setEarnedCoins(c => c + 5);
          setTimeLeft(t => t + 10);
          const nextLevel = level + 1;
          setLevel(nextLevel);
          initLevel(nextLevel);
        }, 1500);
      }
    }
  }, [grid, level, waterFlowing, audio]);

  const handleCellClick = (x: number, y: number) => {
    if (gameState !== "PLAYING" || waterFlowing) return;
    
    const cell = grid[y][x];
    if (cell.type === "empty") return;

    audio.playSfx("click");
    
    const newGrid = [...grid];
    newGrid[y][x] = { ...cell, rotation: (cell.rotation + 90) % 360 };
    setGrid(newGrid);
  };

  const renderPipeShape = (cell: GridCell) => {
    if (cell.type === "empty") return null;
    
    const isFilled = cell.filled;
    const color = isFilled ? "bg-blue-400" : "bg-slate-400";
    const shadow = isFilled ? "shadow-[0_0_15px_rgba(96,165,250,0.8)]" : "";

    return (
      <div 
        className="w-full h-full absolute inset-0 transition-transform duration-200 flex items-center justify-center"
        style={{ transform: `rotate(${cell.rotation}deg)` }}
      >
        {cell.type === "straight" && (
          <div className={`w-4 h-full ${color} ${shadow} transition-colors`} />
        )}
        
        {cell.type === "corner" && (
          <>
            <div className={`absolute top-0 w-4 h-1/2 ${color} ${shadow} transition-colors`} />
            <div className={`absolute right-0 w-1/2 h-4 ${color} ${shadow} transition-colors`} />
            <div className={`absolute w-4 h-4 ${color} ${shadow} transition-colors`} style={{ borderRadius: '0 8px 0 0' }} />
          </>
        )}
        
        {cell.type === "t_shape" && (
          <>
            <div className={`absolute w-full h-4 ${color} ${shadow} transition-colors`} />
            <div className={`absolute top-0 w-4 h-1/2 ${color} ${shadow} transition-colors`} />
          </>
        )}
        
        {cell.type === "cross" && (
          <>
            <div className={`absolute w-full h-4 ${color} ${shadow} transition-colors`} />
            <div className={`absolute h-full w-4 ${color} ${shadow} transition-colors`} />
          </>
        )}
      </div>
    );
  };

  return (
    <PremiumGameWrapper
      title="Water Saver"
      themeColor="from-blue-600 to-cyan-900"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col p-6 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-[#0F172A] to-cyan-900/30 pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* HUD */}
        {(gameState === "PLAYING" || gameState === "GAMEOVER") && (
          <div className="flex justify-between items-start z-10 w-full mb-8 pointer-events-none">
            <div className="flex gap-4">
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Score</span>
                <span className="text-white text-3xl font-black italic">{score}</span>
              </div>
              
              <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 flex flex-col items-center shadow-lg pointer-events-auto">
                <span className="text-white/60 text-xs font-black uppercase tracking-wider">Level</span>
                <span className="text-cyan-400 text-2xl font-black">{level + 1}</span>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg pointer-events-auto transition-colors border-white/10">
              <Clock size={24} className={timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'} />
              <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        )}

        {/* Game Area */}
        {gameState === "PLAYING" && (
          <div className="flex-1 flex flex-col items-center justify-center pb-10 z-10 w-full max-w-2xl mx-auto">
            
            <div className="bg-blue-950/40 backdrop-blur-xl border border-blue-500/20 p-4 rounded-3xl shadow-2xl relative">
              <div 
                className="grid gap-1 bg-black/40 p-2 rounded-2xl"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                {grid.map((row, y) => 
                  row.map((cell, x) => (
                    <div
                      key={cell.id}
                      className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center relative overflow-hidden transition-colors
                        ${cell.type === "empty" ? "bg-black/20" : "bg-slate-900 hover:bg-slate-800 cursor-pointer border border-white/5"}
                        ${cell.isSource ? "ring-2 ring-blue-500" : ""}
                        ${cell.isTarget ? "ring-2 ring-green-500" : ""}
                      `}
                      onClick={() => handleCellClick(x, y)}
                    >
                      {/* Grid background dots for style */}
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
                      
                      {cell.isSource && (
                        <div className="absolute top-2 left-2 z-10">
                          <Droplet size={20} className="text-blue-400 fill-blue-400 animate-pulse" />
                        </div>
                      )}
                      
                      {cell.isTarget && (
                        <div className="absolute bottom-2 right-2 z-10">
                          <Sprout size={24} className={cell.filled ? "text-green-400 animate-bounce" : "text-gray-500"} />
                        </div>
                      )}

                      {renderPipeShape(cell)}
                      
                      {/* Highlight when winning */}
                      {waterFlowing && cell.filled && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                          className="absolute inset-0 bg-blue-400 mix-blend-overlay"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-8 text-center text-white/60 text-sm font-medium">
              Click pipes to rotate them. <br/> Connect the water source 💧 to the thirsty plant 🌱!
            </div>

          </div>
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="water-saver"
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
