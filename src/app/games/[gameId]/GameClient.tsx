"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import React from "react";

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center w-full h-[600px] text-green-500">
    <Loader2 className="w-12 h-12 animate-spin mb-4" />
    <p className="font-bold animate-pulse">Loading Game Engine...</p>
  </div>
);

const EcoRunnerEngine = dynamic(() => import("@/components/games/EcoRunnerEngine"), { ssr: false, loading: LoadingFallback });
const TrashSortingEngine = dynamic(() => import("@/components/games/TrashSortingEngine"), { ssr: false, loading: LoadingFallback });
const OceanCleanupEngine = dynamic(() => import("@/components/games/OceanCleanupEngine"), { ssr: false, loading: LoadingFallback });
const TreePlantingEngine = dynamic(() => import("@/components/games/TreePlantingEngine"), { ssr: false, loading: LoadingFallback });
const PlasticCollectorEngine = dynamic(() => import("@/components/games/PlasticCollectorEngine"), { ssr: false, loading: LoadingFallback });
const SolarCityBuilderEngine = dynamic(() => import("@/components/games/SolarCityBuilderEngine"), { ssr: false, loading: LoadingFallback });
const RecyclingFactoryEngine = dynamic(() => import("@/components/games/RecyclingFactoryEngine"), { ssr: false, loading: LoadingFallback });
const CarbonDefenderEngine = dynamic(() => import("@/components/games/CarbonDefenderEngine"), { ssr: false, loading: LoadingFallback });
const WaterSaverEngine = dynamic(() => import("@/components/games/WaterSaverEngine"), { ssr: false, loading: LoadingFallback });
const EcoQuizBattleEngine = dynamic(() => import("@/components/games/EcoQuizBattleEngine"), { ssr: false, loading: LoadingFallback });

export default function GameClient({ gameId }: { gameId: string }) {
  return (
    <>
      {gameId === "eco-runner" && <EcoRunnerEngine />}
      {gameId === "trash-sorting" && <TrashSortingEngine />}
      {gameId === "ocean-cleanup" && <OceanCleanupEngine />}
      {gameId === "tree-planting" && <TreePlantingEngine />}
      {gameId === "plastic-collector" && <PlasticCollectorEngine />}
      {gameId === "solar-city" && <SolarCityBuilderEngine />}
      {gameId === "recycling-factory" && <RecyclingFactoryEngine />}
      {gameId === "carbon-defender" && <CarbonDefenderEngine />}
      {gameId === "water-saver" && <WaterSaverEngine />}
      {gameId === "eco-quiz-battle" && <EcoQuizBattleEngine />}
      {!["eco-runner", "trash-sorting", "ocean-cleanup", "tree-planting", "plastic-collector", "solar-city", "recycling-factory", "carbon-defender", "water-saver", "eco-quiz-battle"].includes(gameId) && (
        <div className="text-center w-full mt-20">
          <h2 className="text-2xl font-bold text-gray-800">Game not found</h2>
          <a href="/games" className="text-green-500 hover:underline">Return to Games</a>
        </div>
      )}
    </>
  );
}
