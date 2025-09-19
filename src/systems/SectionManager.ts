// src/systems/SectionManager.ts
import * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { UIManager } from './UIManager';

// erasableSyntaxOnly-friendly "enum"
export const SectionId = { Hero: 0, Skills: 1, Projects: 2 } as const;
export type SectionId = typeof SectionId[keyof typeof SectionId];

type Waypoint = { pos: THREE.Vector3; target: THREE.Vector3 };
type TweenState =
  | {
      t: number;
      dur: number;
      fromPos: THREE.Vector3;
      toPos: THREE.Vector3;
      fromTar: THREE.Vector3;
      toTar: THREE.Vector3;
    }
  | null;

type Options = {
  /** When true, section changes only move camera up/down (no zoom change). */
  verticalOnly?: boolean;
};

export class SectionManager {
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private ui: UIManager;

  private waypoints: Record<SectionId, Waypoint>;
  private tween: TweenState = null;
  private current: SectionId = SectionId.Hero;

  private verticalOnly: boolean;

  constructor(
    camera: THREE.PerspectiveCamera,
    controls: OrbitControls,
    ui: UIManager,
    opts: Options = {}
  ) {
    this.camera = camera;
    this.controls = controls;
    this.ui = ui;
    this.verticalOnly = opts.verticalOnly ?? true; // ← default ON

    // Safe defaults; can be overridden via configureFromObject()/setWaypoint()
    this.waypoints = {
      [SectionId.Hero]:     { pos: new THREE.Vector3(3, 1.5, 4), target: new THREE.Vector3(0, 1.0, 0) },
      [SectionId.Skills]:   { pos: new THREE.Vector3(3, 4.5, 4), target: new THREE.Vector3(0, 4.5, 0) },
      [SectionId.Projects]: { pos: new THREE.Vector3(3, 8.0, 4), target: new THREE.Vector3(0, 8.0, 0) },
    } as Record<SectionId, Waypoint>;
  }

  /** Toggle vertical-only elevator behavior at runtime. */
  public setVerticalOnly(on: boolean) { this.verticalOnly = on; }

  /**
   * Auto-config three waypoints (bottom/mid/top) to fit an object.
   * You can still keep verticalOnly=true so only Y changes on transitions.
   */
  public configureFromObject(
    object: THREE.Object3D,
    opts?: { padding?: number; bottomFrac?: number; midFrac?: number; topFrac?: number; }
  ) {
    const padding = opts?.padding ?? 1.12;
    const bottomFrac = THREE.MathUtils.clamp(opts?.bottomFrac ?? 0.28, 0, 1);
    const midFrac    = THREE.MathUtils.clamp(opts?.midFrac    ?? 0.50, 0, 1);
    const topFrac    = THREE.MathUtils.clamp(opts?.topFrac    ?? 0.78, 0, 1);

    const box = new THREE.Box3().setFromObject(object);
    if (!isFinite(box.min.x) || !isFinite(box.max.x)) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const height = size.y;

    // Compute a good distance using bounding sphere
    const radius = 0.5 * size.length();
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const distV = radius / Math.tan(vFov / 2);
    const distH = radius / Math.tan(hFov / 2);
    const dist = Math.max(distV, distH) * padding;

    // Horizontal viewing direction (no tilt)
    const dir = this.camera.position.clone().sub(this.controls.target as THREE.Vector3).setY(0);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.normalize();

    // Targets along height
    const yBottom = box.min.y + height * bottomFrac;
    const yMid    = box.min.y + height * midFrac;
    const yTop    = box.min.y + height * topFrac;

    const tBottom = new THREE.Vector3(center.x, yBottom, center.z);
    const tMid    = new THREE.Vector3(center.x, yMid,    center.z);
    const tTop    = new THREE.Vector3(center.x, yTop,    center.z);

    const pBottom = tBottom.clone().add(dir.clone().multiplyScalar(dist));
    const pMid    = tMid.clone().add(dir.clone().multiplyScalar(dist));
    const pTop    = tTop.clone().add(dir.clone().multiplyScalar(dist));

    this.waypoints[SectionId.Hero]     = { pos: pBottom, target: tBottom };
    this.waypoints[SectionId.Skills]   = { pos: pMid,    target: tMid };
    this.waypoints[SectionId.Projects] = { pos: pTop,    target: tTop };
  }

  /** Manually override a waypoint (used even if verticalOnly=true for the Y). */
  public setWaypoint(id: SectionId, pos: THREE.Vector3, target: THREE.Vector3) {
    this.waypoints[id] = { pos, target };
  }

  public getWaypoint(id: SectionId): Waypoint { return this.waypoints[id]; }
  public get currentSection(): SectionId { return this.current; }

  /**
   * Smoothly move camera to a section.
   * verticalOnly=true → keep current offset (distance + azimuth), only change Y.
   */
  public goTo(id: SectionId, durationSec = 1.2) {
    const wp = this.waypoints[id];
    if (!wp) return;
    if (id === this.current && !this.tween) return;

    this.controls.enabled = false;

    const fromPos = this.camera.position.clone();
    const fromTar = (this.controls.target as THREE.Vector3).clone();

    let toTar = wp.target.clone();
    let toPos: THREE.Vector3;

    if (this.verticalOnly) {
      // Lock XZ and distance. Only Y comes from the waypoint target.
      toTar.set(fromTar.x, wp.target.y, fromTar.z);

      const offset = fromPos.clone().sub(fromTar); // keep distance & azimuth
      toPos = toTar.clone().add(offset);
    } else {
      // Use full waypoint (classic mode).
      toTar = wp.target.clone();
      toPos = wp.pos.clone();
    }

    this.tween = {
      t: 0,
      dur: Math.max(0.01, durationSec),
      fromPos,
      toPos,
      fromTar,
      toTar,
    };

    this.current = id;
    this.ui.showSection(id);
  }

  /** Instant jump (no animation). Honors verticalOnly. */
  public snapTo(id: SectionId) {
    const wp = this.waypoints[id];
    if (!wp) return;

    const fromPos = this.camera.position;
    const fromTar = this.controls.target as THREE.Vector3;

    let toTar = wp.target.clone();
    let toPos: THREE.Vector3;

    if (this.verticalOnly) {
      toTar.set(fromTar.x, wp.target.y, fromTar.z);
      const offset = fromPos.clone().sub(fromTar);
      toPos = toTar.clone().add(offset);
    } else {
      toTar = wp.target.clone();
      toPos = wp.pos.clone();
    }

    this.tween = null;
    this.camera.position.copy(toPos);
    fromTar.copy(toTar);
    this.camera.lookAt(fromTar);
    this.controls.update();
    this.current = id;
    this.ui.showSection(id);
  }

  private easeInOutCubic(x: number) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  /** Call every frame with delta time (s). */
  public update(dt: number) {
    if (!this.tween) return;

    this.tween.t += dt;
    const k = Math.min(1, this.tween.t / this.tween.dur);
    const e = this.easeInOutCubic(k);

    this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, e);
    (this.controls.target as THREE.Vector3).lerpVectors(
      this.tween.fromTar,
      this.tween.toTar,
      e
    );
    this.camera.lookAt(this.controls.target);

    if (k >= 1) {
      this.tween = null;
      this.controls.enabled = true;
    }
  }
}
