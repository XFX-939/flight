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
    description: "大型国际机场，跑道长、灯光完整，适合所有飞机和首次训练。"
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
    description: "海湾城市机场，侧风略明显，适合中小型飞机和进近练习。"
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
    description: "山谷机场，跑道较短，周边地形复杂，需要稳定进近和精确速度管理。"
  }
];

export const defaultAirport = airports[0];

export function getAirportById(id: string): Airport {
  return airports.find((item) => item.id === id) ?? defaultAirport;
}
