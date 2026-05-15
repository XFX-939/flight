export type Difficulty = "简单" | "中等" | "较难" | "困难";

export type MissionType =
  | "takeoff-training"
  | "landing-training"
  | "free-flight"
  | "route-challenge";

export type ViewMode = "thirdPerson" | "cockpit" | "nose" | "free";

export type QualitySetting = "auto" | "high" | "medium" | "low";

export type FlightRating = "S" | "A" | "B" | "C" | "D" | "F";

export type LandingQuality =
  | "未着陆"
  | "轻柔着陆"
  | "正常着陆"
  | "硬着陆"
  | "坠毁";

export type Vector3State = {
  x: number;
  y: number;
  z: number;
};

export type AirportCityProfile = {
  cityName: string;
  downtownName: string;
  center: {
    x: number;
    z: number;
  };
  density: "low" | "medium" | "high";
  water: "bay" | "coast" | "river" | "none";
  landmarkColor: string;
};

export type Aircraft = {
  id: string;
  name: string;
  type: string;
  difficulty: Difficulty;
  description: string;
  maxSpeed: number;
  takeoffSpeed: number;
  stallSpeed: number;
  climbRate: number;
  stability: string;
  handling: string;
  throttleResponse: number;
  flapEffectiveness: number;
  brakePower: number;
  color: string;
  accentColor: string;
  suitableMissions: MissionType[];
};

export type Airport = {
  id: string;
  name: string;
  location: string;
  difficulty: Difficulty;
  runwayLength: number;
  runwayHeading: number;
  elevation: number;
  windDirection: number;
  windSpeed: number;
  visibility: number;
  description: string;
  cityProfile?: AirportCityProfile;
};

export type ScoringWeights = {
  takeoffDistance: number;
  climbSmoothness: number;
  headingHold: number;
  climbRate: number;
  stallAvoidance: number;
  touchdownVerticalSpeed: number;
  touchdownZone: number;
  centerline: number;
  approachSpeed: number;
  rollout: number;
  flightTime: number;
  maxAltitude: number;
  smoothness: number;
};

export type Mission = {
  id: string;
  name: string;
  type: MissionType;
  description: string;
  aircraftAllowed: string[];
  airportId: string;
  targetAltitude: number;
  targetHeading: number;
  targetSpeed: number;
  scoringWeights: ScoringWeights;
};

export type FlightControlInput = {
  pitch: number;
  roll: number;
  yaw: number;
  throttleDelta: number;
  throttleOverride: number;
  useThrottleOverride: boolean;
  brake: boolean;
};

export type FlightRuntimeState = {
  position: Vector3State;
  velocity: Vector3State;
  pitch: number;
  roll: number;
  yaw: number;
  heading: number;
  throttle: number;
  airspeed: number;
  altitude: number;
  verticalSpeed: number;
  flaps: number;
  gearDown: boolean;
  brake: boolean;
  onGround: boolean;
  stalled: boolean;
  crashed: boolean;
  landingQuality: LandingQuality;
  runwayOffset: number;
  runwayDistance: number;
  distanceToTarget: number;
  missionCompleted: boolean;
  missionStatus: string;
  warning: string;
  flightTime: number;
};

export type FlightMetrics = {
  startedAt: number;
  elapsedTime: number;
  maxAltitude: number;
  maxSpeed: number;
  averageSpeed: number;
  speedSamples: number;
  speedTotal: number;
  stallWarnings: number;
  lastStalled: boolean;
  hardLanding: boolean;
  crashed: boolean;
  missionCompleted: boolean;
  landingVerticalSpeed: number;
  landingCenterlineOffset: number;
  touchdownDistance: number;
  touchdownRecorded: boolean;
  takeoffDistance: number;
  takeoffRecorded: boolean;
  runwayOverrun: boolean;
  crosswindWarnings: number;
  maxCrosswind: number;
  airportDifficulty: number;
  smoothnessPenalty: number;
  headingDeviationTotal: number;
  headingSamples: number;
};

export type FlightScore = {
  totalScore: number;
  rating: FlightRating;
  flightTime: number;
  maxAltitude: number;
  maxSpeed: number;
  averageSpeed: number;
  landingVerticalSpeed: number;
  landingCenterlineOffset: number;
  touchdownDistance: number;
  stallWarnings: number;
  crosswindWarnings: number;
  runwayOverrun: boolean;
  airportDifficulty: number;
  weatherPenalty: number;
  hardLanding: boolean;
  crashed: boolean;
  missionCompleted: boolean;
};

export type FlightRecord = {
  id: string;
  playerName: string;
  missionId: string;
  missionName: string;
  aircraftId: string;
  aircraftName: string;
  airportId: string;
  airportName: string;
  score: number;
  rating: FlightRating;
  flightTime: number;
  landingQuality: LandingQuality;
  crashed: boolean;
  createdAt: string;
};
