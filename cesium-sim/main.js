// Your Cesium Ion access token.
// IMPORTANT: Replace with your actual token! Ensure it's correct.
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzUyMTc5NS04ZmFiLTRjZjItYjA3Yy0wNWY3YmY5ZWIyMGMiLCJpZCI6Mjg4ODQ5LCJpYXQiOjE3NDMyMDM1MTd9.i6BHNwbpDFKLPu0FcbDncn4pHgTCEQQkrUkgggeo23Q";

// Wrap the viewer initialization in an async function
async function initializeGlobe() {
  try {
    // Await the asynchronous creation of the terrain provider
    const terrainProvider = await Cesium.createWorldTerrainAsync();

    // Initialize the Cesium Viewer in the 'cesiumContainer' div,
    // now passing the resolved terrain provider
    const viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: terrainProvider,
      // Add other options back if you had them
      // --- Disable Widgets ---
      animation: false, // Animation widget (bottom left)
      baseLayerPicker: false, // Base layer picker (top right)
      fullscreenButton: false, // Fullscreen button (top right)
      vrButton: false, // VR button (top right)
      geocoder: false, // Geocoder search (top right)
      homeButton: false, // Home button (top right)
      infoBox: false, // Info box (pops up when clicking entities)
      sceneModePicker: false, // Scene mode picker (top right)
      selectionIndicator: false, // Green selection outline
      timeline: false, // Timeline scrubber (bottom)
      navigationHelpButton: false, // Help button (top right)
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true, // Optional: Lock to 3D mode
    });

    // Optional: Fly the camera to a specific starting location
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 15000000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-90.0),
        roll: 0.0,
      },
    });

    console.log("CesiumJS Viewer Initialized with async terrain!");

    // You can return the viewer instance if needed elsewhere
    // return viewer;
  } catch (error) {
    // Log any errors during initialization
    console.error("Error initializing Cesium Viewer:", error);
    // Display error to the user?
    const errorDiv = document.createElement("div");
    errorDiv.textContent = `Failed to initialize Cesium: ${error}. Check console & token. Ensure you are online.`;
    errorDiv.style.color = "red";
    errorDiv.style.padding = "10px";
    document.body.prepend(errorDiv); // Add error message to the top of the page
  }
}

// Call the async function to start the initialization
initializeGlobe();

// --- Future code for airplane, controls, data layers will go below or be called from initializeGlobe ---
