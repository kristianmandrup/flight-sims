import React, { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useHelper } from "@react-three/drei";
import * as THREE from "three";
import { CelestialBody } from "./CelestialBody";
import { EarthGlobe } from "./EarthGlobe";
import { Airplane } from "./Airplane";
import { useFlightContext } from "../context/FlightContext";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import * as C from "../constants"; // Import constants with an alias

const SceneContent: React.FC = () => {
  const { isOrbitPaused, isCockpitView, airplaneRef, setIsOrbitPaused } =
    useFlightContext();
  const keyboardControls = useKeyboardControls(); // Get momentary toggle state here too

  const earthOrbitPivotRef = useRef<THREE.Group>(null!);
  const moonOrbitPivotRef = useRef<THREE.Group>(null!);
  const controlsRef = useRef<any>(null); // Ref for OrbitControls instance
  const { camera } = useThree(); // Get camera for adjusting OrbitControls

  // Handle Orbit Toggle
  useEffect(() => {
    if (keyboardControls.toggleOrbit) {
      setIsOrbitPaused((prev) => !prev);
    }
  }, [keyboardControls.toggleOrbit, setIsOrbitPaused]);

  useFrame((state, delta) => {
    // Orbit Earth around Sun
    if (!isOrbitPaused && earthOrbitPivotRef.current) {
      earthOrbitPivotRef.current.rotation.y += C.EARTH_YEAR_SPEED; // Use constant
    }
    // Orbit Moon around Earth
    if (moonOrbitPivotRef.current) {
      moonOrbitPivotRef.current.rotation.y += C.MOON_ORBIT_SPEED; // Use constant
    }

    // Update OrbitControls target when not in cockpit view
    if (!isCockpitView && controlsRef.current && airplaneRef.current) {
      const targetPosition = airplaneRef.current.getWorldPosition(
        new THREE.Vector3()
      );
      controlsRef.current.target.lerp(targetPosition, 0.1); // Smooth follow
      // IMPORTANT: Enable controls if they were disabled by cockpit view
      controlsRef.current.enabled = true;
      controlsRef.current.update(); // Needed for damping/lerp
    } else if (isCockpitView && controlsRef.current) {
      // IMPORTANT: Disable OrbitControls when in cockpit view
      controlsRef.current.enabled = false;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={6} distance={0} decay={1} />

      {/* Background */}
      <Stars
        radius={500}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Sun */}
      <CelestialBody
        name="Sun"
        radius={C.SUN_RADIUS}
        textureUrl="/textures/sun.jpg" // Assuming texture in public/textures
        position={[0, 0, 0]}
        isEmissive
      />

      {/* Earth System */}
      <group ref={earthOrbitPivotRef}>
        <EarthGlobe position={[C.EARTH_ORBIT_RADIUS, 0, 0]}>
          {/* Airplane is now child of EarthGlobe */}
          <Airplane />

          {/* Moon System nested inside Earth */}
          <group ref={moonOrbitPivotRef}>
            <CelestialBody
              name="Moon"
              radius={C.MOON_RADIUS}
              textureUrl="/textures/moon_1024.jpg" // Assuming texture in public/textures
              position={[C.MOON_ORBIT_RADIUS, 0, 0]}
              orbitPivotRef={moonOrbitPivotRef} // Pass pivot ref for tidal lock
              rotationSpeed={C.MOON_ORBIT_SPEED} // Counter-rotation speed
            />
          </group>
        </EarthGlobe>
      </group>

      {/* Controls - disabled/enabled based on view */}
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={0.1}
        maxDistance={1500}
        enabled={!isCockpitView} // Initially set based on context
      />
    </>
  );
};

export const SceneContainer: React.FC = () => {
  return (
    <Canvas
      camera={{
        position: [
          C.EARTH_ORBIT_RADIUS + C.earthRadius * 2,
          C.earthRadius,
          C.earthRadius * 2,
        ],
        fov: 75,
        near: 0.1,
        far: 2000,
      }}
    >
      <Suspense fallback={null}>
        {" "}
        {/* Needed for async loading (textures, models) */}
        <SceneContent />
      </Suspense>
    </Canvas>
  );
};
