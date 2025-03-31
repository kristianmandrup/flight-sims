import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { earthRadius } from "../constants"; // Use your defined radius

// Import shaders as raw strings using Vite's ?raw feature
import vertexShader from "../shaders/earthVertex.glsl?raw";
import fragmentShader from "../shaders/earthFragment.glsl?raw";

interface DisplacedEarthProps {
  position: [number, number, number];
  displacementScale?: number; // Make scale configurable
  sunPosition: THREE.Vector3; // Pass sun position for lighting
  children?: React.ReactNode; // Allow nesting Airplane etc. still
}

export const DisplacedEarth: React.FC<DisplacedEarthProps> = ({
  position,
  displacementScale = 2.0, // Default scale factor - **TUNE THIS VALUE**
  sunPosition,
  children,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Load Textures
  const [heightMap, colorMap] = useLoader(THREE.TextureLoader, [
    "/textures/heightmap_earth_8k.png", // Replace with your heightmap filename
    "/textures/colormap_earth_8k.jpg", // Replace with your colormap filename
  ]);

  // Ensure textures wrap correctly on the sphere
  heightMap.wrapS = heightMap.wrapT = THREE.RepeatWrapping; // Or ClampToEdgeWrapping
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;

  // Define Shader Material using useMemo for performance
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        // Textures
        heightMap: { value: heightMap },
        colorMap: { value: colorMap },
        // Parameters
        displacementScale: { value: displacementScale },
        // Lighting (example - adjust based on your scene's lighting)
        pointLightPos: { value: sunPosition || new THREE.Vector3(0, 0, 0) }, // Get sun position dynamically
        pointLightColor: { value: new THREE.Color(0xffffff) },
        ambientLightColor: {
          value: new THREE.Color(0x404040).multiplyScalar(0.4),
        }, // Match scene ambient
        // cameraPosition: { value: new THREE.Vector3() } // Needed for specular
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      // side: THREE.DoubleSide, // Optional: Render backfaces if needed
    });
  }, [heightMap, colorMap, displacementScale, sunPosition]); // Recreate material if these change

  // Optional: Update uniforms dynamically if needed (e.g., moving sun)
  useFrame(({ camera }) => {
    if (shaderMaterial) {
      // Update sun position if it moves (assuming sunPosition prop is updated)
      shaderMaterial.uniforms.pointLightPos.value.copy(sunPosition);
      // If doing specular lighting:
      // shaderMaterial.uniforms.cameraPosition.value.copy(camera.position);
    }
    // Earth's axial rotation (can still be applied to the mesh)
    if (meshRef.current) {
      // meshRef.current.rotation.y += EARTH_DAY_SPEED; // Apply rotation here
    }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial} position={position}>
      {/* High-segment sphere is crucial for smooth displacement */}
      {/* Increase segments (e.g., 128x64 or 256x128) for better detail */}
      <sphereGeometry args={[earthRadius, 128, 64]} />
      {/* Render children relative to this displaced Earth */}
      {/* Note: Child positions will be relative to the *center* of this mesh */}
      {children}
    </mesh>
  );
};
