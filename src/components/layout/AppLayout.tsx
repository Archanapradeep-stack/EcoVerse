"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Home, BookOpen, Gamepad2, Target, Trophy, 
  Bot, Award, Users, Settings, Search, Bell, 
  Leaf, Flame, TreePine 
} from "lucide-react";

export type ProfileData = {
  xp: number;
  coins: number;
  level: number;
  streak: number;
  treesPlanted: number;
  completedCourses: string[];
  badges: string[];
  dailyMissions: string;
};

export type AppLayoutProps = {
  children: React.ReactNode;
  profile: ProfileData;
  firstName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  role: string;
  activePath?: string;
};

export default function AppLayout({ children, profile, firstName, fullName, imageUrl, role, activePath = "/" }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-[#F4F9F4] text-[#1A4331] font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white flex flex-col justify-between h-full shadow-[2px_0_15px_rgba(0,0,0,0.02)] z-10 hidden md:flex shrink-0 relative overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div>
          {/* Logo */}
          <div className="p-8 pb-4 flex flex-col items-center">
            <div className="text-primary mb-2">
              <Leaf size={40} className="fill-primary" strokeWidth={1} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">EcoVerse</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Learn. Play. Protect.</p>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-4 space-y-1">
            <NavItem icon={Home} label="Home" href="/" active={activePath === "/"} />
            <NavItem icon={BookOpen} label="Courses" href="/courses" active={activePath === "/courses"} />
            <NavItem icon={Gamepad2} label="Games" href="/games" active={activePath === "/games"} />
            <NavItem icon={Target} label="Challenges" href="/challenges" active={activePath === "/challenges"} />
            <NavItem icon={Trophy} label="Leaderboard" href="/leaderboard" active={activePath === "/leaderboard"} />
            <NavItem icon={Bot} label="AI Buddy" href="/buddy" active={activePath === "/buddy"} />
            <NavItem icon={Award} label="Certificates" href="/certificates" active={activePath === "/certificates"} />
            <NavItem icon={Users} label="Community" href="/community" active={activePath === "/community"} />
            <NavItem icon={Settings} label="Settings" href="/settings" active={activePath === "/settings"} />
          </nav>
        </div>

        {/* Banner */}
        <div className="px-4 pb-8">
          <div className="relative rounded-3xl overflow-hidden h-48 w-full p-6 text-white shadow-lg group cursor-pointer">
            <Image 
              src="/images/leaves_banner.jpg" 
              alt="Leaves background" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 h-full flex flex-col justify-center">
              <h3 className="text-2xl font-black leading-tight text-white mb-2 drop-shadow-md">
                Small<br/>Actions<br/>Big<br/>Change
              </h3>
              <Leaf size={20} className="text-primary fill-primary drop-shadow-md" />
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* TOP NAV */}
        <header className="h-20 flex items-center justify-between px-8 shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          
          {/* Search */}
          <div className="relative w-96 group">
            <input 
              type="text" 
              placeholder="Search for courses, games, or topics..." 
              className="w-full h-12 pl-6 pr-12 rounded-full bg-white border border-transparent focus:border-primary/30 shadow-sm text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          </div>

          {/* User Stats & Profile */}
          <div className="flex items-center gap-4">
            
            {/* Level & XP */}
            <div className="bg-white px-4 py-2 rounded-full flex items-center gap-3 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Leaf size={16} className="text-primary fill-primary" />
              </div>
              <div>
                <div className="text-sm font-bold">Level {profile.level}</div>
                <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min((profile.xp / 300) * 100, 100)}%` }} />
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-bold ml-1">{profile.xp}/300 XP</span>
            </div>

            {/* Coins */}
            <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-500 shadow-inner" />
              </div>
              <div>
                <div className="text-sm font-bold">{profile.coins}</div>
                <div className="text-[10px] text-muted-foreground font-bold">Coins</div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame size={16} className="text-orange-500 fill-orange-500" />
              </div>
              <div>
                <div className="text-sm font-bold">{profile.streak}</div>
                <div className="text-[10px] text-muted-foreground font-bold">Day Streak</div>
              </div>
            </div>

            {/* Trees */}
            <div className="bg-white px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <TreePine size={16} className="text-green-600 fill-green-600" />
              </div>
              <div>
                <div className="text-sm font-bold">{profile.treesPlanted}</div>
                <div className="text-[10px] text-muted-foreground font-bold">Trees Planted</div>
              </div>
            </div>

            {/* Notification */}
            <button className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm relative hover:bg-muted transition-colors border border-gray-100">
              <Bell size={20} className="text-foreground" />
              {/* Fake notification dot for new users */}
              {profile.completedCourses.length === 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
              )}
            </button>

            {/* Profile */}
            <button className="bg-white pl-2 pr-4 py-1.5 rounded-full flex items-center gap-3 shadow-sm hover:bg-muted transition-colors border border-gray-100">
              <div className="w-12 h-12 shrink-0">
                <RobustAvatar imageUrl={imageUrl} name={firstName || fullName || "Student"} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold leading-tight">{firstName || fullName || "Student"} <span className="text-[10px]">▼</span></div>
                <div className="text-[11px] text-muted-foreground font-medium capitalize">{role.toLowerCase() || "Student"}</div>
              </div>
            </button>

          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {children}
        </div>
      </main>

    </div>
  );
}

function NavItem({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3.5 rounded-full font-bold text-sm transition-all
        ${active 
          ? "bg-[#EEF8F2] text-[#1A4331]" 
          : "text-[#4B6B58] hover:bg-[#EEF8F2]/50 hover:text-[#1A4331]"
        }`}
    >
      <Icon size={20} className={active ? "text-primary" : ""} />
      {label}
    </Link>
  );
}

export function RobustAvatar({ imageUrl, name }: { imageUrl?: string | null, name: string }) {
  const [error, setError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full h-full rounded-full overflow-hidden bg-primary/20 flex items-center justify-center font-bold text-primary">
      {imageUrl && !error ? (
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={() => setError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
