// MouseFollower.ts (single-layer version: no layers used anywhere)
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * MouseFollower — camera-parallel plane; face-plane yaw + edge-inward yaw
 * - Plane is always parallel to camera (updated every frame).
 * - Baseline yaw follows camera yaw (faces the plane in front).
 * - Near screen edges, add a small inward yaw (around Y).
 *
 * SINGLE-LAYER MODE: this file does not set or rely on any layers.
 */

export class MouseFollower {
  // Scene graph
  public readonly B = new THREE.Object3D();
  public readonly C = new THREE.Object3D();
  public readonly visual: THREE.Group = new THREE.Group();

  private camera: THREE.PerspectiveCamera;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2(0, 0);
  private plane = new THREE.Plane(); // camera-parallel plane through B

  // Camera basis (updated each frame)
  private camForward = new THREE.Vector3();
  private camRight   = new THREE.Vector3();
  private camUp      = new THREE.Vector3();

  // Anchor B (world)
  private bPos = new THREE.Vector3();
  private bVel = new THREE.Vector3();

  // Mass C (world)
  private cPos = new THREE.Vector3();
  private cVel = new THREE.Vector3();

  // Mouse world points (A on plane)
  private aPrev = new THREE.Vector3();
  private aCurr = new THREE.Vector3();

  // Screen-space
  private pxPrev = new THREE.Vector2();
  private pxCurr = new THREE.Vector2();
  private pxSpeed = 0;       // px/s (smoothed)
  private pxTravelAccum = 0; // px since active began

  // Active / idle
  private lastActive = false;
  private idleTimer = 0;

  // Rope length (world)
  private ropeLength = 0.6;  // current
  private ropeTarget = 0.6;  // target
  private lenVel     = 0;    // d(length)/dt (world u/s)
  private baseLength = 0.6;  // default length to return to when idle
  private idleReturnRate = 0.9;

  // ---------------- Tunables ----------------
  // Anchor B follow spring
  private bStiff = 18.0;
  private bDamp  = 2 * Math.sqrt(18.0);

  // Mass C spring/damping + drag
  private cSpring = 26.0;
  private cDamp   = 3.4;
  private cAirDrag = 0.6;

  // Gravity (screen-down)
  private g = 9.8 * 0.25;

  // Length limits
  private minLen = 0.25;
  private maxLen = 2.0;

  // Pixel → world mapping
  private lengthPerPixel = 0.0025;

  // Length dynamics (smooth)
  private lenK = 30.0;
  private lenC = 2 * Math.sqrt(30.0);
  private extendRateGainPx  = 1.2;
  private retractRateGainPx = 1.6;

  // Speed smoothing & thresholds (px/s)
  private speedLerp = 0.25;
  private activeSpeedThresholdPx = 40;
  private idleGrace = 0.18; // seconds below threshold → idle

  // Soft constraint
  private constraintGain = 0.35;
  private constraintVelDamp = 0.6;

  // ---------------- HUMMINGBIRD IDLE ----------------
  private humSideAmp = 0.9;
  private humSideFreq = 9.0;
  private humBobAmp  = 0.12;
  private humBobFreq = 6.0;
  private humNoiseAmp = 0.15;
  private humRetargetInterval = 0.22;
  private humSidePhase = Math.random() * Math.PI * 2;
  private humBobPhase  = Math.random() * Math.PI * 2;
  private humNoiseTimer = 0;
  private humSideNoise = 0;
  private humSideNoiseTarget = 0;
  private humBobNoise = 0;
  private humBobNoiseTarget = 0;

  // Yaw behavior
  private yawSlerp = 0.28;            // blend toward target yaw
  private yawOffsetDeg = 0;           // model forward correction, if needed
  private edgeYawMaxDeg = 12;         // max extra inward yaw at edges
  private edgeStart = 0.55;           // |NDC| where inward yaw starts easing in
  private edgeEnd   = 0.95;           // |NDC| where inward yaw reaches max

  // --- Constraints ---
private groundY: number | null = null;       // absolute world Y; if set, C.y >= groundY
private groundEps = 1e-4;

private forwardLimit: number | null = null;  // max distance along camForward from B

  
  // Animation
  private mixer?: THREE.AnimationMixer;

  // Unlit helpers
  private originalMats = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;

    // Graph
    this.B.add(this.C);
    this.C.add(this.visual);

    // Basis & initial positions
    this.updateCameraBasis();
    const initialDrop = this.baseLength;
    this.cPos.copy(this.bPos).addScaledVector(this.camUp, -initialDrop);

    // Seed transforms
    this.ropeLength = this.baseLength;
    this.ropeTarget = this.baseLength;
    this.B.position.copy(this.bPos);
    this.C.position.copy(new THREE.Vector3().subVectors(this.cPos, this.bPos));

    // Seed A & pixels
    this.aPrev.copy(this.projectMouseToScreenPlane());
    this.aCurr.copy(this.aPrev);
    const w = window.innerWidth, h = window.innerHeight;
    this.pxPrev.set(w * (this.ndc.x + 1) * 0.5, h * (1 - (this.ndc.y + 1) * 0.5));
    this.pxCurr.copy(this.pxPrev);

    // Seed humming noise targets
    this.humSideNoiseTarget = (Math.random() * 2 - 1) * this.humNoiseAmp;
    this.humBobNoiseTarget  = (Math.random() * 2 - 1) * this.humNoiseAmp * 0.7;

    // Load model
    this.loadBird("/assets/Humming.glb", {
      scale: 0.03,
      rotate: { x: 0, y: 0, z: 0 },
      offset: new THREE.Vector3(0, 0, 0),
      clipName: undefined,
    });
  }

  public async applyUnlitTextureFromPNG(
    url: string,
    opts?: {
      toneMapped?: boolean;
      transparent?: boolean;
      doubleSided?: boolean;
      alphaTest?: number;
      anisotropy?: number;
    }
  ): Promise<void> {
    const toneMapped = opts?.toneMapped ?? false;
    const transparent = opts?.transparent ?? true;
    const doubleSided = opts?.doubleSided ?? false;
    const alphaTest   = opts?.alphaTest ?? 0.0;
    const anisotropy  = opts?.anisotropy ?? 4;

    const tex = await new THREE.TextureLoader().loadAsync(url);
    (tex as any).colorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;
    tex.anisotropy = anisotropy;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;

    this.visual.traverse((node: THREE.Object3D) => {
      const mesh = node as unknown as THREE.Mesh;
      if (!(mesh as any)?.isMesh) return;

      if (!this.originalMats.has(mesh)) {
        this.originalMats.set(mesh, mesh.material as THREE.Material | THREE.Material[]);
      }

      const makeBasic = (): THREE.MeshBasicMaterial => {
        return new THREE.MeshBasicMaterial({
          map: tex,
          transparent,
          side: doubleSided ? THREE.DoubleSide : THREE.FrontSide,
          alphaTest,
          depthTest: true,
          depthWrite: true,
          toneMapped,
          color: 0xffffff
        });
      };

      if (Array.isArray(mesh.material)) {
        mesh.material = (mesh.material as THREE.Material[]).map(() => makeBasic());
      } else {
        mesh.material = makeBasic();
      }
    });
  }

  /** Clamp the follower so it never goes below this absolute world Y. */
public setGroundY(y: number, eps = 1e-4) {
  this.groundY = y;
  this.groundEps = Math.max(0, eps);
}

/** Compute ground from a world-space bbox of an object (e.g., your house), plus an offset. */
public setGroundFromObject(root: THREE.Object3D, offset = 0) {
  // ensure world matrices are up to date
  root.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(root);
  if (!isFinite(box.min.y) || !isFinite(box.max.y)) {
    console.warn('[MouseFollower] setGroundFromObject: invalid bounds, skipping.');
    return;
  }
  this.setGroundY(box.min.y + offset);
  // optional: also keep the anchor above ground if needed
  if (this.bPos.y < (this.groundY ?? -Infinity)) {
    this.bPos.y = this.groundY!;
    this.B.position.y = this.groundY!;
  }
}

/**
 * Limit forward motion along the current view direction.
 * "Forward" is the camera's camForward (from the current frame) relative to the anchor B.
 * If rel•camForward > maxDist, we project the follower back onto that plane
 * and zero its forward velocity so it slides only in the perpendicular 2D plane.
 */
public setForwardLimit(maxDist: number | null) {
  this.forwardLimit = (maxDist == null) ? null : Math.max(0, maxDist);
}


  public restoreOriginalMaterials(): void {
    this.visual.traverse((node: THREE.Object3D) => {
      const mesh = node as unknown as THREE.Mesh;
      if (!(mesh as any)?.isMesh) return;
      const orig = this.originalMats.get(mesh);
      if (orig) mesh.material = orig;
    });
    this.originalMats = new WeakMap();
  }

  /** Listen for pointer moves (no button required). */
  attachPointerListeners(el: HTMLElement | Window) {
    const onMove = (e: PointerEvent | MouseEvent) => {
      const w = window.innerWidth, h = window.innerHeight;
      this.ndc.x = (e.clientX / w) * 2 - 1;
      this.ndc.y = -(e.clientY / h) * 2 + 1;
      this.pxCurr.set(e.clientX, e.clientY);
    };
    el.addEventListener("pointermove", onMove as any, { passive: true });
  }

  // ---------------- Public knobs & helpers ----------------
  setBaseLength(len: number) {
    this.baseLength = THREE.MathUtils.clamp(len, this.minLen, this.maxLen);
  }
  setIdleReturnRate(rate: number) { this.idleReturnRate = Math.max(0, rate); }

  setRopeLimits(minLen: number, maxLen: number) {
    this.minLen = Math.max(0.01, Math.min(minLen, maxLen));
    this.maxLen = Math.max(this.minLen + 0.01, maxLen);
    this.baseLength = THREE.MathUtils.clamp(this.baseLength, this.minLen, this.maxLen);
    this.ropeLength = THREE.MathUtils.clamp(this.ropeLength, this.minLen, this.maxLen);
    this.ropeTarget = THREE.MathUtils.clamp(this.ropeTarget, this.minLen, this.maxLen);
  }
  setFollowStiffness(k: number) { this.bStiff = k; this.bDamp = 2 * Math.sqrt(Math.max(1e-6, k)); }
  setSpring(k: number) { this.cSpring = k; }
  setDamping(d: number) { this.cDamp = d; }
  setGravity(g: number) { this.g = g; }
  setPixelToWorld(lengthPerPixel: number) { this.lengthPerPixel = Math.max(0, lengthPerPixel); }
  setLengthRateGains(extendGainPx: number, retractGainPx: number) { this.extendRateGainPx = extendGainPx; this.retractRateGainPx = retractGainPx; }
  setLengthDynamics(k: number, damping?: number) { this.lenK = k; this.lenC = damping ?? 2 * Math.sqrt(Math.max(1e-6, k)); }
  setConstraint(hardness: number, velDamp?: number) { this.constraintGain = THREE.MathUtils.clamp(hardness, 0, 1); if (velDamp !== undefined) this.constraintVelDamp = velDamp; }
  setYawSmoothing(slerp: number) { this.yawSlerp = THREE.MathUtils.clamp(slerp, 0, 1); }
  setYawOffset(deg: number) { this.yawOffsetDeg = deg; }
  setEdgeYaw(maxDeg: number, startNdc = 0.55, endNdc = 0.95) {
    this.edgeYawMaxDeg = maxDeg;
    this.edgeStart = Math.max(0, Math.min(startNdc, endNdc - 1e-3));
    this.edgeEnd   = Math.min(1, Math.max(endNdc, this.edgeStart + 1e-3));
  }

  /** Current rope length (world units). */
  getRopeLength(): number { return this.ropeLength; }

  setRopeTarget(len: number): void {
    const L = THREE.MathUtils.clamp(len, this.minLen, this.maxLen);
    this.ropeTarget = L;
    this.pxTravelAccum = Math.max(0, (L - this.baseLength) / this.lengthPerPixel);
  }

  setRopeLengthImmediate(len: number): void {
    const L = THREE.MathUtils.clamp(len, this.minLen, this.maxLen);
    this.ropeTarget = L;
    this.ropeLength = L;
    this.lenVel = 0;
    this.pxTravelAccum = Math.max(0, (L - this.baseLength) / this.lengthPerPixel);
  }

  nudgeRopeLength(delta: number, immediate = false): void {
    const L = THREE.MathUtils.clamp(this.ropeLength + delta, this.minLen, this.maxLen);
    immediate ? this.setRopeLengthImmediate(L) : this.setRopeTarget(L);
  }

  // ---------------- Per-frame update ----------------
  public update(dt: number) {
    dt = Math.min(dt, 1 / 30); // stability clamp

    // 0) Update camera basis & keep plane parallel to camera, through B
    this.updateCameraBasis();

    // 1) Mouse -> plane
    this.aCurr.copy(this.projectMouseToScreenPlane());

    // 2) Activity detection
    const pxDist = this.pxCurr.distanceTo(this.pxPrev);
    const instPxSpeed = pxDist / Math.max(dt, 1e-6);
    this.pxSpeed = THREE.MathUtils.lerp(this.pxSpeed, instPxSpeed, this.speedLerp);
    const isActive = this.pxSpeed > this.activeSpeedThresholdPx;
    if (isActive) {
      if (!this.lastActive) this.pxTravelAccum = 0;
      this.pxTravelAccum += pxDist;
      this.idleTimer = 0;
    } else {
      this.idleTimer += dt;
    }
    const isIdle = this.idleTimer >= this.idleGrace;

    // 3) Anchor B follows A
    const bToA = new THREE.Vector3().subVectors(this.aCurr, this.bPos);
    const bAcc = bToA.multiplyScalar(this.bStiff).addScaledVector(this.bVel, -this.bDamp);
    this.bVel.addScaledVector(bAcc, dt);
    this.bPos.addScaledVector(this.bVel, dt);
    this.B.position.copy(this.bPos);

    // 4) Rope length target & dynamics
    if (isActive) {
      this.ropeTarget = THREE.MathUtils.clamp(
        this.baseLength + this.pxTravelAccum * this.lengthPerPixel,
        this.minLen, this.maxLen
      );

      const lenErr = this.ropeTarget - this.ropeLength;
      const lenAcc = this.lenK * lenErr - this.lenC * this.lenVel;
      let newLenVel = this.lenVel + lenAcc * dt;

      const maxLenRate = (lenErr >= 0 ? this.extendRateGainPx : this.retractRateGainPx)
                       * this.lengthPerPixel * this.pxSpeed;
      newLenVel = THREE.MathUtils.clamp(newLenVel, -Math.max(0, maxLenRate), Math.max(0, maxLenRate));

      this.lenVel = newLenVel;
      this.ropeLength = THREE.MathUtils.clamp(this.ropeLength + this.lenVel * dt, this.minLen, this.maxLen);
    } else if (isIdle) {
      this.ropeTarget = this.baseLength;

      const lenErr = this.ropeTarget - this.ropeLength;
      const lenAcc = this.lenK * lenErr - this.lenC * this.lenVel;
      let newLenVel = this.lenVel + lenAcc * dt;
      newLenVel = THREE.MathUtils.clamp(newLenVel, -this.idleReturnRate, this.idleReturnRate);
      this.lenVel = newLenVel;
      this.ropeLength = THREE.MathUtils.clamp(this.ropeLength + this.lenVel * dt, this.minLen, this.maxLen);

      this.pxTravelAccum = 0;

      // idle humming noise
      this.humNoiseTimer += dt;
      if (this.humNoiseTimer >= this.humRetargetInterval) {
        this.humNoiseTimer = 0;
        this.humSideNoiseTarget = (Math.random() * 2 - 1) * this.humNoiseAmp;
        this.humBobNoiseTarget  = (Math.random() * 2 - 1) * this.humNoiseAmp * 0.7;
      }
      this.humSideNoise = THREE.MathUtils.damp(this.humSideNoise, this.humSideNoiseTarget, 6.0, dt);
      this.humBobNoise  = THREE.MathUtils.damp(this.humBobNoise,  this.humBobNoiseTarget,  6.0, dt);
    } else {
      // grace period
      this.ropeLength = THREE.MathUtils.clamp(this.ropeLength + this.lenVel * dt, this.minLen, this.maxLen);
    }

    // 5) Physics for C (in plane), gravity = −camUp
    const rel = new THREE.Vector3().subVectors(this.cPos, this.bPos);
    let rLen = rel.length();
    if (rLen < 1e-6) { rel.copy(this.camUp).multiplyScalar(-1); rLen = 1; }

    let desiredRel: THREE.Vector3;
    if (isIdle) {
      // humming micro motion
      this.humSidePhase += this.humSideFreq * dt * Math.PI * 2;
      this.humBobPhase  += this.humBobFreq  * dt * Math.PI * 2;

      const s = this.humSideAmp * Math.sin(this.humSidePhase) + this.humSideNoise;
      const b = this.humBobAmp  * Math.sin(this.humBobPhase)  + this.humBobNoise;

      const baseDown = this.camUp.clone().multiplyScalar(-1);
      const dirRaw = new THREE.Vector3()
        .addScaledVector(baseDown, 1 - b)
        .addScaledVector(this.camRight, s)
        .addScaledVector(this.camUp, b);
      const dir = dirRaw.normalize();

      desiredRel = dir.multiplyScalar(this.ropeLength);
    } else {
      const dir = rel.clone().multiplyScalar(1 / rLen);
      desiredRel = dir.multiplyScalar(this.ropeLength);
    }

    const springForce = new THREE.Vector3().subVectors(desiredRel, rel).multiplyScalar(this.cSpring);
    const relVel = new THREE.Vector3().subVectors(this.cVel, this.bVel);
    const dampingForce = relVel.multiplyScalar(-this.cDamp);
    const gravity = this.camUp.clone().multiplyScalar(-this.g);
    const airDrag = this.cVel.clone().multiplyScalar(-this.cAirDrag);

    const acc = new THREE.Vector3()
      .add(springForce)
      .add(dampingForce)
      .add(gravity)
      .add(airDrag);

    // Integrate C
    this.cVel.addScaledVector(acc, dt);
    this.cPos.addScaledVector(this.cVel, dt);

    // Keep C in plane & enforce rope softly
    this.plane.setFromNormalAndCoplanarPoint(this.camForward, this.bPos).normalize();
    this.plane.projectPoint(this.cPos, this.cPos);

    const r = new THREE.Vector3().subVectors(this.cPos, this.bPos);
    const rLenNow = r.length();
    if (rLenNow > 1e-6) {
      const rHat = r.multiplyScalar(1 / rLenNow);
      const diff = rLenNow - this.ropeLength;
      const corr = -diff * this.constraintGain;
      this.cPos.addScaledVector(rHat, corr);

      const vRad = this.cVel.dot(rHat);
      this.cVel.addScaledVector(rHat, -vRad * this.constraintVelDamp);
      const vOff = this.camForward.dot(this.cVel);
      this.cVel.addScaledVector(this.camForward, -vOff);
    } else {
      this.cPos.copy(this.bPos).addScaledVector(this.camUp, -this.ropeLength);
    }

    // ---------------- Hard constraints ----------------

// (A) Forward leash: limit along camera forward from anchor B
if (this.forwardLimit != null) {
  // rel = C - B
  const rel = new THREE.Vector3().subVectors(this.cPos, this.bPos);
  const s = rel.dot(this.camForward); // signed distance along camForward

  if (s > this.forwardLimit) {
    const excess = s - this.forwardLimit;

    // Project position back onto the plane at s = forwardLimit
    this.cPos.addScaledVector(this.camForward, -excess);

    // Remove forward velocity so motion becomes 2D within that plane
    const vF = this.cVel.dot(this.camForward);
    if (vF > 0) this.cVel.addScaledVector(this.camForward, -vF);
  }
}

// (B) Ground clamp: don't go below house base (+offset)
if (this.groundY != null && this.cPos.y < this.groundY - this.groundEps) {
  this.cPos.y = this.groundY;
  if (this.cVel.y < 0) this.cVel.y = 0; // kill downward velocity on impact
}

    // Apply local transform
    this.C.position.copy(new THREE.Vector3().subVectors(this.cPos, this.bPos));

    // --- YAW: face the plane in front (camera yaw), plus slight inward yaw near edges ---
    // Base yaw = camera yaw (camForward projected to XZ).
    const camYaw = Math.atan2(this.camForward.x, this.camForward.z) + THREE.MathUtils.degToRad(this.yawOffsetDeg);

    // Inward yaw: depends on how close C is to left/right edges (NDC x).
    const ndcC = this.worldToNdc(this.cPos);
    const ax = Math.abs(ndcC.x);
    let t = 0;
    if (ax > this.edgeStart) {
      // smoothstep from edgeStart..edgeEnd
      const u = THREE.MathUtils.clamp((ax - this.edgeStart) / Math.max(1e-6, this.edgeEnd - this.edgeStart), 0, 1);
      t = u * u * (3 - 2 * u); // smoothstep
    }
    const inwardSign = (ndcC.x > 0) ? -1 : (ndcC.x < 0 ? +1 : 0); // right => yaw left, left => yaw right
    const inwardYaw = THREE.MathUtils.degToRad(this.edgeYawMaxDeg) * t * inwardSign;

    const targetYaw = camYaw + inwardYaw;
    const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, targetYaw, 0));

    // Smoothly blend C’s rotation toward the target yaw
    this.C.quaternion.slerp(targetQ, this.yawSlerp);

    // Animation
    if (this.mixer) this.mixer.update(dt);

    // Book-keeping
    this.aPrev.copy(this.aCurr);
    this.pxPrev.copy(this.pxCurr);
    this.lastActive = isActive;
  }

  // ---------------- Internals ----------------

  private loadBird(
    url: string,
    opts: {
      scale?: number;
      rotate?: { x?: number; y?: number; z?: number }; // degrees
      offset?: THREE.Vector3;
      clipName?: string;
    } = {}
  ): void {
    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.visual.clear();

        const model = gltf.scene || new THREE.Group();
        model.traverse((o: any) => {
          if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; }
        });

        // SINGLE-LAYER: do not set any layers here
        model.scale.setScalar(opts.scale ?? 0.35);
        if (opts.rotate) {
          const rx = THREE.MathUtils.degToRad(opts.rotate.x ?? 0);
          const ry = THREE.MathUtils.degToRad(opts.rotate.y ?? 0);
          const rz = THREE.MathUtils.degToRad(opts.rotate.z ?? 0);
          model.rotation.set(rx, ry, rz);
        }
        if (opts.offset) model.position.copy(opts.offset);

        this.visual.add(model);

        if (gltf.animations && gltf.animations.length) {
          this.mixer = new THREE.AnimationMixer(model);
          const clip =
            (opts.clipName && gltf.animations.find(c => c.name === opts.clipName)) ||
            gltf.animations[0];
          const action = this.mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.clampWhenFinished = false;
          action.enabled = true;
          action.play();
        } else {
          console.warn("[GLB] No animations found in the GLB.");
        }
      },
      undefined,
      (err) => console.error("Failed to load hummingbird:", err)
    );
  }

  /** Place the anchor B in world space (optionally resets rope state). */
  public setAnchor(pos: THREE.Vector3, resetRope = true) {
    this.bPos.copy(pos);
    this.B.position.copy(this.bPos);
    if (resetRope) {
      this.updateCameraBasis();
      this.cVel.set(0,0,0);
      this.bVel.set(0,0,0);
      this.cPos.copy(this.bPos).addScaledVector(this.camUp, -this.ropeLength);
      this.C.position.copy(new THREE.Vector3().subVectors(this.cPos, this.bPos));
    }
  }

  private updateCameraBasis() {
    this.camera.updateMatrixWorld(true);
    this.camRight.setFromMatrixColumn(this.camera.matrixWorld, 0).normalize();
    this.camUp.setFromMatrixColumn(this.camera.matrixWorld, 1).normalize();
    this.camForward.setFromMatrixColumn(this.camera.matrixWorld, 2).normalize().multiplyScalar(-1);
  }

  /** Intersect current pointer ray with the screen-parallel plane (through B). */
  private projectMouseToScreenPlane(): THREE.Vector3 {
    const out = new THREE.Vector3();
    this.plane.setFromNormalAndCoplanarPoint(this.camForward, this.bPos).normalize();
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.raycaster.ray.intersectPlane(this.plane, out);
    if (!Number.isFinite(out.x)) out.copy(this.bPos);
    return out;
  }

  /** Convert a world point to NDC (x,y in −1..+1). */
  private worldToNdc(p: THREE.Vector3): { x: number; y: number } {
    const v = p.clone().project(this.camera);
    return { x: v.x, y: v.y };
  }

  /**
   * Draw the bird “on top” without relying on layers.
   * This uses depthTest/depthWrite + renderOrder only.
   */
  public setOverlayOnTop(on = true) {
    this.visual.traverse((node: THREE.Object3D) => {
      const mesh = node as any;
      if (!mesh?.isMesh) return;
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const m of mats) {
        if (!m) continue;
        m.depthTest  = !on ? true : false;
        m.depthWrite = !on ? true : false;
        m.needsUpdate = true;
      }
      mesh.renderOrder = on ? 9999 : 0;
    });
  }
}
