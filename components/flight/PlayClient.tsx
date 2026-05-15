"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type {
  Aircraft,
  Airport,
  FlightControlInput,
  FlightRuntimeState,
  FlightScore,
  Mission,
  QualitySetting,
  ViewMode
} from "@/types/flight";
import { aircraft as aircraftList, getAircraftById } from "@/data/aircraft";
import { getAirportById } from "@/data/airports";
import { getMissionById } from "@/data/missions";
import { useFlightState } from "@/hooks/useFlightState";
import { useKeyboardFlightControls } from "@/hooks/useKeyboardFlightControls";
import { scoreFlight } from "@/lib/flightScoring";
import {
  getPlayerName,
  getQualitySetting,
  getSelectedAircraftId,
  getSelectedAirportId,
  getSelectedMissionId,
  saveFlightRecord,
  setQualitySetting,
  setSelectedMissionId
} from "@/lib/flightStorage";
import { FlightHUD } from "@/components/flight/FlightHUD";
import { FlightResultModal } from "@/components/flight/FlightResultModal";
import { FlightScene } from "@/components/flight/FlightScene";
import { DesktopFlightControls } from "@/components/flight/DesktopFlightControls";
import { MobileFlightControls } from "@/components/flight/MobileFlightControls";
import { PauseMenu } from "@/components/flight/PauseMenu";
import { PreflightTutorialModal } from "@/components/flight/PreflightTutorialModal";

const viewModes: ViewMode[] = ["thirdPerson", "cockpit", "nose", "free"];

const defaultControls: FlightControlInput = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttleDelta: 0,
  throttleOverride: 0,
  useThrottleOverride: false,
  brake: false
};

declare global {
  interface Window {
    __felixThreeWarnFilter?: boolean;
  }
}

if (typeof window !== "undefined" && !window.__felixThreeWarnFilter) {
  const originalWarn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    const message = String(args[0] ?? "");
    if (
      message.includes("THREE.Clock") ||
      message.includes("THREE.WebGLShadowMap") ||
      message.includes("Multiple instances of Three.js")
    ) {
      return;
    }
    originalWarn(...args);
  };
  window.__felixThreeWarnFilter = true;
}

function cloneState(state: FlightRuntimeState): FlightRuntimeState {
  return {
    ...state,
    position: { ...state.position },
    velocity: { ...state.velocity }
  };
}

function createRecordId(): string {
  return `flight-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

export function PlayClient() {
  const searchParams = useSearchParams();
  const queryMission = searchParams.get("mission") ?? "";

  const [aircraft, setAircraft] = useState<Aircraft>(aircraftList[0]);
  const [airport, setAirport] = useState<Airport>(getAirportById("felix-international"));
  const [mission, setMission] = useState<Mission>(getMissionById("takeoff-training"));
  const [quality, setQuality] = useState<QualitySetting>("auto");
  const [viewMode, setViewMode] = useState<ViewMode>("thirdPerson");
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<FlightScore | false>(false);
  const [ready, setReady] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const controlsRef = useRef<FlightControlInput>({ ...defaultControls });
  const finishLockRef = useRef(false);
  const { stateRef, metricsRef, resetFlightState } = useFlightState(aircraft, airport, mission);
  const [displayState, setDisplayState] = useState<FlightRuntimeState>(() => cloneState(stateRef.current));

  const controlsEnabled =
    ready && !showTutorial && !paused && result === false && !displayState.crashed && !displayState.missionCompleted;
  const active = ready && !showTutorial && !paused && result === false;

  useEffect(() => {
    const missionId = queryMission.length > 0 ? queryMission : getSelectedMissionId();
    const selectedMission = getMissionById(missionId);
    const storedAircraft = getAircraftById(getSelectedAircraftId());
    const allowedAircraft = selectedMission.aircraftAllowed.includes(storedAircraft.id)
      ? storedAircraft
      : getAircraftById(selectedMission.aircraftAllowed[0] ?? aircraftList[0].id);
    const selectedAirport = getAirportById(getSelectedAirportId() || selectedMission.airportId);

    setMission(selectedMission);
    setSelectedMissionId(selectedMission.id);
    setAircraft(allowedAircraft);
    setAirport(selectedAirport);
    setQuality(getQualitySetting());
    setReady(true);
  }, [queryMission]);

  useEffect(() => {
    resetFlightState();
    controlsRef.current = { ...defaultControls };
    setPaused(false);
    setResult(false);
    setShowTutorial(true);
    finishLockRef.current = false;
    setDisplayState(cloneState(stateRef.current));
  }, [resetFlightState, stateRef]);

  const cycleFlaps = useCallback(() => {
    if (!controlsEnabled) {
      return;
    }
    stateRef.current.flaps = (stateRef.current.flaps + 1) % 4;
  }, [controlsEnabled, stateRef]);

  const toggleGear = useCallback(() => {
    if (!controlsEnabled) {
      return;
    }
    stateRef.current.gearDown = !stateRef.current.gearDown;
  }, [controlsEnabled, stateRef]);

  const cycleView = useCallback(() => {
    setViewMode((current) => {
      const index = viewModes.indexOf(current);
      return viewModes[(index + 1) % viewModes.length] ?? "thirdPerson";
    });
  }, []);

  const togglePause = useCallback(() => {
    if (result !== false) {
      return;
    }
    setPaused((value) => !value);
  }, [result]);

  useKeyboardFlightControls(controlsRef, {
    enabled: controlsEnabled,
    onFlaps: cycleFlaps,
    onGear: toggleGear,
    onView: cycleView,
    onPause: togglePause
  });

  const finishFlight = useCallback(
    (manual = false) => {
      if (result !== false) {
        return;
      }
      if (finishLockRef.current) {
        return;
      }
      finishLockRef.current = true;

      if (manual && mission.type === "free-flight") {
        metricsRef.current.missionCompleted = true;
        stateRef.current.missionCompleted = true;
      }

      metricsRef.current.elapsedTime = Math.max(metricsRef.current.elapsedTime, stateRef.current.flightTime);
      metricsRef.current.crashed = metricsRef.current.crashed || stateRef.current.crashed;
      metricsRef.current.missionCompleted = metricsRef.current.missionCompleted || stateRef.current.missionCompleted;

      const score = scoreFlight(mission, stateRef.current, metricsRef.current);
      saveFlightRecord({
        id: createRecordId(),
        playerName: getPlayerName(),
        missionId: mission.id,
        missionName: mission.name,
        aircraftId: aircraft.id,
        aircraftName: aircraft.name,
        airportId: airport.id,
        airportName: airport.name,
        score: score.totalScore,
        rating: score.rating,
        flightTime: score.flightTime,
        landingQuality: stateRef.current.landingQuality,
        crashed: score.crashed,
        createdAt: new Date().toISOString()
      });
      setDisplayState(cloneState(stateRef.current));
      setResult(score);
      setPaused(false);
      controlsRef.current = { ...defaultControls };
    },
    [aircraft, airport, metricsRef, mission, result, stateRef]
  );

  const restartFlight = useCallback(() => {
    resetFlightState();
    controlsRef.current = { ...defaultControls };
    setDisplayState(cloneState(stateRef.current));
    setResult(false);
    finishLockRef.current = false;
    setShowTutorial(true);
    setPaused(false);
  }, [resetFlightState, stateRef]);

  const handleQuality = useCallback((value: QualitySetting) => {
    setQuality(value);
    setQualitySetting(value);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const snapshot = cloneState(stateRef.current);
      setDisplayState(snapshot);
      if (result === false && (snapshot.crashed || snapshot.missionCompleted)) {
        finishFlight(false);
      }
    }, 120);

    return () => window.clearInterval(interval);
  }, [finishFlight, result, stateRef]);

  const sceneKey = useMemo(() => `${aircraft.id}-${airport.id}-${mission.id}`, [aircraft.id, airport.id, mission.id]);

  return (
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-[#07111F]">
      {ready ? (
        <FlightScene
          key={sceneKey}
          aircraft={aircraft}
          airport={airport}
          mission={mission}
          quality={quality}
          viewMode={viewMode}
          active={active}
          stateRef={stateRef}
          metricsRef={metricsRef}
          controlsRef={controlsRef}
        />
      ) : (
        <div className="grid h-full place-items-center text-slate-300">Loading simulator...</div>
      )}

      <FlightHUD
        state={displayState}
        aircraft={aircraft}
        airport={airport}
        mission={mission}
        viewMode={viewMode}
        onPause={togglePause}
        onEndFlight={() => finishFlight(true)}
      />

      <MobileFlightControls
        controlsRef={controlsRef}
        state={displayState}
        onFlaps={cycleFlaps}
        onGear={toggleGear}
        onView={cycleView}
        onPause={togglePause}
      />

      <DesktopFlightControls
        controlsRef={controlsRef}
        state={displayState}
        disabled={!controlsEnabled}
        onFlaps={cycleFlaps}
        onGear={toggleGear}
        onView={cycleView}
      />

      <PauseMenu
        open={paused}
        quality={quality}
        onResume={() => setPaused(false)}
        onRestart={restartFlight}
        onQuality={handleQuality}
      />

      {ready && showTutorial && result === false ? (
        <PreflightTutorialModal aircraft={aircraft} mission={mission} onStart={() => setShowTutorial(false)} />
      ) : null}

      {result !== false ? (
        <FlightResultModal score={result} aircraft={aircraft} airport={airport} mission={mission} onRestart={restartFlight} />
      ) : null}
    </main>
  );
}
