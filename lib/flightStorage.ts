"use client";

import { defaultAircraft } from "@/data/aircraft";
import { defaultAirport } from "@/data/airports";
import { defaultMission } from "@/data/missions";
import type { FlightRecord, QualitySetting } from "@/types/flight";

const RECORDS_KEY = "felix-flight-records";
const AIRCRAFT_KEY = "felix-selected-aircraft";
const AIRPORT_KEY = "felix-selected-airport";
const MISSION_KEY = "felix-selected-mission";
const QUALITY_KEY = "felix-quality-setting";
const PLAYER_KEY = "felix-player-name";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseRecords(raw: string): FlightRecord[] {
  try {
    const parsed = JSON.parse(raw) as FlightRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getFlightRecords(): FlightRecord[] {
  if (!canUseStorage()) {
    return [];
  }
  const raw = window.localStorage.getItem(RECORDS_KEY) ?? "[]";
  return parseRecords(raw)
    .filter((record) => Number.isFinite(record.score))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function saveFlightRecord(record: FlightRecord): void {
  if (!canUseStorage()) {
    return;
  }
  const records = getFlightRecords();
  const nextRecords = [record, ...records].slice(0, 80);
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
}

export function clearFlightRecords(): void {
  if (canUseStorage()) {
    window.localStorage.setItem(RECORDS_KEY, "[]");
  }
}

export function getLeaderboardRecords(missionId = "all", aircraftId = "all"): FlightRecord[] {
  return getFlightRecords()
    .filter((record) => missionId === "all" || record.missionId === missionId)
    .filter((record) => aircraftId === "all" || record.aircraftId === aircraftId)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

export function getSelectedAircraftId(): string {
  if (!canUseStorage()) {
    return defaultAircraft.id;
  }
  return window.localStorage.getItem(AIRCRAFT_KEY) ?? defaultAircraft.id;
}

export function setSelectedAircraftId(id: string): void {
  if (canUseStorage()) {
    window.localStorage.setItem(AIRCRAFT_KEY, id);
  }
}

export function getSelectedAirportId(): string {
  if (!canUseStorage()) {
    return defaultAirport.id;
  }
  return window.localStorage.getItem(AIRPORT_KEY) ?? defaultAirport.id;
}

export function setSelectedAirportId(id: string): void {
  if (canUseStorage()) {
    window.localStorage.setItem(AIRPORT_KEY, id);
  }
}

export function getSelectedMissionId(): string {
  if (!canUseStorage()) {
    return defaultMission.id;
  }
  return window.localStorage.getItem(MISSION_KEY) ?? defaultMission.id;
}

export function setSelectedMissionId(id: string): void {
  if (canUseStorage()) {
    window.localStorage.setItem(MISSION_KEY, id);
  }
}

export function getQualitySetting(): QualitySetting {
  if (!canUseStorage()) {
    return "auto";
  }
  const value = window.localStorage.getItem(QUALITY_KEY) ?? "auto";
  return value === "high" || value === "medium" || value === "low" || value === "auto" ? value : "auto";
}

export function setQualitySetting(value: QualitySetting): void {
  if (canUseStorage()) {
    window.localStorage.setItem(QUALITY_KEY, value);
  }
}

export function getPlayerName(): string {
  if (!canUseStorage()) {
    return "Felix Pilot";
  }
  const value = window.localStorage.getItem(PLAYER_KEY) ?? "Felix Pilot";
  return value.trim().length > 0 ? value : "Felix Pilot";
}

export function setPlayerName(value: string): void {
  if (canUseStorage()) {
    window.localStorage.setItem(PLAYER_KEY, value.trim().length > 0 ? value.trim() : "Felix Pilot");
  }
}
