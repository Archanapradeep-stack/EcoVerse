"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Play, BookOpen, Target, Award, Bot, ChevronRight, 
  CheckCircle2, Flame, TreePine, Crown, TrendingUp, Zap, Clock, Shield, History
} from "lucide-react";

import AppLayout, { ProfileData, RobustAvatar } from "../layout/AppLayout";

type DashboardUIProps = {
  profile: ProfileData;
  firstName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  role: string;
  missions?: any[];
  currentCourseDetails?: any | null;
  percentComplete?: number;
  recommendedTopic?: string | null;
};

export default function DashboardUI({ 
  profile, firstName, fullName, imageUrl, role, 
  missions = [], currentCourseDetails, percentComplete = 0, recommendedTopic 
}: DashboardUIProps) {
  const isNewUser = profile.completedCourses.length === 0 && !currentCourseDetails;
  
  // Default missions if none passed (from profile)
  let activeMissions = missions;
  if (activeMissions.length === 0) {
    try {
      activeMissions = JSON.parse(profile.dailyMissions || "[]");
    } catch (e) {}
  }

  const container: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout profile={profile} firstName={firstName} fullName={fullName} imageUrl={imageUrl} role={role} activePath="/">
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN - Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* WELCOME HERO */}
            <motion.div variants={item} className="relative w-full h-[260px] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] group border border-white bg-white">
              <Image 
                src="/images/hero_background.jpg" 
                alt="Hero Background" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent backdrop-blur-[2px]" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-center max-w-[600px]">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                  <div className="bg-primary/10 text-primary text-xs font-black px-3 py-1.5 rounded-full inline-block mb-4 border border-primary/20">
                    WELCOME BACK
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-[#1A4331] leading-[1.1] mb-3 tracking-tight">
                    Ready to learn, <br/><span className="text-primary">{firstName || "Eco-Warrior"}?</span>
                  </h1>
                  <p className="text-[#1A4331]/70 font-medium mb-6 text-sm md:text-base">
                    You're on a {profile.streak}-day streak! Keep up the momentum and unlock your next reward.
                  </p>
                  <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:-translate-y-1 active:scale-95">
                    View Today's Path <ChevronRight size={18} />
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* CONTINUE LEARNING & PLAYING ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Continue Learning */}
              <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-primary/20 transition-all group flex flex-col">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2 font-bold text-lg text-[#1A4331]">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <BookOpen size={16} className="text-blue-600" />
                    </div>
                    Continue Learning
                  </div>
                </div>

                {currentCourseDetails ? (
                  <div className="flex flex-col flex-1">
                    <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 shadow-inner">
                      <Image src={currentCourseDetails.thumbnail || "/images/turtle_ocean.jpg"} alt="Course" fill className="object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="font-bold text-[#1A4331] mb-1 line-clamp-1">{currentCourseDetails.title}</h4>
                    <p className="text-xs text-[#1A4331]/70 font-medium mb-4 line-clamp-1">{currentCourseDetails.description}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between text-xs font-bold mb-2">
                        <span className="text-primary">Progress</span>
                        <span className="text-[#1A4331]">{percentComplete}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }} 
                          whileInView={{ width: `${percentComplete}%` }} 
                          transition={{ duration: 1 }}
                          className="h-full bg-primary rounded-full" 
                        />
                      </div>
                      <Link href={`/courses/${currentCourseDetails.id}`} className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                        Resume Course <Play size={14} className="fill-current" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                      <BookOpen size={24} className="text-gray-300" />
                    </div>
                    <h4 className="font-bold text-[#1A4331] mb-1">No Active Course</h4>
                    <p className="text-xs text-[#1A4331]/60 font-medium mb-4">Start learning to track progress.</p>
                    <Link href="/courses" className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-sm transition-transform hover:scale-105 active:scale-95">
                      Explore Courses
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Continue Playing */}
              <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:border-primary/20 transition-all group flex flex-col">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2 font-bold text-lg text-[#1A4331]">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <Play size={16} className="text-orange-600 fill-orange-600" />
                    </div>
                    Continue Playing
                  </div>
                </div>

                <div className="flex flex-col flex-1">
                  <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 shadow-inner">
                    <Image src="/images/forest.jpg" alt="Eco Runner" fill className="object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md text-[#1A4331] text-[10px] font-black px-2 py-1 rounded-md shadow-sm border border-white/50">LEVEL 1</div>
                  </div>
                  <h4 className="font-bold text-[#1A4331] mb-1">Eco Runner</h4>
                  <p className="text-xs text-[#1A4331]/70 font-medium mb-4 line-clamp-1">Dash through the forest and collect waste.</p>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex gap-2">
                        <div className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Zap size={10} className="fill-current" /> +10 XP
                        </div>
                      </div>
                    </div>
                    <Link href="/games/eco-runner" className="w-full bg-orange-50 text-orange-600 hover:bg-orange-100 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      Play Now <Play size={14} className="fill-current" />
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* ROW 3: WEEKLY PROGRESS & RECENT ACTIVITY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* WEEKLY PROGRESS */}
              <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 font-bold text-lg text-[#1A4331]">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp size={16} className="text-green-600" />
                    </div>
                    Weekly Progress
                  </div>
                </div>

                <div className="flex justify-between items-end flex-1 gap-2 px-2 pb-2">
                  {[40, 70, 45, 90, 60, 0, 0].map((val, i) => {
                    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    const isToday = i === 4; // Assuming Friday for demo
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 w-full">
                        <div className="w-full bg-gray-50 rounded-t-lg flex items-end justify-center relative overflow-hidden" style={{ height: '80px' }}>
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${val}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className={`w-full rounded-t-lg ${isToday ? 'bg-primary shadow-[0_0_10px_rgba(67,201,123,0.5)]' : 'bg-primary/30'}`}
                          />
                        </div>
                        <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-[#1A4331]/50'}`}>{days[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* RECENT ACTIVITY */}
              <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 font-bold text-lg text-[#1A4331]">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <History size={16} className="text-purple-600" />
                    </div>
                    Recent Activity
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100">
                      <Play size={12} className="text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1A4331]">Played Eco Runner</div>
                      <div className="text-xs font-medium text-muted-foreground">Earned 25 XP • 2 hours ago</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100">
                      <BookOpen size={12} className="text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1A4331]">Started Ocean Pollution</div>
                      <div className="text-xs font-medium text-muted-foreground">Course Module • Yesterday</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 border border-yellow-100">
                      <Award size={12} className="text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1A4331]">Earned Tree Planter Badge</div>
                      <div className="text-xs font-medium text-muted-foreground">Achievement • 2 days ago</div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

          </div>

          {/* RIGHT COLUMN - Widgets */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* AI BUDDY */}
            <motion.div variants={item} className="bg-gradient-to-br from-[#E8F4FE] to-[#F1F5FD] rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Bot size={140} className="text-blue-400" />
              </div>
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-white/50">
                  <Bot size={20} className="text-blue-500" />
                </div>
                <h3 className="font-bold text-[#1A4331]">AI Guide</h3>
              </div>
              
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-5 border border-white shadow-sm text-sm font-medium text-[#1A4331]/80 relative z-10 leading-relaxed shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                {recommendedTopic ? (
                  <>I noticed you were looking at <span className="font-black text-blue-600">{recommendedTopic}</span> earlier. Play <span className="font-black text-primary">Carbon Defender</span> to test your knowledge!</>
                ) : (
                  <>Hi! I'm your Eco Buddy. Complete your first lesson and I'll begin giving personalized recommendations for your journey.</>
                )}
              </div>
            </motion.div>

            {/* DAILY MISSIONS */}
            <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 font-bold text-lg text-[#1A4331]">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Target size={16} className="text-red-500" />
                  </div>
                  Daily Missions
                </div>
                <div className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-100">
                  <Clock size={10} /> 12h
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {activeMissions.length === 0 ? (
                  <p className="text-sm text-[#1A4331]/50 font-medium text-center py-4">No active missions.</p>
                ) : (
                  activeMissions.slice(0, 3).map((mission: any, idx: number) => (
                    <div key={mission.id || idx} className="flex items-center gap-4 group">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${mission.completed ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {mission.completed ? <CheckCircle2 size={20} /> : <Target size={20} />}
                      </div>
                      <div className="flex-1">
                        <h5 className={`font-bold text-sm leading-tight mb-1 ${mission.completed ? 'text-muted-foreground line-through' : 'text-[#1A4331]'}`}>{mission.title}</h5>
                        <div className="flex gap-2 text-[10px] font-bold">
                          <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{mission.xp || 50} XP</span>
                          <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-100">{mission.coins || 10} Coins</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* ACHIEVEMENTS */}
            <motion.div variants={item} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2 font-bold text-lg text-[#1A4331]">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Award size={16} className="text-yellow-600" />
                  </div>
                  Achievements
                </div>
                <Link href="/achievements" className="text-xs font-bold text-primary hover:underline">View All</Link>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <Award size={24} className="text-yellow-500" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A4331] text-center leading-tight">First Course</span>
                </div>
                
                <div className="flex flex-col items-center group cursor-pointer opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <Crown size={24} className="text-gray-400" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A4331] text-center leading-tight">Quiz Master</span>
                </div>

                <div className="flex flex-col items-center group cursor-pointer opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <TreePine size={24} className="text-gray-400" />
                  </div>
                  <span className="text-[10px] font-bold text-[#1A4331] text-center leading-tight">Tree Planter</span>
                </div>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
