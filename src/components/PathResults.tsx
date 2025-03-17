
import React from "react";
import { City, formatDistance } from "../utils/dijkstra";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ArrowRight } from "lucide-react";

interface PathResultsProps {
  path: string[];
  distance: number;
  cities: City[];
  onReset: () => void;
}

const PathResults: React.FC<PathResultsProps> = ({ 
  path, 
  distance, 
  cities, 
  onReset 
}) => {
  const cityNames = path.map(cityId => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : cityId;
  });
  
  const hasPath = path.length > 0 && distance !== Infinity;
  
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
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center p-2 bg-secondary rounded-md">
              <Navigation className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-sm font-medium">
              Total Distance: <span className="text-primary">{formatDistance(distance)}</span>
            </div>
          </div>
          
          <div className="space-y-2 mt-4">
            {cityNames.map((cityName, index) => (
              <div key={index} className="flex items-center">
                <div className="flex flex-col items-center mr-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    index === 0 
                      ? "bg-green-100 text-green-700 border border-green-300" 
                      : index === cityNames.length - 1 
                        ? "bg-primary/20 text-primary border border-primary/30" 
                        : "bg-secondary text-foreground/70 border border-border"
                  }`}>
                    {index === 0 ? (
                      <MapPin className="h-3 w-3" />
                    ) : index === cityNames.length - 1 ? (
                      <MapPin className="h-3 w-3" />
                    ) : (
                      index
                    )}
                  </div>
                  {index < cityNames.length - 1 && (
                    <div className="w-px h-4 bg-border"></div>
                  )}
                </div>
                <div className="flex-1 p-2 text-sm">
                  {cityName}
                </div>
              </div>
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
