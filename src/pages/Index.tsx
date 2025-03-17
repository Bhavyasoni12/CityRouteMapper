
import React, { useState } from "react";
import CityGraph from "@/components/CityGraph";
import ControlPanel from "@/components/ControlPanel";
import PathResults from "@/components/PathResults";
import indiaGraph from "@/data/indiaGraph";
import { motion } from "framer-motion";
import { MapIcon } from "lucide-react";

const Index = () => {
  const [sourceCity, setSourceCity] = useState<string | null>(null);
  const [destinationCity, setDestinationCity] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [pathDistance, setPathDistance] = useState<number>(0);

  const handleSourceChange = (cityId: string) => {
    setSourceCity(cityId);
    resetResults();
  };

  const handleDestinationChange = (cityId: string) => {
    setDestinationCity(cityId);
    resetResults();
  };

  const findShortestPath = () => {
    if (sourceCity && destinationCity) {
      setIsRunning(true);
      setIsComplete(false);
      setCurrentPath([]);
      setPathDistance(0);
    }
  };

  const handleAlgorithmComplete = (path: string[], distance: number) => {
    setIsRunning(false);
    setIsComplete(true);
    setCurrentPath(path);
    setPathDistance(distance);
  };

  const resetResults = () => {
    setIsRunning(false);
    setIsComplete(false);
    setCurrentPath([]);
    setPathDistance(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/30">
      <header className="px-6 py-5 border-b backdrop-blur-sm bg-white/50">
        <motion.div 
          className="container mx-auto flex items-center gap-2"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Indian Cities Pathfinder
          </h1>
          <div className="text-sm py-0.5 px-2 ml-2 bg-primary/10 rounded-full text-primary font-medium">
            Dijkstra's Algorithm
          </div>
        </motion.div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          <div className="lg:col-span-2">
            <div className="bg-white/30 backdrop-blur-sm p-6 rounded-xl border border-border shadow-sm h-full">
              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="text-lg font-medium mb-4"
              >
                City Network Visualization
              </motion.h2>
              <div className="h-[700px]">
                <CityGraph
                  cities={indiaGraph.cities}
                  routes={indiaGraph.routes}
                  sourceCity={sourceCity}
                  destinationCity={destinationCity}
                  isRunning={isRunning}
                  onComplete={handleAlgorithmComplete}
                  onReset={resetResults}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ControlPanel
              cities={indiaGraph.cities}
              sourceCity={sourceCity}
              destinationCity={destinationCity}
              onSourceChange={handleSourceChange}
              onDestinationChange={handleDestinationChange}
              onFind={findShortestPath}
              isRunning={isRunning}
              isComplete={isComplete}
            />

            {isComplete && (
              <PathResults
                path={currentPath}
                distance={pathDistance}
                cities={indiaGraph.cities}
                onReset={resetResults}
              />
            )}
          </div>
        </div>
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-muted-foreground bg-white/30 backdrop-blur-sm">
        <div className="container mx-auto">
          <p>Indian Cities Pathfinder • Dijkstra's Algorithm Visualization</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
