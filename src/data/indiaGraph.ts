
import { Graph } from "../utils/dijkstra";

const indiaGraph: Graph = {
  cities: [
    {
      id: "delhi",
      name: "Delhi",
      position: { x: 150, y: 100 }
    },
    {
      id: "mumbai",
      name: "Mumbai",
      position: { x: 120, y: 400 }
    },
    {
      id: "kolkata",
      name: "Kolkata",
      position: { x: 400, y: 250 }
    },
    {
      id: "chennai",
      name: "Chennai",
      position: { x: 300, y: 600 }
    },
    {
      id: "bengaluru",
      name: "Bengaluru",
      position: { x: 200, y: 550 }
    },
    {
      id: "hyderabad",
      name: "Hyderabad",
      position: { x: 200, y: 450 }
    },
    {
      id: "jaipur",
      name: "Jaipur",
      position: { x: 80, y: 200 }
    },
    {
      id: "pune",
      name: "Pune",
      position: { x: 180, y: 450 }
    }
  ],
  routes: [
    { source: "delhi", target: "jaipur", distance: 250 },
    { source: "delhi", target: "mumbai", distance: 600 },
    { source: "delhi", target: "kolkata", distance: 800 },
    { source: "jaipur", target: "mumbai", distance: 600 },
    { source: "mumbai", target: "pune", distance: 200 },
    { source: "mumbai", target: "hyderabad", distance: 600 },
    { source: "kolkata", target: "chennai", distance: 500 },
    { source: "hyderabad", target: "chennai", distance: 350 },
    { source: "hyderabad", target: "bengaluru", distance: 300 },
    { source: "bengaluru", target: "chennai", distance: 350 },
    { source: "hyderabad", target: "jaipur", distance: 110 }
  ]
};

export default indiaGraph;
