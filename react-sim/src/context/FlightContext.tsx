import React, {
  createContext,
  useState,
  useRef,
  useContext,
  useMemo,
} from "react";
import * as THREE from "three";
import { FlightState, FlightData, FlightContextValue } from "../types";
import {
  AIRPLANE_INITIAL_LAT,
  AIRPLANE_INITIAL_LON,
  AIRPLANE_INITIAL_ALTITUDE,
  AIRPLANE_INITIAL_SPEED,
} from "../constants";

// Provide default values matching the interface structure
const defaultFlightData: FlightData = {
  lat: AIRPLANE_INITIAL_LAT,
  lon: AIRPLANE_INITIAL_LON,
  altitude: AIRPLANE_INITIAL_ALTITUDE,
  heading: 0,
  speed: AIRPLANE_INITIAL_SPEED,
};

const defaultContextValue: FlightContextValue = {
  ...defaultFlightData,
  isCockpitView: false,
  isOrbitPaused: false,
  targetSpeed: AIRPLANE_INITIAL_SPEED,
  airplaneRef: { current: null }, // Default ref value
  // Provide dummy setters
  setFlightData: () => {},
  setIsCockpitView: () => {},
  setIsOrbitPaused: () => {},
  setTargetSpeed: () => {},
};

const FlightContext = createContext<FlightContextValue>(defaultContextValue);

export const useFlightContext = () => useContext(FlightContext);

interface FlightProviderProps {
  children: React.ReactNode;
}

export const FlightProvider: React.FC<FlightProviderProps> = ({ children }) => {
  const [flightData, setFlightData] = useState<FlightData>(defaultFlightData);
  const [isCockpitView, setIsCockpitView] = useState<boolean>(false);
  const [isOrbitPaused, setIsOrbitPaused] = useState<boolean>(false);
  const [targetSpeed, setTargetSpeed] = useState<number>(
    AIRPLANE_INITIAL_SPEED
  );
  const airplaneRef = useRef<THREE.Mesh | THREE.Group>(null); // Ref for the airplane object

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...flightData,
      isCockpitView,
      isOrbitPaused,
      targetSpeed,
      airplaneRef, // Provide the ref
      setFlightData,
      setIsCockpitView,
      setIsOrbitPaused,
      setTargetSpeed,
    }),
    [flightData, isCockpitView, isOrbitPaused, targetSpeed, airplaneRef]
  );

  return (
    <FlightContext.Provider value={value}>{children}</FlightContext.Provider>
  );
};
