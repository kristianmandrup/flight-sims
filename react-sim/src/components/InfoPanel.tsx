import React from "react";
import { useFlightContext } from "../context/FlightContext";
import { KeyMap } from "../constants";

// Define props if needed, but here we use context
// interface InfoPanelProps {}

export const InfoPanel: React.FC = () => {
  // Consume data from context
  const { lat, lon, altitude, heading, speed, isOrbitPaused } =
    useFlightContext();

  return (
    <div id="infoPanel">
      {" "}
      {/* Use the ID from style.css */}
      <h4>Flight Info & Controls</h4>
      <div id="flightData">
        <span>Position:</span>{" "}
        <span>
          {lat.toFixed(2)}°, {lon.toFixed(2)}°
        </span>
        <br />
        <span>Altitude:</span> <span>{altitude.toFixed(2)} km</span>
        <br />
        <span>Heading:</span> <span>{heading.toFixed(1)} °</span>
        <br />
        <span>Speed:</span> <span>{speed.toFixed(1)} units/s</span>
        <br />
        <span>Orbit:</span>{" "}
        <span id="orbitStatus">{isOrbitPaused ? "OFF" : "ON"}</span>
      </div>
      <hr style={{ borderColor: "#555", margin: "10px 0" }} />
      <div>
        <span>[{KeyMap.forward}]</span> Move Fwd
        <br />
        <span>[{KeyMap.backward}]</span> Move Bwd
        <br />
        <span>[{KeyMap.left}]</span> Yaw Left
        <br />
        <span>[{KeyMap.right}]</span> Yaw Right
        <br />
        <span>[{KeyMap.increaseSpeed.toUpperCase()}]</span> Increase Speed
        <br />
        <span>[{KeyMap.decreaseSpeed.toUpperCase()}]</span> Decrease Speed
        <br />
        <span>[{KeyMap.toggleCamera.toUpperCase()}]</span> Toggle Camera
        <br />
        <span>[{KeyMap.toggleOrbit.toUpperCase()}]</span> Pause/Play Orbit
        <br />
      </div>
    </div>
  );
};
