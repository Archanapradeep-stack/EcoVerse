"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  className?: string;
}

export function GameCard({ children, className = "" }: GameCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`glass-panel relative rounded-[2rem] overflow-hidden group transition-shadow duration-300 hover:shadow-2xl hover:shadow-accent/30 ${className}`}
    >
      <div 
        style={{ transform: "translateZ(30px)" }} 
        className="w-full h-full relative z-10"
      >
        {children}
      </div>
      
      {/* Glare effect on hover */}
      <motion.div 
        className="absolute inset-0 z-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500"
        style={{ transform: "translateZ(10px)" }}
      />
    </motion.div>
  );
}
