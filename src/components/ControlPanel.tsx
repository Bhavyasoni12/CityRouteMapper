
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { City } from "@/utils/dijkstra";
import { motion } from "framer-motion";
import { Map, Navigation, Play, Info } from "lucide-react";

interface ControlPanelProps {
  cities: City[];
  sourceCity: string | null;
  destinationCity: string | null;
  onSourceChange: (cityId: string) => void;
  onDestinationChange: (cityId: string) => void;
  onFind: () => void;
  isRunning: boolean;
  isComplete: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  cities,
  sourceCity,
  destinationCity,
  onSourceChange,
  onDestinationChange,
  onFind,
  isRunning,
  isComplete
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.1
      }}
      className="rounded-xl bg-white/80 backdrop-blur shadow-lg border border-border p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-primary/10 rounded-md">
          <Map className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-medium">Select Cities</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="source-city" className="block text-sm font-medium text-muted-foreground mb-1.5">
            Source City
          </label>
          <Select
            value={sourceCity || ""}
            onValueChange={onSourceChange}
            disabled={isRunning}
          >
            <SelectTrigger id="source-city" className="w-full">
              <SelectValue placeholder="Select source city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem 
                  key={city.id} 
                  value={city.id}
                  disabled={city.id === destinationCity}
                >
                  <div className="flex items-center gap-2">
                    <Navigation className="h-3.5 w-3.5 text-green-500" />
                    {city.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label htmlFor="destination-city" className="block text-sm font-medium text-muted-foreground mb-1.5">
            Destination City
          </label>
          <Select
            value={destinationCity || ""}
            onValueChange={onDestinationChange}
            disabled={isRunning}
          >
            <SelectTrigger id="destination-city" className="w-full">
              <SelectValue placeholder="Select destination city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem 
                  key={city.id} 
                  value={city.id}
                  disabled={city.id === sourceCity}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {city.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={onFind} 
            disabled={!sourceCity || !destinationCity || isRunning || isComplete}
            className="w-full"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding Path...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Find Shortest Path
              </>
            )}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 p-2 bg-secondary/50 rounded border border-border">
          <p className="flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Dijkstra's algorithm finds the shortest path between nodes in a graph. This visualization demonstrates how the algorithm explores the road network between Indian cities.
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlPanel;

// Define MapPin component
const MapPin: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
