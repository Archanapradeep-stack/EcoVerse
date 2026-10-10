"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function EnvironmentBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Generate random particles for leaves/dust
  const particles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
  }));

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-background pointer-events-none">
      {/* Sun Ray Gradient */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/40 via-transparent to-transparent opacity-60"></div>
      
      {/* Background landscape shapes (CSS Art mountains/hills) */}
      <motion.div 
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
        className="absolute bottom-0 left-[-10%] w-[120%] h-[40vh] bg-gradient-to-t from-primary/30 to-transparent rounded-[100%] blur-3xl opacity-50"
      ></motion.div>

      <motion.div 
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
        className="absolute bottom-[-10vh] right-[-10%] w-[80%] h-[50vh] bg-gradient-to-t from-accent/20 to-transparent rounded-[100%] blur-3xl opacity-40"
      ></motion.div>

      {/* Floating Clouds */}
      <motion.div 
        animate={{ x: ['-10%', '110%'] }}
        transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
        className="absolute top-[10%] left-0 w-64 h-16 bg-white/40 blur-2xl rounded-full"
      />
      <motion.div 
        animate={{ x: ['110%', '-10%'] }}
        transition={{ repeat: Infinity, duration: 180, ease: "linear" }}
        className="absolute top-[25%] right-0 w-96 h-24 bg-white/30 blur-2xl rounded-full"
      />

      {/* Floating Particles (Leaves / Magic Dust) */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/40 blur-[1px]"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [`${p.y}vh`, `${p.y - 20}vh`, `${p.y}vh`],
            x: [`${p.x}vw`, `${p.x + 10}vw`, `${p.x}vw`],
            opacity: [0, 0.8, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Light Overlay to blend elements */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
    </div>
  );
}
