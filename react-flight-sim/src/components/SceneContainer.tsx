import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as C from "../constants"; // Import constants with an alias
import { SceneContent } from "./BasicSceneContent";

export const SceneContainer = () => {
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
        <SceneContent />
      </Suspense>
    </Canvas>
  );
};
