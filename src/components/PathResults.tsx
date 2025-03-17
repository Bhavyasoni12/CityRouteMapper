
import React from "react";
import { City, formatDistance, Route } from "../utils/dijkstra";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ArrowRight } from "lucide-react";

interface PathResultsProps {
  path: string[];
  distance: number;
  cities: City[];
  onReset: () => void;
  routes?: Route[];
}

const PathResults: React.FC<PathResultsProps> = ({ 
  path, 
  distance, 
  cities, 
  onReset,
  routes = []
}) => {
  const cityNames = path.map(cityId => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : cityId;
  });
  
  const hasPath = path.length > 0 && distance !== Infinity;

  // Get the distance between consecutive cities in the path
  const getSegmentDistance = (source: string, target: string) => {
    const route = routes.find(r => 
      (r.source === source && r.target === target) || 
      (r.source === target && r.target === source)
    );
    return route ? route.distance : null;
  };
  
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="p-6 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {hasPath ? "Shortest Path Found" : "No Path Available"}
        </h3>
        <Button variant="outline" onClick={onReset} size="sm">
          Reset
        </Button>
      </div>
      
      {hasPath ? (
        <>
          <div className="flex items-center gap-2 mb-5 p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center p-2 bg-primary/20 rounded-md">
              <Navigation className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm font-bold">
              Total Distance: <span className="text-primary">{formatDistance(distance)}</span>
            </div>
          </div>
          
          <div className="space-y-1 mt-4">
            {cityNames.map((cityName, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center">
                  <div className="flex flex-col items-center mr-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 
                        ? "bg-green-100 text-green-700 border-2 border-green-500" 
                        : index === cityNames.length - 1 
                          ? "bg-primary/20 text-primary border-2 border-primary" 
                          : "bg-secondary text-foreground/70 border border-border"
                    }`}>
                      {index === 0 ? (
                        <MapPin className="h-4 w-4" />
                      ) : index === cityNames.length - 1 ? (
                        <MapPin className="h-4 w-4" />
                      ) : (
                        index
                      )}
                    </div>
                    {index < cityNames.length - 1 && (
                      <div className="w-px h-8 bg-border"></div>
                    )}
                  </div>
                  <div className="flex-1 p-2 text-sm font-semibold">
                    {cityName}
                  </div>
                </div>
                
                {index < cityNames.length - 1 && path[index] && path[index + 1] && (
                  <div className="flex items-center pl-10 pb-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground mr-1" />
                    <span className="text-xs text-muted-foreground">
                      {getSegmentDistance(path[index], path[index + 1])} km
                    </span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center p-4 text-muted-foreground">
          No valid path found between the selected cities.
        </div>
      )}
    </motion.div>
  );
};

export default PathResults;
