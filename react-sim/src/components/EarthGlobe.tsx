import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import * as THREE from "three";
import ThreeGlobe from "three-globe"; // Import the library
import { earthRadius, EARTH_DAY_SPEED } from "../constants";
import { Airplane } from "./Airplane"; // Import Airplane

// Extend ThreeGlobe for R3F usage (optional but good practice)
extend({ ThreeGlobe });

// Hacky type augmentation if extend doesn't work perfectly
declare global {
  namespace JSX {
    interface IntrinsicElements {
      threeGlobe: any; // Use a more specific type if possible
    }
  }
}

interface EarthGlobeProps {
  position: [number, number, number];
  children?: React.ReactNode; // To allow nesting Airplane etc.
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  position,
  children,
}) => {
  const globeRef = useRef<ThreeGlobe | null>(null!); // Ref to the ThreeGlobe instance
  const groupRef = useRef<THREE.Group>(null!); // Ref to the parent group for rotation
  const { scene } = useThree(); // Access the R3F scene

  // Memoize the ThreeGlobe instance creation
  const globeInstance = useMemo(
    () =>
      new ThreeGlobe({
        waitForGlobeReady: true,
        animateIn: false,
      })
        .globeImageUrl(
          "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        )
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .atmosphereColor("#aaddff")
        .atmosphereAltitude(0.15),
    [] // Empty dependency array ensures it's created only once
  );

  // Use useEffect to add the imperatively created globe to the scene graph managed by R3F
  useEffect(() => {
    if (groupRef.current && globeInstance) {
      // Add the globe instance directly to the Group managed by R3F
      groupRef.current.add(globeInstance as unknown as THREE.Object3D); // Cast needed as types might mismatch
      // Set globe radius (important for calculations)
      (globeInstance as any)._globeRadius = earthRadius; // Access internal property if needed
    }

    // Cleanup function to remove the globe when the component unmounts
    return () => {
      if (groupRef.current && globeInstance) {
        groupRef.current.remove(globeInstance as unknown as THREE.Object3D);
      }
      // Dispose geometry/materials if necessary
      // globeInstance.dispose?.();
    };
  }, [globeInstance]); // Re-run if globeInstance changes (shouldn't with useMemo)

  useFrame(() => {
    // Earth's axial rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += EARTH_DAY_SPEED;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Render children (like Airplane) relative to this rotating group */}
      {children}
      {/* We don't render <threeGlobe /> declaratively here, */}
      {/* because we added the instance imperatively in useEffect */}
    </group>
  );
};
