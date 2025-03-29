import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface CelestialBodyProps {
  name: string;
  radius: number;
  textureUrl: string;
  position: [number, number, number];
  isEmissive?: boolean; // For Sun
  rotationSpeed?: number; // For Moon's tidal lock counter-rotation
  orbitPivotRef?: React.RefObject<THREE.Group>; // For Moon's orbit
}

export const CelestialBody: React.FC<CelestialBodyProps> = ({
  name,
  radius,
  textureUrl,
  position,
  isEmissive = false,
  rotationSpeed = 0, // No rotation by default
  orbitPivotRef,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useLoader(THREE.TextureLoader, textureUrl);

  // Counter-rotate moon for tidal lock
  useFrame(() => {
    if (meshRef.current && rotationSpeed !== 0 && orbitPivotRef?.current) {
      // Match negative of pivot's rotation
      meshRef.current.rotation.y = -orbitPivotRef.current.rotation.y;
    }
  });

  return (
    <mesh ref={meshRef} name={name} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      {isEmissive ? (
        <meshBasicMaterial map={texture} toneMapped={false} /> // toneMapped=false for emissive
      ) : (
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0.1} />
      )}
    </mesh>
  );
};
