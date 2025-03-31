// src/utils/geo.ts
import * as THREE from "three";

/**
 * Converts Latitude/Longitude coordinates to Cartesian coordinates on a sphere.
 * @param lat Latitude in degrees (-90 to 90)
 * @param lon Longitude in degrees (-180 to 180)
 * @param radius The radius of the sphere.
 * @returns THREE.Vector3 representing the Cartesian coordinates.
 */
export function latLonToCartesian(
  lat: number,
  lon: number,
  radius: number
): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180; // Convert lat to radians (polar angle)
  const theta = ((lon + 180) * Math.PI) / 180; // Convert lon to radians (azimuthal angle)

  // Calculate cartesian coordinates using spherical coordinate formulas
  // Note the axis conventions: Y is typically up in Three.js
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

/**
 * Converts Cartesian coordinates on a sphere to Latitude/Longitude coordinates.
 * @param position A THREE.Vector3 representing the position on the sphere.
 * @returns An object { lat: number, lon: number } in degrees.
 */
export function cartesianToLatLon(position: THREE.Vector3): {
  lat: number;
  lon: number;
} {
  const radius = position.length();
  if (radius === 0) {
    // Avoid division by zero at the center
    return { lat: 0, lon: 0 };
  }

  // Calculate latitude (angle from the XZ plane towards Y)
  // acos(y / radius) gives the polar angle (phi) from the positive Y axis
  const lat = 90 - (Math.acos(position.y / radius) * 180) / Math.PI;

  // Calculate longitude (angle around the Y axis from a reference direction)
  // atan2(z, -x) gives the angle in the XZ plane. Adjust range to -180 to 180.
  const lon =
    (((Math.atan2(position.z, -position.x) * 180) / Math.PI + 360) % 360) - 180;

  return { lat, lon };
}
