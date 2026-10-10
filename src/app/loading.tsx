"use client";

import { motion } from "framer-motion";
import { Loader2, Leaf } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#0F172A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] animate-pulse" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-white/10 border-t-green-500 rounded-full"
          />
          <Leaf className="text-green-500" size={32} />
        </div>
        
        <h2 className="text-2xl font-black italic tracking-wider text-white mb-2">LOADING ECOVERSE</h2>
        <p className="text-white/50 text-sm font-medium">Preparing your environment...</p>
      </motion.div>
    </div>
  );
}
