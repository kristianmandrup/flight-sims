import React, { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei"; // Import useGLTF
import { useFlightContext } from "../context/FlightContext";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import {
  earthRadius,
  AIRPLANE_INITIAL_LAT,
  AIRPLANE_INITIAL_LON,
  AIRPLANE_INITIAL_ALTITUDE,
  // AIRPLANE_SIZE, // Size might come from model or be applied via scale
  AIRPLANE_TURN_SPEED,
  AIRPLANE_ACCELERATION,
  AIRPLANE_MIN_SPEED,
  AIRPLANE_MAX_SPEED,
  INDICATOR_SIZE,
} from "../constants";
import { cartesianToLatLon, latLonToCartesian } from "../utils/geo"; // Assuming utils file

// Define the expected structure of the GLTF result if needed (optional)
// interface GLTFResult {
//     nodes: { [name: string]: THREE.Mesh };
//     materials: { [name: string]: THREE.Material };
//     scene: THREE.Group;
// }

export const Airplane: React.FC = () => {
  const {
    airplaneRef, // Use the ref from context
    setFlightData,
    targetSpeed,
    setTargetSpeed,
    isCockpitView,
    setIsCockpitView,
  } = useFlightContext();
  const controls = useKeyboardControls();
  const cockpitAnchorRef = useRef<THREE.Object3D>(null!);
  const indicatorRef = useRef<THREE.Mesh>(null!);
  const currentSpeed = useRef<number>(AIRPLANE_INITIAL_SPEED);
  const { camera } = useThree();

  // --- Load the GLTF Model ---
  // Path is relative to the /public directory
  const { scene: airplaneModelScene } = useGLTF("/models/airplane.glb");
  // If your model has specific nodes/materials you need to access:
  // const { nodes, materials } = useGLTF('/models/airplane.glb') as unknown as GLTFResult;

  // Clone the scene to avoid modifying the original cache
  // Use useMemo to clone only once
  const clonedScene = React.useMemo(
    () => airplaneModelScene.clone(),
    [airplaneModelScene]
  );

  // --- Initial Positioning & Orientation ---
  useEffect(() => {
    // Use the ref assigned to the <primitive> below
    if (airplaneRef.current) {
      console.log("Airplane Ref available, setting initial position.");
      const initialRadius = earthRadius + AIRPLANE_INITIAL_ALTITUDE;
      const initialPos = latLonToCartesian(
        AIRPLANE_INITIAL_LAT,
        AIRPLANE_INITIAL_LON,
        initialRadius
      );
      airplaneRef.current.position.copy(initialPos);

      // Orientation needs careful adjustment based on the model's default rotation
      // This might require experimentation:
      // 1. Reset rotation: airplaneRef.current.rotation.set(0, 0, 0);
      // 2. Point 'up' away from Earth center:
      airplaneRef.current.up.copy(initialPos).normalize();
      // 3. Look towards North (or another reference point)
      const northPos = latLonToCartesian(
        AIRPLANE_INITIAL_LAT + 0.1,
        AIRPLANE_INITIAL_LON,
        initialRadius
      );
      airplaneRef.current.lookAt(northPos);
      // 4. Apply any necessary correction rotations if the model isn't oriented correctly
      // e.g., airplaneRef.current.rotateX(Math.PI / 2);

      // --- Update context on initialization ---
      setFlightData((prev) => ({
        ...prev,
        lat: AIRPLANE_INITIAL_LAT,
        lon: AIRPLANE_INITIAL_LON,
        altitude: AIRPLANE_INITIAL_ALTITUDE,
        speed: currentSpeed.current,
      }));
    } else {
      console.warn("Airplane Ref not yet available in useEffect.");
    }
    // Add clonedScene as dependency if needed, though ref should handle it
  }, [airplaneRef, setFlightData, clonedScene]);

  // --- Toggle Camera Effect ---
  useEffect(() => {
    if (controls.toggleCamera) {
      setIsCockpitView((prev) => !prev);
    }
  }, [controls.toggleCamera, setIsCockpitView]);

  // --- Animation Frame Logic (useFrame) ---
  useFrame((state, delta) => {
    if (!airplaneRef.current) return; // Guard clause

    // ... (Speed Control logic remains the same) ...
    let newTargetSpeed = targetSpeed;
    if (controls.increaseSpeed) newTargetSpeed += AIRPLANE_ACCELERATION * delta;
    if (controls.decreaseSpeed) newTargetSpeed -= AIRPLANE_ACCELERATION * delta;
    newTargetSpeed = Math.max(
      AIRPLANE_MIN_SPEED,
      Math.min(AIRPLANE_MAX_SPEED, newTargetSpeed)
    );
    if (newTargetSpeed !== targetSpeed) setTargetSpeed(newTargetSpeed);
    currentSpeed.current +=
      (newTargetSpeed - currentSpeed.current) * delta * 5.0;

    // ... (Directional Control & Movement logic remains the same, operating on airplaneRef.current) ...
    const yawAngle = AIRPLANE_TURN_SPEED * delta;
    if (controls.left) airplaneRef.current.rotateY(yawAngle);
    if (controls.right) airplaneRef.current.rotateY(-yawAngle);
    let moveDirection = 0;
    if (controls.forward) moveDirection = 1;
    else if (controls.backward) moveDirection = -0.5;
    const actualMoveSpeed = currentSpeed.current * moveDirection * delta;
    if (actualMoveSpeed !== 0) {
      const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
        airplaneRef.current.quaternion
      ); // Assumes model forward is +Z after initial correction
      const positionVector = airplaneRef.current.position.clone().normalize();
      const rotationAxis = new THREE.Vector3()
        .crossVectors(positionVector, forward)
        .normalize();
      if (!isNaN(rotationAxis.x)) {
        const currentRadius = airplaneRef.current.position.length();
        const angle = actualMoveSpeed / currentRadius;
        airplaneRef.current.position.applyAxisAngle(rotationAxis, angle);
        const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
          rotationAxis,
          angle
        );
        airplaneRef.current.quaternion.premultiply(rotationQuaternion);
        const targetPosition = airplaneRef.current.position
          .clone()
          .add(forward.multiplyScalar(0.1));
        airplaneRef.current.up.copy(airplaneRef.current.position).normalize();
        airplaneRef.current.lookAt(targetPosition);
      }
    }

    // ... (Update Flight Data Context logic remains the same) ...
    const { lat, lon } = cartesianToLatLon(airplaneRef.current.position);
    const altitude = airplaneRef.current.position.length() - earthRadius;
    const euler = new THREE.Euler().setFromQuaternion(
      airplaneRef.current.quaternion,
      "YXZ"
    );
    const heading = (THREE.MathUtils.radToDeg(euler.y) + 360) % 360;
    setFlightData({ lat, lon, altitude, heading, speed: currentSpeed.current });

    // ... (Update Indicator logic remains the same) ...
    if (indicatorRef.current) {
      indicatorRef.current.position.copy(airplaneRef.current.position);
      indicatorRef.current.lookAt(
        airplaneRef.current.position.clone().multiplyScalar(1.1)
      );
      const camDist = camera.position.distanceTo(airplaneRef.current.position);
      indicatorRef.current.material.opacity = THREE.MathUtils.lerp(
        0.8,
        0.1,
        Math.min(1, camDist / 300)
      );
      indicatorRef.current.visible = !isCockpitView;
    }

    // ... (Cockpit Camera Update logic remains the same, using cockpitAnchorRef) ...
    if (isCockpitView && cockpitAnchorRef.current) {
      const cockpitWorldPosition = cockpitAnchorRef.current.getWorldPosition(
        new THREE.Vector3()
      );
      const cockpitWorldQuaternion =
        cockpitAnchorRef.current.getWorldQuaternion(new THREE.Quaternion());
      state.camera.position.copy(cockpitWorldPosition);
      state.camera.quaternion.copy(cockpitWorldQuaternion);
      state.controls?.stop?.();
    }
  }); // End useFrame

  // --- Geometry/Material for Indicator (can stay) ---
  const indicatorGeometry = React.useMemo(
    () => new THREE.RingGeometry(INDICATOR_SIZE * 0.8, INDICATOR_SIZE, 16),
    []
  );
  const indicatorMaterial = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      }),
    []
  );

  // --- Render the Loaded Model ---
  return (
    <>
      {/* Use <primitive> to render the loaded GLTF scene graph */}
      {/* Assign the ref from context here! */}
      <primitive
        ref={airplaneRef}
        object={clonedScene} // Use the cloned scene
        scale={0.01} // *** Adjust scale as needed *** Example: scale down significantly
        // rotation={[0, Math.PI, 0]} // *** Adjust rotation as needed *** Example: rotate 180 degrees on Y
      >
        {/* Cockpit Anchor - Position relative to the loaded model's origin */}
        {/* Adjust position based on the model's structure and desired viewpoint */}
        <object3D ref={cockpitAnchorRef} position={[0, 0.5, 2]} />{" "}
        {/* Example position */}
      </primitive>

      {/* Indicator Mesh */}
      <mesh
        ref={indicatorRef}
        geometry={indicatorGeometry}
        material={indicatorMaterial}
      />
    </>
  );
};

// Remember to preload the model if desired for smoother loading:
useGLTF.preload("/models/airplane.glb");
