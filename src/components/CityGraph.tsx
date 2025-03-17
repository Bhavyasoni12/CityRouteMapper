
import React, { useState, useEffect, useRef } from "react";
import { City, Route, Step, dijkstra, formatDistance } from "../utils/dijkstra";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CityGraphProps {
  cities: City[];
  routes: Route[];
  sourceCity: string | null;
  destinationCity: string | null;
  isRunning: boolean;
  onComplete: (path: string[], distance: number) => void;
  onReset: () => void;
}

const CityGraph: React.FC<CityGraphProps> = ({
  cities,
  routes,
  sourceCity,
  destinationCity,
  isRunning,
  onComplete,
  onReset
}) => {
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<Step | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Clear animation state on reset
  useEffect(() => {
    if (!isRunning) {
      setVisitedNodes([]);
      setCurrentPath([]);
      setCurrentStep(null);
      setIsAnimating(false);
      
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isRunning]);

  // Run Dijkstra's algorithm when triggered
  useEffect(() => {
    if (isRunning && sourceCity && destinationCity) {
      setIsAnimating(true);
      
      // Reset state
      setVisitedNodes([]);
      setCurrentPath([]);
      setCurrentStep(null);
      
      // Create an array to store all steps
      const allSteps: Step[] = [];
      
      // Run the algorithm and collect all steps
      const result = dijkstra(
        { cities, routes },
        sourceCity,
        destinationCity,
        (step) => {
          allSteps.push(step);
        }
      );
      
      // Now animate through the steps with delays
      let stepIndex = 0;
      
      const animateNextStep = () => {
        if (stepIndex < allSteps.length) {
          const step = allSteps[stepIndex];
          setVisitedNodes(step.visitedNodes);
          setCurrentStep(step);
          
          // If we've reached the final step
          if (stepIndex === allSteps.length - 1) {
            setCurrentPath(result.path);
            onComplete(result.path, result.distance);
            setIsAnimating(false);
          } else {
            // Schedule the next step
            animationRef.current = setTimeout(animateNextStep, 800);
          }
          
          stepIndex++;
        }
      };
      
      // Start the animation
      animateNextStep();
    }
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning, sourceCity, destinationCity, cities, routes, onComplete]);

  // Helper function to determine if a route is in the current path
  const isRouteInPath = (source: string, target: string) => {
    if (currentPath.length < 2) return false;
    
    for (let i = 0; i < currentPath.length - 1; i++) {
      if (
        (currentPath[i] === source && currentPath[i + 1] === target) ||
        (currentPath[i] === target && currentPath[i + 1] === source)
      ) {
        return true;
      }
    }
    
    return false;
  };

  // Get positions for the SVG
  const minX = Math.min(...cities.map(city => city.position.x)) - 50;
  const minY = Math.min(...cities.map(city => city.position.y)) - 50;
  const maxX = Math.max(...cities.map(city => city.position.x)) + 100;
  const maxY = Math.max(...cities.map(city => city.position.y)) + 100;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative overflow-hidden flex-1 bg-secondary/20 rounded-lg backdrop-blur-sm shadow-inner">
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
          className="overflow-visible"
        >
          {/* Draw routes */}
          {routes.map((route) => {
            const sourceCity = cities.find(c => c.id === route.source);
            const targetCity = cities.find(c => c.id === route.target);
            
            if (!sourceCity || !targetCity) return null;
            
            const isActive = isRouteInPath(route.source, route.target);
            
            return (
              <g key={`${route.source}-${route.target}`}>
                <line
                  x1={sourceCity.position.x}
                  y1={sourceCity.position.y}
                  x2={targetCity.position.x}
                  y2={targetCity.position.y}
                  className={cn("edge", { "active": isActive })}
                  style={isActive ? { strokeDasharray: 1000, strokeDashoffset: 1000 } : {}}
                />
                
                {/* Distance label */}
                <text
                  x={(sourceCity.position.x + targetCity.position.x) / 2}
                  y={(sourceCity.position.y + targetCity.position.y) / 2 - 10}
                  className="edge-label"
                  textAnchor="middle"
                >
                  <tspan className="distance-label">{route.distance}</tspan> km
                </text>
              </g>
            );
          })}
          
          {/* Draw cities */}
          {cities.map((city) => {
            const isVisited = visitedNodes.includes(city.id);
            const isSource = city.id === sourceCity;
            const isDestination = city.id === destinationCity;
            const isPath = currentPath.includes(city.id);
            
            // Calculate distance if step information is available
            let distance = currentStep?.distances[city.id];
            
            return (
              <g key={city.id} transform={`translate(${city.position.x}, ${city.position.y})`}>
                <motion.g
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30, 
                    delay: 0.1 * cities.indexOf(city)
                  }}
                >
                  <foreignObject 
                    width="80" 
                    height="80" 
                    x="-40" 
                    y="-40"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className={cn("city-node", {
                      "source": isSource,
                      "destination": isDestination,
                      "visited": isVisited && !isPath && !isSource && !isDestination,
                      "path": isPath && !isSource && !isDestination
                    })}>
                      <span className="text-xl font-semibold">🏙️</span>
                      <span className="city-label">{city.name}</span>
                      
                      {/* Show the current distance estimate if visited */}
                      {isVisited && distance != null && distance !== Infinity && (
                        <span className="absolute top-16 left-1/2 -translate-x-1/2 text-xs font-medium py-1 px-2 bg-white/90 rounded shadow-sm border">
                          {formatDistance(distance)}
                        </span>
                      )}
                    </div>
                  </foreignObject>
                </motion.g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default CityGraph;
