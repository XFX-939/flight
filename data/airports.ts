import type { Airport } from "@/types/flight";

export const airports: Airport[] = [
  {
    id: "felix-international",
    name: "Felix International",
    location: "Felix Bay",
    difficulty: "简单",
    runwayLength: 3600,
    runwayHeading: 0,
    elevation: 42,
    windDirection: 40,
    windSpeed: 6,
    visibility: 10,
    description: "大型国际机场，跑道长、灯光完整，适合所有飞机和首次训练。",
    cityProfile: {
      cityName: "Felix Bay",
      downtownName: "Felix Downtown",
      center: { x: 740, z: 4300 },
      density: "medium",
      water: "bay",
      landmarkColor: "#38bdf8"
    }
  },
  {
    id: "bay-city",
    name: "Bay City Airport",
    location: "Bay City Coast",
    difficulty: "中等",
    runwayLength: 2400,
    runwayHeading: 20,
    elevation: 18,
    windDirection: 290,
    windSpeed: 14,
    visibility: 8,
    description: "海湾城市机场，侧风略明显，适合中小型飞机和进近练习。",
    cityProfile: {
      cityName: "Bay City",
      downtownName: "Harbor Core",
      center: { x: -900, z: 4400 },
      density: "medium",
      water: "coast",
      landmarkColor: "#22d3ee"
    }
  },
  {
    id: "mountain-valley",
    name: "Mountain Valley Airfield",
    location: "North Ridge Valley",
    difficulty: "困难",
    runwayLength: 1450,
    runwayHeading: 340,
    elevation: 1240,
    windDirection: 310,
    windSpeed: 18,
    visibility: 6,
    description: "山谷机场，跑道较短，周边地形复杂，需要稳定进近和精确速度管理。",
    cityProfile: {
      cityName: "Mountain Valley",
      downtownName: "Valley Town",
      center: { x: -620, z: 3200 },
      density: "low",
      water: "river",
      landmarkColor: "#f59e0b"
    }
  },
  {
    id: "shanghai-pudong",
    name: "Shanghai Pudong City Map",
    location: "Shanghai, China",
    difficulty: "中等",
    runwayLength: 3800,
    runwayHeading: 0,
    elevation: 13,
    windDirection: 80,
    windSpeed: 10,
    visibility: 9,
    description: "以上海浦东进近氛围为灵感的城市地图，起飞后可飞向江湾与高密度市中心天际线。",
    cityProfile: {
      cityName: "Shanghai",
      downtownName: "Lujiazui Skyline",
      center: { x: 1120, z: 6200 },
      density: "high",
      water: "river",
      landmarkColor: "#22d3ee"
    }
  },
  {
    id: "new-york-jfk",
    name: "New York JFK City Map",
    location: "New York, USA",
    difficulty: "中等",
    runwayLength: 3600,
    runwayHeading: 0,
    elevation: 13,
    windDirection: 230,
    windSpeed: 12,
    visibility: 8,
    description: "以纽约海湾机场和曼哈顿天际线为灵感，起飞后沿海岸线飞向密集市中心。",
    cityProfile: {
      cityName: "New York",
      downtownName: "Manhattan Core",
      center: { x: -1240, z: 6500 },
      density: "high",
      water: "bay",
      landmarkColor: "#38bdf8"
    }
  },
  {
    id: "tokyo-haneda",
    name: "Tokyo Haneda City Map",
    location: "Tokyo, Japan",
    difficulty: "中等",
    runwayLength: 3000,
    runwayHeading: 0,
    elevation: 21,
    windDirection: 160,
    windSpeed: 9,
    visibility: 9,
    description: "以东京湾羽田方向为灵感的城市地图，包含湾岸、城市建筑群和高塔地标。",
    cityProfile: {
      cityName: "Tokyo",
      downtownName: "Tokyo Bay Core",
      center: { x: 940, z: 5700 },
      density: "high",
      water: "coast",
      landmarkColor: "#67e8f9"
    }
  }
];

export const defaultAirport = airports[0];

export function getAirportById(id: string): Airport {
  return airports.find((item) => item.id === id) ?? defaultAirport;
}
