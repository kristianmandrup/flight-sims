import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- Constants ---
const SUN_RADIUS = 15;
const EARTH_ORBIT_RADIUS = 150;
const EARTH_DAY_SPEED = 0.005;
const EARTH_YEAR_SPEED = 0.001;

const MOON_RADIUS = 1;
const MOON_ORBIT_RADIUS = 10;
const MOON_ORBIT_SPEED = 0.01;

// Airplane Constants
const earthRadius = 100;
const AIRPLANE_INITIAL_LAT = 48.85; // *** Paris Latitude ***
const AIRPLANE_INITIAL_LON = 2.35; // *** Paris Longitude ***
const AIRPLANE_INITIAL_ALTITUDE = 3; // *** 3km Altitude ***
const AIRPLANE_SIZE = 1; // Visual size (adjust if using a real model)
const AIRPLANE_MIN_SPEED = 5;
const AIRPLANE_MAX_SPEED = 50;
const AIRPLANE_INITIAL_SPEED = 15;
const AIRPLANE_ACCELERATION = 15;
const AIRPLANE_TURN_SPEED = 1.0;
const INDICATOR_SIZE = 5;

// --- Basic Setup ---
const scene = new THREE.Scene();
// Add a basic starfield background
const starTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/starfield.jpg"
); // Simple star texture
scene.background = starTexture; // Use as background instead of black

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Get Info Panel Elements (Make sure IDs exist in index.html)
const infoPanel = document.getElementById("infoPanel");
const posElement = document.getElementById("pos");
const altElement = document.getElementById("alt");
const hdgElement = document.getElementById("hdg");
const spdElement = document.getElementById("spd");
// Add element to show orbit state
const orbitStatusElement = document.getElementById("orbitStatus"); // Needs adding to HTML

// --- Lighting ---
scene.add(new THREE.AmbientLight(0x404040, 0.4)); // Slightly brighter ambient
const sunLight = new THREE.PointLight(0xffffff, 6, 0, 1);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// --- Sun ---
const sunTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/sun.jpg"
);
const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture /* emissive: 0xffff00 */,
}); // Make it glow slightly
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sunMesh);

// --- Earth System ---
const earthOrbitPivot = new THREE.Group();
scene.add(earthOrbitPivot);

const earthGlobe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: false })
  .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg") // Layer 1: Base Image
  .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
  // Add cloud layer example (replace URL with a proper transparent cloud map if desired)
  // .atmosphereImageUrl('//unpkg.com/three-globe/example/img/earth-clouds.png') // Example usage, find a real texture
  .atmosphereColor("#aaddff")
  .atmosphereAltitude(0.15);

earthGlobe.position.x = EARTH_ORBIT_RADIUS;
earthOrbitPivot.add(earthGlobe);

// --- Moon System ---
const moonOrbitPivot = new THREE.Group();
earthGlobe.add(moonOrbitPivot);
const moonTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/moon_1024.jpg"
);
const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
  roughness: 0.9,
  metalness: 0.1,
});
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.position.x = MOON_ORBIT_RADIUS;
moonOrbitPivot.add(moonMesh);

// --- Airplane ---
// CURRENTLY A CONE - Replace this section when loading a real model
const airplaneGeometry = new THREE.ConeGeometry(
  AIRPLANE_SIZE / 2,
  AIRPLANE_SIZE * 2,
  8
);
airplaneGeometry.rotateX(Math.PI / 2); // Point forward (+Z)
const airplaneMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  side: THREE.DoubleSide,
});
const airplaneMesh = new THREE.Mesh(airplaneGeometry, airplaneMaterial);
earthGlobe.add(airplaneMesh);

// Cockpit Camera Anchor - Adjusted to front tip of cone
const cockpitAnchor = new THREE.Object3D();
// Cone tip is at height/2 along its axis, which is local Z after rotation
cockpitAnchor.position.set(0, 0, AIRPLANE_SIZE); // *** Position at front tip ***
airplaneMesh.add(cockpitAnchor);

// --- Airplane Indicator ---
const indicatorGeometry = new THREE.RingGeometry(
  INDICATOR_SIZE * 0.8,
  INDICATOR_SIZE,
  16
);
const indicatorMaterial = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
});
const indicatorMesh = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
earthGlobe.add(indicatorMesh);

// --- Airplane & System State ---
let airplaneAltitude = AIRPLANE_INITIAL_ALTITUDE;
let airplaneTargetSpeed = AIRPLANE_INITIAL_SPEED;
let airplaneCurrentSpeed = AIRPLANE_INITIAL_SPEED;
let isEarthOrbiting = true; // *** State for Earth Orbit ***
let isCockpitView = false;

// --- Initial Positioning ---
function positionAirplane(lat, lon, alt) {
  // ... (positioning logic remains the same)
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const radius = earthRadius + alt;
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  airplaneMesh.position.set(x, y, z);
  airplaneAltitude = alt;

  // Initial Orientation (look north)
  const northLat = lat + 0.1;
  const northPhi = ((90 - northLat) * Math.PI) / 180;
  const northTheta = ((lon + 180) * Math.PI) / 180;
  const nx = -radius * Math.sin(northPhi) * Math.cos(northTheta);
  const ny = radius * Math.cos(northPhi);
  const nz = radius * Math.sin(northPhi) * Math.sin(northTheta);
  const northPoint = new THREE.Vector3(nx, ny, nz);
  airplaneMesh.up.copy(airplaneMesh.position).normalize();
  airplaneMesh.lookAt(northPoint);

  indicatorMesh.position.copy(airplaneMesh.position);
  indicatorMesh.lookAt(airplaneMesh.position.clone().multiplyScalar(1.1));
}
// *** Set initial position over Paris ***
positionAirplane(
  AIRPLANE_INITIAL_LAT,
  AIRPLANE_INITIAL_LON,
  AIRPLANE_INITIAL_ALTITUDE
);

// --- Keyboard Controls State ---
const keysPressed = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  w: false,
  s: false,
  c: false,
  p: false, // Added 'p' for Pause Orbit
};

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key in keysPressed) {
    keysPressed[key] = true;
    if (key === "c") {
      isCockpitView = !isCockpitView;
      controls.enabled = !isCockpitView;
    }
    if (key === "p") {
      // *** Toggle Orbit on key down ***
      isEarthOrbiting = !isEarthOrbiting;
      console.log("Earth Orbiting:", isEarthOrbiting);
      updateOrbitStatus(); // Update display immediately
    }
  }
});

document.addEventListener("keyup", (event) => {
  const key = event.key.toLowerCase();
  if (key in keysPressed) {
    keysPressed[key] = false;
  }
});

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 0.1; // Allow closer zoom, esp. for cockpit
controls.maxDistance = 1500; // Allow zooming out slightly more
// Start camera looking towards Earth initially
const initialCamPos = new THREE.Vector3(
  EARTH_ORBIT_RADIUS + earthRadius * 2,
  earthRadius,
  earthRadius * 2
);
camera.position.copy(initialCamPos);
const earthWorldPos = new THREE.Vector3();
earthGlobe.getWorldPosition(earthWorldPos); // Need globe's initial world pos
controls.target.copy(earthWorldPos);

// --- Handle Resize ---
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Helper: Cartesian to Lat/Lon ---
function cartesianToLatLon(position) {
  // ... (remains the same)
  const radius = position.length();
  const lat = 90 - (Math.acos(position.y / radius) * 180) / Math.PI;
  const lon =
    ((180 + (Math.atan2(-position.x, position.z) * 180) / Math.PI) % 360) - 180;
  return { lat, lon };
}

// --- Helper: Update Orbit Status Display ---
function updateOrbitStatus() {
  if (orbitStatusElement) {
    // Check if element exists
    orbitStatusElement.textContent = isEarthOrbiting ? "ON" : "OFF";
  }
}

// --- Animation Loop ---
const clock = new THREE.Clock();
const euler = new THREE.Euler(0, 0, 0, "YXZ");

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // --- Animate Celestial Bodies ---
  if (isEarthOrbiting) {
    // *** Only orbit if enabled ***
    earthOrbitPivot.rotation.y += EARTH_YEAR_SPEED;
  }
  earthGlobe.rotation.y += EARTH_DAY_SPEED;
  moonOrbitPivot.rotation.y += MOON_ORBIT_SPEED;
  moonMesh.rotation.y = -moonOrbitPivot.rotation.y;

  // --- Airplane Velocity Control ---
  // ... (remains the same)
  if (keysPressed.w) airplaneTargetSpeed += AIRPLANE_ACCELERATION * delta;
  if (keysPressed.s) airplaneTargetSpeed -= AIRPLANE_ACCELERATION * delta;
  airplaneTargetSpeed = Math.max(
    AIRPLANE_MIN_SPEED,
    Math.min(AIRPLANE_MAX_SPEED, airplaneTargetSpeed)
  );
  airplaneCurrentSpeed +=
    (airplaneTargetSpeed - airplaneCurrentSpeed) * delta * 5.0;

  // --- Airplane Directional Controls & Movement ---
  // ... (movement logic remains the same)
  const yawAngle = AIRPLANE_TURN_SPEED * delta;
  if (keysPressed.ArrowLeft) airplaneMesh.rotateY(yawAngle);
  if (keysPressed.ArrowRight) airplaneMesh.rotateY(-yawAngle);

  let moveDirection = 0;
  if (keysPressed.ArrowUp) moveDirection = 1;
  else if (keysPressed.ArrowDown) moveDirection = -0.5;
  const actualMoveSpeed = airplaneCurrentSpeed * moveDirection * delta;

  if (actualMoveSpeed !== 0) {
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(
      airplaneMesh.quaternion
    );
    const positionVector = airplaneMesh.position.clone().normalize();
    const rotationAxis = new THREE.Vector3()
      .crossVectors(positionVector, forward)
      .normalize();
    if (!isNaN(rotationAxis.x)) {
      const currentRadius = earthRadius + airplaneAltitude;
      const angle = actualMoveSpeed / currentRadius;
      airplaneMesh.position.applyAxisAngle(rotationAxis, angle);
      const rotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
        rotationAxis,
        angle
      );
      airplaneMesh.quaternion.premultiply(rotationQuaternion);
      const targetPosition = airplaneMesh.position
        .clone()
        .add(forward.multiplyScalar(0.1)); // Look slightly ahead
      airplaneMesh.up.copy(airplaneMesh.position).normalize();
      airplaneMesh.lookAt(targetPosition);
    }
  }

  // Update Indicator
  // ... (remains the same)
  indicatorMesh.position.copy(airplaneMesh.position);
  indicatorMesh.lookAt(airplaneMesh.position.clone().multiplyScalar(1.1));
  const camDistToPlane = camera.position.distanceTo(airplaneMesh.position);
  indicatorMesh.material.opacity = THREE.MathUtils.lerp(
    0.8,
    0.1,
    Math.min(1, camDistToPlane / 300)
  );

  // --- Camera Logic ---
  // ... (remains the same)
  const airplaneWorldPosition = airplaneMesh.getWorldPosition(
    new THREE.Vector3()
  );
  if (isCockpitView) {
    controls.enabled = false;
    const cockpitWorldPosition = cockpitAnchor.getWorldPosition(
      new THREE.Vector3()
    );
    const cockpitWorldQuaternion = cockpitAnchor.getWorldQuaternion(
      new THREE.Quaternion()
    );
    camera.position.copy(cockpitWorldPosition);
    camera.quaternion.copy(cockpitWorldQuaternion);
  } else {
    controls.enabled = true;
    controls.target.lerp(airplaneWorldPosition, 0.1);
    controls.update();
  }

  // --- Update Info Panel ---
  // ... (remains the same, using updated values)
  const { lat, lon } = cartesianToLatLon(airplaneMesh.position);
  const altKm = airplaneAltitude.toFixed(2);
  euler.setFromQuaternion(airplaneMesh.quaternion, "YXZ");
  const heading = (THREE.MathUtils.radToDeg(euler.y) + 360) % 360;
  posElement.textContent = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  altElement.textContent = altKm;
  hdgElement.textContent = heading.toFixed(1);
  spdElement.textContent = airplaneCurrentSpeed.toFixed(1);
  // Orbit status updated only on toggle via updateOrbitStatus()

  // --- Render ---
  renderer.render(scene, camera);
}

// --- Start ---
console.log("Initializing simulation...");
updateOrbitStatus(); // Set initial orbit status text
animate();
