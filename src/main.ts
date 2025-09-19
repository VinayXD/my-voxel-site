// src/main.ts
import * as THREE from 'three';
import { createSceneAndRenderer, loadForestHouse, addLightRig } from './core/Scene';
import { CameraRig } from './core/CameraRig';
import { createControls, applyControlsLimits } from './core/Controls';
import { SectionManager, SectionId } from './systems/SectionManager';
import { UIManager } from './systems/UIManager';
import { scaleObjectToHeight /*, addBoxHelper*/ } from './utils/sizeTools';
import { MouseFollower } from './systems/MouseFollower';
import { CameraIndicator } from './ui/CameraIndicator';

// Asset URLs (Vite will rewrite these for GitHub Pages)
import houseUrl from '/assets/forest_house.glb?url';
import hummingUrl from '/assets/humming.png?url';

async function bootstrap() {
  // 1) Canvas (recover if #app isn't a <canvas>)
  const el = document.getElementById('app');
  const canvas =
    el instanceof HTMLCanvasElement
      ? el
      : (() => {
          const c = document.createElement('canvas');
          c.id = 'app';
          document.body.appendChild(c);
          return c;
        })();

  // 2) Scene + renderer
  const { scene, renderer } = createSceneAndRenderer(canvas);

  // ---- Renderer perf choices (can be overridden in createSceneAndRenderer too) ----
  // Shadows off unless you truly need them:
  renderer.shadowMap.enabled = false;
  // Tone mapping / color space are good defaults:
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // Adaptive DPR setup
  const DPR_MAX = Math.min(window.devicePixelRatio, 1.6);
  const DPR_MIN = 0.75;
  let adaptiveDPR = DPR_MAX;

  const setSize = () => {
    renderer.setPixelRatio(adaptiveDPR);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };
  setSize();
  window.addEventListener('resize', setSize);

  // 3) Camera rig
  const cameraRig = new CameraRig({
    fov: 40,
    near: 0.05,
    far: 1000,
    initialPosition: new THREE.Vector3(4, 2, 6),
    lookAt: new THREE.Vector3(0, 1.2, 0),
  });
  const camera = cameraRig.camera;

  // 4) HUD + Controls
  const camHud = new CameraIndicator({});
  const controls = createControls(camera, renderer.domElement);
  controls.enableDamping = true; // smoother + cheaper
  controls.addEventListener('change', () => camHud.syncFromCamera(camera, controls.target));
  applyControlsLimits(controls, {
    minDistance: 2.2,
    maxDistance: 9,
    minPolarDeg: 65,
    maxPolarDeg: 80,
    minAzimuthDeg: -60,
    maxAzimuthDeg: 60,
    enablePan: false,
    enableZoom: true,
  });
  controls.minDistance = 0.4;

  // 5) Background + basic light
  scene.background = new THREE.Color('#f5eddc');
  scene.environment = null;
  addLightRig(scene, { intensity: 1.1, warmKey: true }); // slightly lower

  // 6) UI + Sections
  const ui = new UIManager(scene, camera);
  const sections = new SectionManager(camera, controls, ui);

  ui.buildHUD({
    onHero: () => sections.goTo(SectionId.Hero),
    onSkills: () => sections.goTo(SectionId.Skills),
    onProjects: () => sections.goTo(SectionId.Projects),
  });

  ui.buildPanels({
    heroAt:     new THREE.Vector3(-1.0, 1.8,  3.0),
    skillsAt:   new THREE.Vector3( 2.0, 4.8,  1.0),
    projectsAt: new THREE.Vector3( 0.0, 8.2,  2.8),
  });

  // Keep these so the loop compiles before assets
  let houseRoot: THREE.Object3D | null = null;
  const follower = new MouseFollower(camera);

  // 7) Loop (start immediately)
  const clock = new THREE.Clock();
  const onResize = () => ui.onResize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onResize);
  onResize();

  // Pause rendering when the tab is hidden
  let paused = false;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  // Adaptive DPR controller
  let accum = 0, samples = 0;
  const TARGET_FPS = 60;

  function updateAdaptiveDPR(dt: number) {
    accum += dt; samples++;
    if (accum >= 1.0) {
      const fps = samples / accum;
      // downscale fast if too slow, upscale gently if we have headroom
      if (fps < TARGET_FPS - 8 && adaptiveDPR > DPR_MIN) {
        adaptiveDPR = Math.max(DPR_MIN, adaptiveDPR - 0.12);
        setSize();
      } else if (fps > TARGET_FPS + 5 && adaptiveDPR < DPR_MAX) {
        adaptiveDPR = Math.min(DPR_MAX, adaptiveDPR + 0.06);
        setSize();
      }
      accum = 0; samples = 0;
    }
  }

  (function animate() {
    requestAnimationFrame(animate);
    if (paused) return;

    const dt = clock.getDelta();
    updateAdaptiveDPR(dt);

    sections.update(dt);   // keep light; avoid heavy per-frame traversals inside
    follower.update(dt);
    ui.update(dt);
    controls.update();     // enableDamping=true needs this

    renderer.render(scene, camera);
    ui.render();
  })();

  // 8) Load assets *safely* in the background
  try {
    // House
    houseRoot = await loadForestHouse(houseUrl);
    scene.add(houseRoot);

    // Orientation + scale
    houseRoot.rotation.set(0, THREE.MathUtils.degToRad(110), 0);
    houseRoot.rotateY(THREE.MathUtils.degToRad(10));
    houseRoot.scale.multiplyScalar(1.5);
    const DESIRED_HEIGHT = 8.0;
    scaleObjectToHeight(houseRoot, DESIRED_HEIGHT);

    // Cull & simplify materials for perf
    houseRoot.traverse((o: any) => {
      if (o.isMesh) {
        o.frustumCulled = true;
        o.castShadow = false;
        o.receiveShadow = false;
        const m = o.material;
        if (m) {
          // Drop costly toggles if present
          if ('transparent' in m && m.transparent) {
            m.depthWrite = false;
          }
          if ('skinning' in m) m.skinning = false;
          if ('morphTargets' in m) m.morphTargets = false;
          if ('toneMapped' in m) m.toneMapped = true;
        }
      }
    });

    // Sections that depend on bounds
    sections.configureFromObject(houseRoot, { padding: 1.08 });

    // Adjust waypoints
    {
      const dy = -2;
      const heroWP = sections.getWaypoint(SectionId.Hero);
      sections.setWaypoint(
        SectionId.Hero,
        heroWP.pos.clone().add(new THREE.Vector3(0, dy, 0)),
        heroWP.target.clone().add(new THREE.Vector3(0, dy, 0))
      );
    }
    {
      const upDy = 1;
      const wp = sections.getWaypoint(SectionId.Projects);
      sections.setWaypoint(
        SectionId.Projects,
        wp.pos.clone().add(new THREE.Vector3(0, upDy, 0)),
        wp.target.clone().add(new THREE.Vector3(0, upDy, 0))
      );
    }

    // Start at Hero
    sections.snapTo(SectionId.Hero);

    // Mouse follower (depends on house bounds)
    scene.add(follower.B);
    follower.attachPointerListeners(window);

    follower.setGroundFromObject(houseRoot, 0.45);
    follower.setForwardLimit(0.2);

    const houseBox = new THREE.Box3().setFromObject(houseRoot);
    const c = houseBox.getCenter(new THREE.Vector3());
    const top = houseBox.max.y;

    follower.setAnchor(new THREE.Vector3(c.x, top + 0.6, c.z), true);
    follower.setOverlayOnTop(false);

    const bbox = new THREE.Box3().setFromObject(houseRoot);
    const mid  = bbox.getCenter(new THREE.Vector3());
    follower.setAnchor(new THREE.Vector3(mid.x, mid.y, mid.z));
    follower.setRopeLengthImmediate(0.12);
    follower.B.traverse((o: THREE.Object3D) => o.layers.set(1));

    await follower.applyUnlitTextureFromPNG(hummingUrl, {
      toneMapped: false,
      transparent: true,
      doubleSided: false,
      alphaTest: 0.0,
      anisotropy: 4, // slightly lower = cheaper
    });

    // Final anchor over roof
    {
      const box = new THREE.Box3().setFromObject(houseRoot);
      const center = box.getCenter(new THREE.Vector3());
      const topY = box.max.y;
      follower.setAnchor(new THREE.Vector3(center.x, topY + 0.6, center.z));
      follower.setBaseLength(0.6);
      follower.setRopeLimits(0.25, 2.0);
    }

  } catch (err) {
    console.error('Asset load failed:', err);
    // Fallback so you still see *something*
    const fallback = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x66ccff, roughness: 0.9 })
    );
    scene.add(fallback);
  }

  // 9) Expose for debugging
  Object.assign(window as any, {
    scene, camera, controls, sections, ui, follower,
    rotL: () => { if (!houseRoot) return; houseRoot.rotateY(THREE.MathUtils.degToRad(-10)); sections.configureFromObject(houseRoot, { padding: 1.08 }); },
    rotR: () => { if (!houseRoot) return; houseRoot.rotateY(THREE.MathUtils.degToRad( 10)); sections.configureFromObject(houseRoot, { padding: 1.08 }); },
    grow: () => { if (!houseRoot) return; houseRoot.scale.multiplyScalar(1.1); houseRoot.updateMatrixWorld(true); sections.configureFromObject(houseRoot, { padding: 1.08 }); },
    shrink:() => { if (!houseRoot) return; houseRoot.scale.multiplyScalar(0.9); houseRoot.updateMatrixWorld(true); sections.configureFromObject(houseRoot, { padding: 1.08 }); },
  });
}

bootstrap();
