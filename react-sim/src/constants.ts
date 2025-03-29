export const SUN_RADIUS = 15;
export const EARTH_ORBIT_RADIUS = 150;
export const EARTH_DAY_SPEED = 0.005; // Radians per frame (adjust based on useFrame delta)
export const EARTH_YEAR_SPEED = 0.001; // Radians per frame

export const MOON_RADIUS = 1;
export const MOON_ORBIT_RADIUS = 10;
export const MOON_ORBIT_SPEED = 0.01; // Radians per frame

export const earthRadius = 100; // three-globe default
export const AIRPLANE_INITIAL_LAT = 48.85; // Paris
export const AIRPLANE_INITIAL_LON = 2.35; // Paris
export const AIRPLANE_INITIAL_ALTITUDE = 3; // km
export const AIRPLANE_SIZE = 1;
export const AIRPLANE_MIN_SPEED = 5;
export const AIRPLANE_MAX_SPEED = 50;
export const AIRPLANE_INITIAL_SPEED = 15;
export const AIRPLANE_ACCELERATION = 15; // Per second
export const AIRPLANE_TURN_SPEED = 1.0; // Radians per second
export const INDICATOR_SIZE = 5;

// Key mapping
export const KeyMap = {
  forward: "ArrowUp",
  backward: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
  increaseSpeed: "w",
  decreaseSpeed: "s",
  toggleCamera: "c",
  toggleOrbit: "p",
} as const; // Use 'as const' for stricter typing
