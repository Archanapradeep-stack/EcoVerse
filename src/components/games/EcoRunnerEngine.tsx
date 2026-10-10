"use client";

import { useEffect, useRef, useState } from "react";
import PremiumGameWrapper from "./PremiumGameWrapper";
import GameOverScreen from "./GameOverScreen";
import { useAudio } from "@/hooks/useAudio";

export default function EcoRunnerEngine() {
  const audio = useAudio();
  const [gameState, setGameState] = useState<"MENU" | "COUNTDOWN" | "PLAYING" | "PAUSED" | "GAMEOVER">("COUNTDOWN");
  const [finalScore, setFinalScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (gameState !== "PLAYING") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isGameOver = false;

    // Game Variables
    let score = 0;
    let gameSpeed = 6;
    let frameCount = 0;

    // Entities
    const player = {
      x: 100,
      y: canvas.height - 150,
      width: 40,
      height: 60,
      vy: 0,
      gravity: 0.8,
      jumpPower: -15,
      isGrounded: false,
      color: "#10b981", // Emerald green
    };

    const ground = {
      y: canvas.height - 50,
      height: 50,
    };

    type Obstacle = { x: number; y: number; width: number; height: number; speed: number; color: string; type: "spike" | "coin" };
    let obstacles: Obstacle[] = [];

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ground.y = canvas.height - 50;
      if (player.y > ground.y - player.height) {
        player.y = ground.y - player.height;
      }
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Input Handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && player.isGrounded) {
        player.vy = player.jumpPower;
        player.isGrounded = false;
        audio.playSfx("jump");
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    // Click/Touch Handling for mobile
    const handlePointerDown = () => {
      if (player.isGrounded) {
        player.vy = player.jumpPower;
        player.isGrounded = false;
        audio.playSfx("jump");
      }
    };
    canvas.addEventListener("pointerdown", handlePointerDown);

    // Main Game Loop
    const gameLoop = () => {
      if (isGameOver) return;

      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "#0f172a");
      gradient.addColorStop(1, "#1e293b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & Draw Player
      player.vy += player.gravity;
      player.y += player.vy;

      if (player.y + player.height >= ground.y) {
        player.y = ground.y - player.height;
        player.vy = 0;
        player.isGrounded = true;
      }

      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Draw Ground
      ctx.fillStyle = "#047857";
      ctx.fillRect(0, ground.y, canvas.width, ground.height);

      // Spawn Obstacles & Coins
      if (frameCount % Math.max(60, 150 - Math.floor(gameSpeed * 5)) === 0) {
        const isCoin = Math.random() > 0.6;
        if (isCoin) {
          obstacles.push({
            x: canvas.width,
            y: ground.y - 100 - Math.random() * 100,
            width: 30,
            height: 30,
            speed: gameSpeed,
            color: "#eab308",
            type: "coin",
          });
        } else {
          obstacles.push({
            x: canvas.width,
            y: ground.y - 40,
            width: 40,
            height: 40,
            speed: gameSpeed,
            color: "#ef4444",
            type: "spike",
          });
        }
      }

      // Update & Draw Obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= obs.speed;

        if (obs.type === "spike") {
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.lineTo(obs.x, obs.y + obs.height);
          ctx.fill();
        } else if (obs.type === "coin") {
          ctx.fillStyle = obs.color;
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Collision Detection (AABB)
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          if (obs.type === "coin") {
            score += 10;
            audio.playSfx("coin");
            obstacles.splice(i, 1);
            continue;
          } else {
            // Hit Spike - Game Over
            isGameOver = true;
            player.color = "#ef4444";
            audio.playSfx("error");
            
            setTimeout(() => {
              setFinalScore(score);
              setGameState("GAMEOVER");
            }, 1000);
          }
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
          if (obs.type === "spike") {
             // Passive score for dodging spikes
             score += 5;
          }
        }
      }

      // Draw Score
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(`Score: ${score}`, 30, 50);

      // Increase Speed over time
      if (frameCount % 600 === 0) {
        gameSpeed += 0.5;
      }

      if (!isGameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        // Render final frozen state
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }
    };

    // Start Loop
    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [gameState]);

  const startGame = () => {
    setFinalScore(0);
    // State is managed by PremiumGameWrapper (COUNTDOWN -> PLAYING)
  };

  return (
    <PremiumGameWrapper
      title="Eco Runner"
      themeColor="from-green-400 to-emerald-600"
      gameState={gameState}
      setGameState={setGameState}
      onGameStart={startGame}
      onRestart={startGame}
      audio={audio}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full absolute inset-0 z-0 bg-slate-900 cursor-pointer touch-none"
      />
      
      {gameState === "GAMEOVER" && (
        <GameOverScreen
          score={finalScore}
          xpEarned={Math.floor(finalScore / 2)}
          coinsEarned={Math.floor(finalScore / 5)}
          treesPlanted={Math.floor(finalScore / 100)}
          gameId="eco-runner"
          onPlayAgain={() => {
            audio.playSfx("click");
            setGameState("COUNTDOWN");
          }}
        />
      )}
    </PremiumGameWrapper>
  );
}
