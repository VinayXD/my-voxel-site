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
// If you currently <link> ui.css in index.html, you can keep it,
// but importing here is the Vite-friendly way (HMR etc):
// import './styles/ui.css';

async function bootstrap() {
  // 1) Get a real canvas (and recover if #app is not actually a <canvas>)
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

  // Make sure we see *something* even before assets finish loading
  const setSize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

  // 4) Camera HUD + Controls (safe even without a model)
  const camHud = new CameraIndicator({});
  const controls = createControls(camera, renderer.domElement);
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

  // 5) Background + basic light (so we immediately see the bg color)
  scene.background = new THREE.Color('#f5eddc');
  scene.environment = null;
  addLightRig(scene, { intensity: 1.3, warmKey: true });

  // 6) UI + Sections — can be built now; we’ll configure with the house later
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

  // 7) Minimal loop STARTS NOW (no awaits before this)
  const clock = new THREE.Clock();
  const onResize = () => ui.onResize(window.innerWidth, window.innerHeight);
  window.addEventListener('resize', onResize);
  onResize();

  (function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    sections.update(dt);
    follower.update(dt);
    ui.update(dt);
    controls.update();
    renderer.render(scene, camera);
    ui.render();
  })();

  // 8) Load assets *safely* in the background
  try {
    // House
    houseRoot = await loadForestHouse('/assets/forest_house.glb');
    scene.add(houseRoot);

    // Orientation + scale
    houseRoot.rotation.set(0, THREE.MathUtils.degToRad(110), 0);
    houseRoot.rotateY(THREE.MathUtils.degToRad(10));
    houseRoot.scale.multiplyScalar(1.5);
    const DESIRED_HEIGHT = 8.0;
    scaleObjectToHeight(houseRoot, DESIRED_HEIGHT);
    // addBoxHelper(houseRoot);

    // Sections that depend on the final bounds
    sections.configureFromObject(houseRoot, { padding: 1.08 });

    // Adjust hero stop
    {
      const dy = -2;
      const heroWP = sections.getWaypoint(SectionId.Hero);
      const newPos = heroWP.pos.clone().add(new THREE.Vector3(0, dy, 0));
      const newTar = heroWP.target.clone().add(new THREE.Vector3(0, dy, 0));
      sections.setWaypoint(SectionId.Hero, newPos, newTar);
    }

    // Raise projects stop
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

    await follower.applyUnlitTextureFromPNG('/assets/humming.png', {
      toneMapped: false,
      transparent: true,
      doubleSided: false,
      alphaTest: 0.0,
      anisotropy: 8,
    });

    // Final anchor over roof
    {
      const box = new THREE.Box3().setFromObject(houseRoot);
      const center = box.getCenter(new THREE.Vector3());
      const topY = box.max.y;
      const anchorOffset = 0.6;
      follower.setAnchor(new THREE.Vector3(center.x, topY + anchorOffset, center.z));
      follower.setBaseLength(0.6);
      follower.setRopeLimits(0.25, 2.0);
    }

  } catch (err) {
    console.error('Asset load failed:', err);
    // Visual fallback so you still see *something* if assets are missing
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
