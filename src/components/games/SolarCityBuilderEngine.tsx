"use client";

import { useEffect, useState } from "react";
import { Clock, Zap, Home, Sun, RotateCcw } from "lucide-react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";
import { motion, AnimatePresence } from "framer-motion";

type CellType = "empty" | "solar" | "house" | "wire_h" | "wire_v" | "wire_cross";
type GridCell = {
  id: string;
  type: CellType;
  powered: boolean;
};

const GRID_SIZE = 5;

const LEVEL_TEMPLATES = [
  // Level 1: Simple horizontal
  [
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["solar", "empty", "empty", "empty", "house"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
  ],
  // Level 2: Diagonal-ish
  [
    ["solar", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "house"],
  ],
  // Level 3: Multiple houses
  [
    ["solar", "empty", "empty", "empty", "house"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["empty", "empty", "empty", "empty", "empty"],
    ["house", "empty", "empty", "empty", "solar"],
  ],
];

export default function SolarCityBuilderEngine() {
  const audio = useAudio();
  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [earnedXp, setEarnedXp] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [level, setLevel] = useState(0);

  const [grid, setGrid] = useState<GridCell[][]>([]);

  const initLevel = (lvlIndex: number) => {
    const template = LEVEL_TEMPLATES[lvlIndex % LEVEL_TEMPLATES.length] as CellType[][];
    const newGrid: GridCell[][] = template.map((row, y) => 
      row.map((type, x) => ({
        id: `${x}-${y}`,
        type,
        powered: type === "solar"
      }))
    );
    setGrid(newGrid);
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

  // Power traversal logic
  useEffect(() => {
    if (!grid.length) return;

    // Reset power state (except solars)
    let newGrid = grid.map(row => 
      row.map(cell => ({ ...cell, powered: cell.type === "solar" }))
    );

    let changed = true;
    while (changed) {
      changed = false;
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const cell = newGrid[y][x];
          if (!cell.powered) continue;

          // Check neighbors to propagate power
          const neighbors = [
            { nx: x, ny: y - 1, validFrom: ["solar", "wire_v", "wire_cross"], validTo: ["house", "wire_v", "wire_cross"] }, // Up
            { nx: x, ny: y + 1, validFrom: ["solar", "wire_v", "wire_cross"], validTo: ["house", "wire_v", "wire_cross"] }, // Down
            { nx: x - 1, ny: y, validFrom: ["solar", "wire_h", "wire_cross"], validTo: ["house", "wire_h", "wire_cross"] }, // Left
            { nx: x + 1, ny: y, validFrom: ["solar", "wire_h", "wire_cross"], validTo: ["house", "wire_h", "wire_cross"] }, // Right
          ];

          for (const { nx, ny, validFrom, validTo } of neighbors) {
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
              const neighbor = newGrid[ny][nx];
              if (!neighbor.powered && validFrom.includes(cell.type) && validTo.includes(neighbor.type)) {
                neighbor.powered = true;
                changed = true;
              }
            }
          }
        }
      }
    }

    // Check if grid state changed before updating to prevent infinite loop
    const isDifferent = newGrid.some((row, y) => 
      row.some((cell, x) => cell.powered !== grid[y][x].powered)
    );

    if (isDifferent) {
      setGrid(newGrid);
      
      // Check win condition
      const allHousesPowered = newGrid.every(row => 
        row.every(cell => cell.type !== "house" || cell.powered)
      );

      if (allHousesPowered) {
        audio.playSfx("success");
        setTimeout(() => {
          setScore(s => s + 50);
          setEarnedXp(x => x + 10);
          setEarnedCoins(c => c + 5);
          setTimeLeft(t => t + 5); // Bonus time
          const nextLevel = level + 1;
          setLevel(nextLevel);
          initLevel(nextLevel);
        }, 1000);
      }
    }
  }, [grid, level, audio]);

  const handleCellClick = (x: number, y: number) => {
    if (gameState !== "PLAYING") return;
    
    const cell = grid[y][x];
    if (cell.type === "solar" || cell.type === "house") {
      audio.playSfx("error");
      return;
    }

    audio.playSfx("click");
    
    const nextType: Record<CellType, CellType> = {
      empty: "wire_h",
      wire_h: "wire_v",
      wire_v: "wire_cross",
      wire_cross: "empty",
      solar: "solar",
      house: "house"
    };

    const newGrid = [...grid];
    newGrid[y][x] = { ...cell, type: nextType[cell.type] };
    setGrid(newGrid);
  };

  return (
    <PremiumGameWrapper
      title="Solar City Builder"
      themeColor="from-yellow-500 to-orange-700"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-auto bg-[#0F172A] flex flex-col p-6 overflow-hidden">
        
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-900/20 via-[#0F172A] to-[#0F172A] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />

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
                <span className="text-yellow-400 text-2xl font-black">{level + 1}</span>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl px-6 py-3 border flex items-center gap-3 shadow-lg pointer-events-auto transition-colors border-white/10">
              <Clock size={24} className={timeLeft <= 10 ? 'text-red-400' : 'text-yellow-400'} />
              <span className={`text-3xl font-black italic ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        )}

        {/* Game Area */}
        {gameState === "PLAYING" && (
          <div className="flex-1 flex flex-col items-center justify-center pb-10 z-10 w-full max-w-2xl mx-auto">
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-2xl">
              <div 
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
              >
                <AnimatePresence>
                  {grid.map((row, y) => 
                    row.map((cell, x) => (
                      <motion.div
                        key={cell.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center cursor-pointer transition-colors relative overflow-hidden group
                          ${cell.type === "empty" ? "bg-black/20 hover:bg-white/10 border border-white/5" : ""}
                          ${cell.type === "solar" ? "bg-yellow-500/20 border border-yellow-500/50" : ""}
                          ${cell.type === "house" ? (cell.powered ? "bg-green-500/20 border border-green-500/50" : "bg-red-500/20 border border-red-500/50") : ""}
                          ${cell.type.includes("wire") ? (cell.powered ? "bg-yellow-500/10 border border-yellow-500/30" : "bg-white/10 border border-white/10") : ""}
                        `}
                        onClick={() => handleCellClick(x, y)}
                      >
                        {cell.type === "solar" && (
                          <Sun size={40} className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-pulse" />
                        )}
                        {cell.type === "house" && (
                          <Home size={40} className={cell.powered ? "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" : "text-red-400"} />
                        )}
                        
                        {/* Wires */}
                        {cell.type === "wire_h" && (
                          <div className={`w-full h-4 ${cell.powered ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" : "bg-gray-500"} transition-colors`} />
                        )}
                        {cell.type === "wire_v" && (
                          <div className={`h-full w-4 ${cell.powered ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" : "bg-gray-500"} transition-colors`} />
                        )}
                        {cell.type === "wire_cross" && (
                          <>
                            <div className={`absolute w-full h-4 top-1/2 -translate-y-1/2 ${cell.powered ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" : "bg-gray-500"} transition-colors`} />
                            <div className={`absolute h-full w-4 left-1/2 -translate-x-1/2 ${cell.powered ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]" : "bg-gray-500"} transition-colors`} />
                          </>
                        )}
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-8 text-center text-white/60 text-sm font-medium">
              Click empty tiles to place and rotate power lines. <br/> Connect the Solar Panels to the Houses!
            </div>

            <button 
              onClick={() => {
                audio.playSfx("click");
                initLevel(level);
              }}
              className="mt-6 flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white font-bold text-sm border border-white/10"
            >
              <RotateCcw size={16} /> RESET GRID
            </button>

          </div>
        )}

        {gameState === "GAMEOVER" && (
          <GameOverScreen
            score={score}
            xpEarned={earnedXp}
            coinsEarned={earnedCoins}
            gameId="solar-city"
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
