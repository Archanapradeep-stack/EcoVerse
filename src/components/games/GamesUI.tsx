"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Zap, Target, Shield, Lock, ChevronRight, Star, Clock, Trophy,
  Search, Filter, Gamepad2, Sparkles, TrendingUp, Download
} from "lucide-react";
import AppLayout, { ProfileData } from "../layout/AppLayout";
import { useRouter } from "next/navigation";

type ExtendedProfile = ProfileData & {
  energy?: number | null;
  maxEnergy?: number | null;
};

type GamesUIProps = {
  profile: ExtendedProfile;
  firstName: string | null;
  fullName: string | null;
  imageUrl: string | null;
  role: string;
  gameProgress?: any[];
};

const AVAILABLE_GAMES = [
  {
    id: "eco-runner",
    slug: "eco-runner",
    title: "Eco Runner",
    desc: "Endless runner. Jump over plastic waste, collect trees and leaves!",
    image: "/images/forest.jpg",
    difficulty: "Easy",
    xp: 10,
    coins: 5,
    minLevel: 1,
    tag: "FEATURED",
    category: "Action",
    players: "1.2k"
  },
  {
    id: "carbon-defender",
    slug: "carbon-defender",
    title: "Carbon Defender",
    desc: "Plant trees strategically to defend the city from CO2 clouds!",
    image: "/images/city.jpg",
    difficulty: "Medium",
    xp: 35,
    coins: 20,
    minLevel: 2,
    tag: "TRENDING",
    category: "Strategy",
    players: "840"
  },
  {
    id: "water-saver",
    slug: "water-saver",
    title: "Water Saver",
    desc: "Rotate pipes to create a continuous flow from source to plants before they dry up.",
    image: "/images/river.jpg",
    difficulty: "Hard",
    xp: 25,
    coins: 10,
    minLevel: 3,
    category: "Puzzle",
    players: "520"
  },
  {
    id: "eco-quiz-battle",
    slug: "eco-quiz-battle",
    title: "Eco Quiz Battle",
    desc: "Face off in a fast-paced trivia battle about the environment!",
    image: "/images/earth.jpg",
    difficulty: "Medium",
    xp: 50,
    coins: 25,
    minLevel: 1,
    category: "Trivia",
    players: "2.1k"
  },
  {
    id: "tree-planting",
    slug: "tree-planting",
    title: "Tree Plantation Simulator",
    desc: "Plant seeds, give them water and sunlight, and watch them grow into a massive forest!",
    image: "/images/forest.jpg",
    difficulty: "Easy",
    xp: 15,
    coins: 5,
    minLevel: 1,
    tag: "NEW",
    category: "Simulation",
    players: "300"
  },
  {
    id: "ocean-cleanup",
    slug: "ocean-cleanup",
    title: "Ocean Cleanup",
    desc: "Navigate your boat to collect floating plastic and save marine life.",
    image: "/images/ocean.jpg",
    difficulty: "Hard",
    xp: 30,
    coins: 15,
    minLevel: 2,
    category: "Action",
    players: "610"
  },
  {
    id: "recycling-factory",
    slug: "recycling-factory",
    title: "Recycling Factory",
    desc: "Manage the conveyor belts to sort waste into the correct bins before they overflow!",
    image: "/images/recycle.jpg",
    difficulty: "Hard",
    xp: 40,
    coins: 20,
    minLevel: 4,
    category: "Simulation",
    players: "450"
  },
  {
    id: "solar-city",
    slug: "solar-city",
    title: "Solar City Builder",
    desc: "Connect solar panels to houses using power lines to maximize clean energy.",
    image: "/images/city.jpg",
    difficulty: "Hard",
    xp: 50,
    coins: 25,
    minLevel: 5,
    category: "Puzzle",
    players: "890"
  },
  {
    id: "trash-sorting",
    slug: "trash-sorting",
    title: "Trash Sorting",
    desc: "Sort waste into correct bins before time runs out in this fast-paced puzzle.",
    image: "/images/recycle.jpg",
    difficulty: "Medium",
    xp: 20,
    coins: 10,
    minLevel: 1,
    category: "Puzzle",
    players: "1.5k"
  },
  {
    id: "plastic-collector",
    slug: "plastic-collector",
    title: "Plastic Collector",
    desc: "Catch the falling plastic bottles before they hit the ground!",
    image: "/images/ocean.jpg",
    difficulty: "Hard",
    xp: 60,
    coins: 30,
    minLevel: 6,
    category: "Arcade",
    players: "220"
  }
];

export default function GamesUI({ profile, firstName, fullName, imageUrl, role }: GamesUIProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Action", "Strategy", "Puzzle", "Trivia", "Simulation"];

  const filteredGames = AVAILABLE_GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredGame = AVAILABLE_GAMES[0];
  const trendingGames = AVAILABLE_GAMES.filter(g => g.tag === "TRENDING" || g.players > "1k");
  const newGames = AVAILABLE_GAMES.filter(g => g.tag === "NEW");

  const container: any = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout profile={profile} firstName={firstName} fullName={fullName} imageUrl={imageUrl} role={role} activePath="/games">
      <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-10">
          
          {/* HEADER & SEARCH */}
          <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
                <Gamepad2 className="text-primary" size={28} /> Game Store
              </h1>
              <p className="text-muted-foreground font-medium mt-1">Play, learn, and earn real rewards.</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Search games..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                />
              </div>
              <button className="bg-white border border-border p-2.5 rounded-xl hover:bg-muted transition-colors shadow-sm text-foreground">
                <Filter size={18} />
              </button>
            </div>
          </motion.div>

          {/* FEATURED BANNER */}
          {!searchQuery && activeCategory === "All" && (
            <motion.section variants={item} className="relative w-full h-[400px] md:h-[500px] rounded-[24px] overflow-hidden group shadow-lg border border-white/50 bg-black cursor-pointer" onClick={() => router.push(`/games/${featuredGame.slug}`)}>
              <Image src={featuredGame.image} alt={featuredGame.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-0 left-0 p-8 md:p-12 flex flex-col justify-end max-w-[700px] z-10">
                <div className="flex gap-2 mb-4">
                  <span className="bg-primary text-primary-foreground text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-primary/20">FEATURED</span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/10">{featuredGame.category}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-lg">
                  {featuredGame.title}
                </h2>
                <p className="text-white/80 font-medium mb-8 text-sm md:text-lg leading-relaxed line-clamp-2 max-w-2xl drop-shadow">
                  {featuredGame.desc}
                </p>
                
                <div className="flex gap-4">
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-black shadow-[0_0_20px_rgba(46,204,113,0.4)] flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 text-lg">
                    <Play className="fill-current" size={20} /> PLAY NOW
                  </button>
                  <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl font-bold border border-white/20 transition-all flex items-center gap-2">
                    <Trophy size={18} className="text-yellow-400" /> LEADERBOARD
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* CATEGORIES */}
          <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap snap-start transition-all shadow-sm
                  ${activeCategory === cat 
                    ? 'bg-primary text-primary-foreground border border-primary' 
                    : 'bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground'
                  }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* TRENDING GAMES */}
          {(!searchQuery && activeCategory === "All") && (
            <motion.section variants={item}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                  <TrendingUp className="text-orange-500" /> Trending Now
                </h3>
                <button className="text-primary font-bold text-sm hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingGames.slice(0, 4).map(game => (
                  <GameStoreCard key={game.id} game={game} profile={profile} />
                ))}
              </div>
            </motion.section>
          )}

          {/* ALL GAMES GRID */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-6 mt-8">
              <h3 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Sparkles className="text-purple-500" /> All Games
              </h3>
            </div>
            
            {filteredGames.length === 0 ? (
              <div className="bg-white border border-border rounded-[24px] p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No games found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredGames.map(game => (
                  <GameStoreCard key={game.id} game={game} profile={profile} />
                ))}
              </div>
            )}
          </motion.section>

        </motion.div>
      </div>
    </AppLayout>
  );
}

// --- Subcomponents ---

function GameStoreCard({ game, profile }: { game: any; profile: ExtendedProfile }) {
  const isLocked = profile.level < game.minLevel;

  return (
    <Link href={isLocked ? '#' : `/games/${game.slug}`} className={`group flex flex-col bg-white rounded-[24px] border border-border shadow-sm hover:shadow-[0_10px_40px_rgba(46,204,113,0.15)] transition-all duration-300 overflow-hidden ${isLocked ? 'cursor-not-allowed opacity-90' : 'hover:-translate-y-2'}`}>
      
      {/* Thumbnail */}
      <div className="relative h-[220px] w-full overflow-hidden bg-muted">
        <Image src={game.image} alt={game.title} fill className={`object-cover transition-transform duration-700 ${!isLocked ? 'group-hover:scale-110' : 'grayscale'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
          {game.tag && !isLocked && (
            <span className="bg-yellow-400 text-yellow-950 text-[10px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-wider">
              {game.tag}
            </span>
          )}
          {isLocked && (
            <span className="bg-black/70 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm flex items-center gap-1 border border-white/10">
              <Lock size={10} /> LVL {game.minLevel} REQUIRED
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 bg-white relative">
        <div className="flex justify-between items-start mb-2">
          <h4 className={`text-lg font-black tracking-tight line-clamp-1 ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}>{game.title}</h4>
        </div>
        
        <p className="text-xs font-medium text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{game.desc}</p>
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-center justify-between text-[10px] font-bold">
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-md ${game.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : game.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                {game.difficulty}
              </span>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">
                +{game.xp} XP
              </span>
            </div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Download size={10} /> {game.players}
            </span>
          </div>
          
          {!isLocked && (
            <div className="w-full bg-muted group-hover:bg-primary text-foreground group-hover:text-primary-foreground py-2.5 rounded-xl text-sm font-bold text-center transition-colors flex items-center justify-center gap-2">
              <Play size={14} className="fill-current" /> PLAY
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
