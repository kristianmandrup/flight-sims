import * as THREE from "three";

export interface FlightData {
  lat: number;
  lon: number;
  altitude: number;
  heading: number;
  speed: number;
}

export interface KeyControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  increaseSpeed: boolean;
  decreaseSpeed: boolean;
  toggleCamera: boolean; // Track press, not hold
  toggleOrbit: boolean; // Track press, not hold
}

export interface FlightState extends FlightData {
  isCockpitView: boolean;
  isOrbitPaused: boolean;
  targetSpeed: number;
  airplaneRef: React.RefObject<THREE.Mesh | THREE.Group>; // Ref to the airplane mesh/group
}

// Extend context value if needed
export interface FlightContextValue extends FlightState {
  setFlightData: React.Dispatch<React.SetStateAction<FlightData>>;
  setIsCockpitView: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOrbitPaused: React.Dispatch<React.SetStateAction<boolean>>;
  setTargetSpeed: React.Dispatch<React.SetStateAction<number>>;
}
