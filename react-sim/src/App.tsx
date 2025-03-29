import React from "react";
import { SceneContainer } from "./components/SceneContainer";
import { InfoPanel } from "./components/InfoPanel";
import { FlightProvider } from "./context/FlightContext";
import "./style.css"; // Import global styles

function App() {
  return (
    <FlightProvider>
      {" "}
      {/* Wrap everything that needs flight context */}
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <SceneContainer />
        <InfoPanel />
      </div>
    </FlightProvider>
  );
}

export default App;
