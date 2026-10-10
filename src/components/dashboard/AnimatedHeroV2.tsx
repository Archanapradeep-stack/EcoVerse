"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { ThreeEarth } from "./ThreeEarth";
import Link from "next/link";

interface AnimatedHeroV2Props {
  name: string;
}

export function AnimatedHeroV2({ name }: AnimatedHeroV2Props) {
  return (
    <div className="relative w-full h-[60vh] min-h-[500px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl group border border-white/40">
      
      {/* 3D Earth Layer */}
      <div className="absolute inset-0 z-0">
        <ThreeEarth />
      </div>

      {/* Foreground Overlays to blend with the dashboard */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent z-10 pointer-events-none"></div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center px-8 md:px-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-4 leading-tight">
            Good Morning, <br/>
            <span className="text-glow text-accent">{name}</span> 👋
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 font-medium mb-10 max-w-xl">
            Ready to protect the planet today? Your forest is waiting to grow.
          </p>

          <Link href="/courses">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-panel hover:bg-white/80 text-foreground font-black text-lg px-8 py-4 rounded-2xl flex items-center gap-3 transition-colors shadow-xl group-hover:shadow-accent/20"
            >
              <div className="bg-accent text-white p-2 rounded-full">
                <Play size={20} fill="currentColor" />
              </div>
              Continue Adventure
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* AI Buddy Greeting */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
        className="absolute bottom-12 right-12 z-20 flex flex-col items-end hidden md:flex"
      >
        <div className="glass-panel p-4 rounded-2xl rounded-br-sm mb-4 relative max-w-xs shadow-xl border-accent/20">
          <p className="text-foreground font-bold text-sm">
            I&apos;ve prepared today&apos;s eco quests for you! 🌱 Let&apos;s get to work!
          </p>
        </div>
        
        {/* Cute Futuristic AI Avatar (CSS/SVG) */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-2xl">
            {/* Hologram base */}
            <ellipse cx="50" cy="90" rx="30" ry="10" fill="url(#glow)" opacity="0.6"/>
            <path d="M50 20C30 20 20 40 20 50C20 60 30 75 50 75C70 75 80 60 80 50C80 40 70 20 50 20Z" fill="#FFFFFF" stroke="#43C97B" strokeWidth="4"/>
            {/* Cute Eyes */}
            <circle cx="38" cy="45" r="5" fill="#1A4331"/>
            <circle cx="62" cy="45" r="5" fill="#1A4331"/>
            {/* Smile */}
            <path d="M42 55Q50 62 58 55" stroke="#1A4331" strokeWidth="3" strokeLinecap="round"/>
            {/* Leaves growing on head */}
            <path d="M50 20C45 10 55 5 60 10C55 15 55 20 50 20Z" fill="#43C97B"/>
            
            <defs>
              <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
                <stop stopColor="#43C97B" stopOpacity="0.8"/>
                <stop offset="1" stopColor="#43C97B" stopOpacity="0"/>
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
