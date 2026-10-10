"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

interface PhaserGameProps {
  gameConfig: Phaser.Types.Core.GameConfig;
  onGameCreated?: (game: Phaser.Game) => void;
}

export default function PhaserGame({ gameConfig, onGameCreated }: PhaserGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && gameRef.current && !phaserGameRef.current) {
      // Ensure Phaser doesn't duplicate
      const config = {
        ...gameConfig,
        parent: gameRef.current,
      };

      const game = new Phaser.Game(config);
      phaserGameRef.current = game;

      if (onGameCreated) {
        onGameCreated(game);
      }
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, [gameConfig, onGameCreated]);

  return <div ref={gameRef} className="w-full h-full" />;
}
