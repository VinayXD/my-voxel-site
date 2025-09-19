// src/core/Controls.ts
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type ControlsLimits = {
  minDistance?: number;
  maxDistance?: number;
  minPolarDeg?: number;    // 0 = straight down the +Y axis; 90 = horizon
  maxPolarDeg?: number;
  minAzimuthDeg?: number;  // negative = left, positive = right
  maxAzimuthDeg?: number;
  enableDamping?: boolean;
  dampingFactor?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotate?: boolean;
};

export const deg = (d: number) => THREE.MathUtils.degToRad(d);

export function createControls(
  camera: THREE.PerspectiveCamera,
  dom: HTMLElement,
  limits?: ControlsLimits
) {
  const controls = new OrbitControls(camera, dom);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;

  // sensible defaults
  controls.minDistance = 0.6;
  controls.maxDistance = 14;
  controls.minPolarAngle = deg(5);
  controls.maxPolarAngle = deg(85);
  controls.minAzimuthAngle = -Infinity;
  controls.maxAzimuthAngle = +Infinity;

  if (limits) applyControlsLimits(controls, limits);
  return controls;
}

export function applyControlsLimits(controls: OrbitControls, lim: ControlsLimits) {
  if (lim.minDistance !== undefined) controls.minDistance = lim.minDistance;
  if (lim.maxDistance !== undefined) controls.maxDistance = lim.maxDistance;

  if (lim.minPolarDeg !== undefined) controls.minPolarAngle = deg(lim.minPolarDeg);
  if (lim.maxPolarDeg !== undefined) controls.maxPolarAngle = deg(lim.maxPolarDeg);

  if (lim.minAzimuthDeg !== undefined) controls.minAzimuthAngle = deg(lim.minAzimuthDeg);
  if (lim.maxAzimuthDeg !== undefined) controls.maxAzimuthAngle = deg(lim.maxAzimuthDeg);

  if (lim.enableDamping !== undefined) controls.enableDamping = lim.enableDamping;
  if (lim.dampingFactor !== undefined) controls.dampingFactor = lim.dampingFactor;
  if (lim.enablePan !== undefined) controls.enablePan = lim.enablePan;
  if (lim.enableZoom !== undefined) controls.enableZoom = lim.enableZoom;
  if (lim.enableRotate !== undefined) controls.enableRotate = lim.enableRotate;
}

/** Lock zoom to the current distance (classic “arc camera” feel). */
export function lockDistanceToCurrent(controls: OrbitControls, camera: THREE.Camera) {
  const d = (camera as THREE.PerspectiveCamera).position.distanceTo(controls.target as any);
  controls.minDistance = d;
  controls.maxDistance = d;
  controls.enableZoom = false;
}

/** Re-enable zoom with a range. */
export function unlockZoom(controls: OrbitControls, min = 0.6, max = 14) {
  controls.minDistance = min;
  controls.maxDistance = max;
  controls.enableZoom = true;
}
