import { useState, useEffect, useCallback } from "react";
import { KeyMap } from "../constants";
import { KeyControls } from "../types";

// Helper to map event.key to our control actions
type ControlAction = keyof typeof KeyMap;
const keyToActionMap: { [key: string]: ControlAction } = {};
for (const action in KeyMap) {
  keyToActionMap[KeyMap[action as ControlAction].toLowerCase()] =
    action as ControlAction;
}

export function useKeyboardControls(): KeyControls {
  const [controls, setControls] = useState<KeyControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    increaseSpeed: false,
    decreaseSpeed: false,
    toggleCamera: false,
    toggleOrbit: false, // These are momentary presses
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const action = keyToActionMap[key];

    if (action) {
      // For toggles, only set true on initial press
      if (action === "toggleCamera" || action === "toggleOrbit") {
        setControls((prev) => ({ ...prev, [action]: true }));
      } else {
        // For holds, set true
        setControls((prev) => ({ ...prev, [action]: true }));
      }
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const action = keyToActionMap[key];

    if (action) {
      // For holds, set false on release
      if (action !== "toggleCamera" && action !== "toggleOrbit") {
        setControls((prev) => ({ ...prev, [action]: false }));
      }
      // Important: Reset toggle flags immediately after keyup so they only trigger once per press
      else {
        setControls((prev) => ({ ...prev, [action]: false }));
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Important: Reset momentary toggle flags *after* processing them in the component
  // This effect runs after the component using the hook renders
  useEffect(() => {
    setControls((prev) => ({
      ...prev,
      toggleCamera: false, // Reset after use
      toggleOrbit: false, // Reset after use
    }));
  }, [controls.toggleCamera, controls.toggleOrbit]);

  return controls;
}
