"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // We lazily instantiate the audio objects so they aren't created server-side
  useEffect(() => {
    bgmRef.current = new Audio("/audio/bgm-main.mp3");
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.4;
  }, []);

  const playBgm = useCallback(() => {
    if (!isMuted && bgmRef.current) {
      bgmRef.current.play().catch((e) => console.log("Audio play blocked by browser"));
    }
  }, [isMuted]);

  const pauseBgm = useCallback(() => {
    if (bgmRef.current) {
      bgmRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      if (newMuted) {
        pauseBgm();
      } else {
        // playBgm uses the new state, but since it's a closure over isMuted,
        // we manually start it if unmuting
        if (bgmRef.current) {
          bgmRef.current.play().catch(() => {});
        }
      }
      return newMuted;
    });
  }, [pauseBgm]);

  const playSfx = useCallback((type: "click" | "coin" | "jump" | "error" | "success" | "combo") => {
    if (isMuted) return;
    
    // Create new audio instance for overlapping sounds
    const sfx = new Audio(`/audio/sfx-${type}.mp3`);
    sfx.volume = 0.6;
    sfx.play().catch(() => {});
  }, [isMuted]);

  return { playBgm, pauseBgm, toggleMute, playSfx, isMuted };
}
