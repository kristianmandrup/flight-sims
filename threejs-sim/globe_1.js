import * as THREE from "three";
import ThreeGlobe from "three-globe";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- Constants (ADJUST THESE for visual preference) ---
const SUN_RADIUS = 15; // Much smaller than reality, but large visually
const EARTH_ORBIT_RADIUS = 150; // Scaled distance from Sun
const EARTH_DAY_SPEED = 0.05; // Speed of Earth's rotation (spin)
const EARTH_YEAR_SPEED = 0.001; // Speed of Earth's orbit around Sun

const MOON_RADIUS = 1; // Scaled moon size
const MOON_ORBIT_RADIUS = 10; // Scaled distance from Earth
const MOON_ORBIT_SPEED = 0.01; // Speed of Moon's orbit around Earth (also determines its rotation for tidal lock)

// --- Basic Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
); // Increased far plane
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lighting ---
// Ambient light for faint global illumination
scene.add(new THREE.AmbientLight(0x404040, 0.3)); // Dim ambient light

// The Sun itself will be the primary light source
const sunLight = new THREE.PointLight(0xffffff, 3, 0, 1); // Color, Intensity, Distance (0=infinite), Decay (1=realistic)
// Note: PointLight intensity is high because it falls off realistically. Adjust as needed.
sunLight.position.set(0, 0, 0); // Positioned at the center (where the Sun mesh is)
scene.add(sunLight);

// --- Sun ---
const sunTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/sun.jpg"
); // Example texture
const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
  map: sunTexture /* emissive: 0xffff00, emissiveIntensity: 1 */,
}); // Emissive makes it glow even without light
const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.position.set(0, 0, 0); // Sun is at the origin
scene.add(sunMesh);

// --- Earth System ---
// Create a pivot point for Earth's orbit around the Sun
const earthOrbitPivot = new THREE.Group();
scene.add(earthOrbitPivot);

// Create the Earth using three-globe (now add it to the pivot, not the scene directly)
const earthGlobe = new ThreeGlobe({ waitForGlobeReady: true, animateIn: false }) // Use default radius (adjust if needed)
  .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
  .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
  .atmosphereColor("#aaddff") // Slightly adjusted atmosphere color
  .atmosphereAltitude(0.15);

// Set Earth's position relative to the orbit pivot
earthGlobe.position.x = EARTH_ORBIT_RADIUS;
earthOrbitPivot.add(earthGlobe); // Add Earth to its orbit pivot

// --- Moon System ---
// Create a pivot point for Moon's orbit around Earth. Add this to the Earth object itself.
const moonOrbitPivot = new THREE.Group();
earthGlobe.add(moonOrbitPivot); // Moon orbits Earth, so pivot is child of Earth

// Create the Moon
const moonTexture = new THREE.TextureLoader().load(
  "https://threejs.org/examples/textures/planets/moon_1024.jpg"
); // Example texture
const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
const moonMaterial = new THREE.MeshStandardMaterial({
  map: moonTexture,
  roughness: 0.9,
  metalness: 0.1,
}); // Standard material to receive light
const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.position.x = MOON_ORBIT_RADIUS; // Position relative to moon orbit pivot
moonOrbitPivot.add(moonMesh);

// --- Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 10;
controls.maxDistance = 1000; // Allow zooming out further

// Start camera position
camera.position.set(
  EARTH_ORBIT_RADIUS * 1.5,
  EARTH_ORBIT_RADIUS * 0.5,
  EARTH_ORBIT_RADIUS * 1.5
);
controls.target.set(0, 0, 0); // Look towards the Sun initially

// --- Handle Resize ---
window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// --- Animation Loop ---
const clock = new THREE.Clock(); // Use clock for smoother animation independent of frame rate

function animate() {
  const delta = clock.getDelta(); // Time since last frame
  const elapsed = clock.getElapsedTime(); // Total time elapsed

  // 1. Earth orbits the Sun
  earthOrbitPivot.rotation.y += EARTH_YEAR_SPEED;

  // 2. Earth rotates on its axis
  earthGlobe.rotation.y += EARTH_DAY_SPEED;

  // 3. Moon orbits the Earth
  moonOrbitPivot.rotation.y += MOON_ORBIT_SPEED;

  // 4. Moon tidal locking (same face towards Earth)
  // To keep the same face towards Earth, the Moon needs to rotate *opposite*
  // to its orbit around Earth, relative to its own center.
  // Since moonMesh is a child of moonOrbitPivot which rotates, we set the
  // moonMesh's rotation to counteract the pivot's rotation.
  moonMesh.rotation.y = -moonOrbitPivot.rotation.y;
  // Alternatively, if texture alignment is different, you might need an offset:
  // moonMesh.rotation.y = -moonOrbitPivot.rotation.y + Math.PI; // Rotate 180 degrees if back faces Earth initially

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Request next frame
  requestAnimationFrame(animate);
}

// --- Start ---
// Make sure globe is ready before starting animation if needed
// For three-globe, it handles internal loading, so we can often start directly
console.log("Initializing simulation...");
animate();

// Optional: Add country polygons or other features back to earthGlobe here if desired
// fetch('//unpkg.com/three-globe/example/datasets/ne_110m_admin_0_countries.geojson')
//   .then(res => res.json())
//   .then(countries => {
//     earthGlobe.polygonsData(countries.features)
//       .polygonCapColor(() => 'rgba(0, 200, 0, 0.4)')
//       .polygonSideColor(() => 'rgba(0, 100, 0, 0.1)')
//       .polygonStrokeColor(() => '#333');
//   }).catch(err => console.error("Error loading country data:", err));
