import { useRef, useEffect, useState } from "react"; // Add useState
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { CelestialBody } from "./CelestialBody";
import { Airplane } from "./Airplane";
import { useFlightContext } from "../context/FlightContext";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import * as C from "../constants"; // Import constants with an alias
import { DisplacedEarth } from "./DisplacedEarth"; // Import the new component
import * as THREE from "three";

export const SceneContent = () => {
  const { isOrbitPaused, isCockpitView, airplaneRef, setIsOrbitPaused } =
    useFlightContext();
  const keyboardControls = useKeyboardControls();

  const earthOrbitPivotRef = useRef(null!);
  const moonOrbitPivotRef = useRef(null!);
  const sunRef = useRef(null!); // Ref for the Sun mesh
  const controlsRef = useRef(null);

  // State to hold sun position for the shader
  const [currentSunPos, setCurrentSunPos] = useState(
    new THREE.Vector3(0, 0, 0)
  );

  useEffect(() => {
    /* ... Orbit toggle effect ... */
  }, [keyboardControls.toggleOrbit, setIsOrbitPaused]);

  useFrame((state, delta) => {
    // Update Sun position state (if it moves, otherwise set once)
    if (sunRef.current) {
      setCurrentSunPos(sunRef.current.position); // Or world position if needed
    }

    // ... (Earth/Moon orbit logic remains the same, applied to pivots) ...
    if (!isOrbitPaused && earthOrbitPivotRef.current) {
      earthOrbitPivotRef.current.rotation.y += C.EARTH_YEAR_SPEED;
    }
    if (moonOrbitPivotRef.current) {
      moonOrbitPivotRef.current.rotation.y += C.MOON_ORBIT_SPEED;
    }

    // Rotate the DisplacedEarth mesh itself for axial spin
    // Note: Accessing children via ref inside DisplacedEarth might be cleaner
    const earthMesh = earthOrbitPivotRef.current?.children.find(
      (c) => c.type === "Mesh"
    );
    if (earthMesh) {
      earthMesh.rotation.y += C.EARTH_DAY_SPEED;
    }

    // ... (OrbitControls update logic remains the same) ...
    if (!isCockpitView && controlsRef.current && airplaneRef.current) {
      const targetPosition = airplaneRef.current.getWorldPosition(
        new THREE.Vector3()
      );
      controlsRef.current.target.lerp(targetPosition, 0.1);
      controlsRef.current.enabled = true;
      controlsRef.current.update();
    } else if (isCockpitView && controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  });

  return (
    <>
      {/* Lighting (keep scene lighting) */}
      <ambientLight intensity={0.4} />
      {/* We use the Sun mesh position for the shader light, but keep the PointLight for other objects */}
      <pointLight position={[0, 0, 0]} intensity={6} distance={0} decay={1} />

      <Stars
        radius={500}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Sun - Add ref */}
      <mesh ref={sunRef} name="Sun" position={[0, 0, 0]}>
        <sphereGeometry args={[C.SUN_RADIUS, 32, 32]} />
        <meshBasicMaterial
          map={useTexture("/textures/sun.jpg")}
          toneMapped={false}
        />
      </mesh>

      {/* Earth System - Use DisplacedEarth */}
      <group ref={earthOrbitPivotRef}>
        <DisplacedEarth
          position={[C.EARTH_ORBIT_RADIUS, 0, 0]}
          displacementScale={2.0} // ** TUNE THIS **
          sunPosition={currentSunPos} // Pass sun position to shader
        >
          {/* Airplane is now child of DisplacedEarth */}
          <Airplane />

          {/* Moon System nested inside DisplacedEarth */}
          {/* Note: Moon position is now relative to DisplacedEarth's center */}
          <group ref={moonOrbitPivotRef}>
            <CelestialBody
              name="Moon"
              radius={C.MOON_RADIUS}
              textureUrl="/textures/moon_1024.jpg"
              position={[C.MOON_ORBIT_RADIUS, 0, 0]}
              orbitPivotRef={moonOrbitPivotRef}
              rotationSpeed={C.MOON_ORBIT_SPEED}
            />
          </group>
        </DisplacedEarth>
      </group>

      <OrbitControls ref={controlsRef} /* ... props ... */ />
    </>
  );
};
