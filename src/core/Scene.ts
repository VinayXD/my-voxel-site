// Scene.ts
import * as THREE from 'three';
import { PMREMGenerator } from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// ───────────────────────────────────────────────────────────────────────────────
// Layers: keep world (forest_house) on 0, hummingbird/UI overlay on 1
// Exported so other modules (e.g., main.ts, MouseFollower.ts) can reuse.
export const WORLD_LAYER = 0;
export const OVERLAY_LAYER = 1;
// ───────────────────────────────────────────────────────────────────────────────

// ⬇️ Neutral, no-shadow light rig (shadowless on purpose)
export function addLightRig(
  scene: THREE.Scene,
  opts?: {
    /** overall multiplier for the rig (default 1.0) */
    intensity?: number;
    /** warm up the key light slightly (default true) */
    warmKey?: boolean;
    /** also enable these lights on overlay layer (default: true) */
    lightOverlayLayer?: boolean;
  }
) {
  const s = opts?.intensity ?? 1.0;
  const lightOverlay = opts?.lightOverlayLayer ?? true;

  // Soft ambient from sky/ground so nothing is black
  const hemi = new THREE.HemisphereLight(0xfff2dc, 0xe6ded1, 0.75 * s);
  hemi.position.set(0, 1, 0);

  // Key light (no shadows)
  const key = new THREE.DirectionalLight(opts?.warmKey === false ? 0xffffff : 0xfff1e0, 1.1 * s);
  key.position.set(6, 8, 4);
  key.castShadow = false;

  // Fill from the opposite side (cooler & weaker)
  const fill = new THREE.DirectionalLight(0xe8f3ff, 0.55 * s);
  fill.position.set(-7, 3, -5);
  fill.castShadow = false;

  // Rim/back light to lift edges
  const rim = new THREE.DirectionalLight(0xffffff, 0.5 * s);
  rim.position.set(-3, 6, 7);
  rim.castShadow = false;

  // Enable lights for world layer; optionally also illuminate the overlay layer
  [hemi, key, fill, rim].forEach((l) => {
    l.layers.enable(WORLD_LAYER);
    if (lightOverlay) l.layers.enable(OVERLAY_LAYER);
  });

  const rig = new THREE.Group();
  rig.name = 'LightRig';
  rig.add(hemi, key, fill, rim);
  scene.add(rig);
  return rig;
}

export function createSceneAndRenderer(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = false; // consistent with the neutral rig

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x101317);

  // Gentle base light (kept minimal; HDRI/rig can dominate)
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(5, 8, 5);
  const amb = new THREE.AmbientLight(0xffffff, 0.15);

  // Make base lights affect both layers by default
  [key, amb].forEach((l) => {
    l.layers.enable(WORLD_LAYER);
    l.layers.enable(OVERLAY_LAYER);
  });

  scene.add(key, amb);

  return { scene, renderer };
}

export async function loadEnvironmentHDRI(scene: THREE.Scene, hdrPath: string, renderer?: THREE.WebGLRenderer) {
  // Prefer a provided renderer; fall back to a temporary one (rarely needed)
  const r = renderer ?? new THREE.WebGLRenderer();
  const pmrem = new PMREMGenerator(r);
  pmrem.compileEquirectangularShader();

  const hdrTex = await new RGBELoader().loadAsync(hdrPath);
  hdrTex.mapping = THREE.EquirectangularReflectionMapping;

  scene.environment = pmrem.fromEquirectangular(hdrTex).texture;
  // Keep background as color; if you want HDRI visible: scene.background = hdrTex;

  hdrTex.dispose();
  pmrem.dispose();
  if (!renderer) r.dispose();
}

/**
 * Load the forest house model on the WORLD layer (0).
 * Children are forced to WORLD layer as well to avoid any mixing with overlay content.
 */
export async function loadForestHouse(path: string): Promise<THREE.Group> {
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync(path);
  const root = (gltf.scene as THREE.Group) ?? new THREE.Group();
  root.layers.set(0);
root.traverse((o: THREE.Object3D) => o.layers.set(0));
  // ⬇️ Place the entire model explicitly on the WORLD layer
  root.layers.set(WORLD_LAYER);
  
  root.traverse((o: any) => {
    // layer discipline first
    (o as THREE.Object3D).layers.set(WORLD_LAYER);

    // material/shadow policy (shadowless, consistent with neutral rig)
    if (o.isMesh) {
      o.castShadow = false;     // no casting
      o.receiveShadow = false;  // no receiving
      // If you need double-sided or specific material tweaks, add here
    }
  });

  return root;
}
