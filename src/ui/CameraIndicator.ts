// src/ui/CameraIndicator.ts
import * as THREE from 'three';

type Vec3 = THREE.Vector3;

export type CameraIndicatorOpts = {
  width?: number;
  height?: number;
  offsetLeft?: number;
  offsetBottom?: number;
  arcSpanDeg?: number;
  arcY?: number;
  houseScale?: number;
  minArcRadius?: number;
  maxArcRadius?: number;
  minWorldDist?: number;
  maxWorldDist?: number;
  lerpFactor?: number;
  colorArc?: number;
  colorHouse?: number;        // (fill)
  colorHouseOutline?: number; // (edges)
  colorCamera?: number;
  framePadding?: number;      // margin around content when fitting (1 = none)
  // Hint UI
  hintText?: string;
  showHint?: boolean;
  hintColor?: string;         // plain text color
  // Arc/Camera tilt so they’re not edge-on
  orbitTiltX?: number;        // radians (positive = tilt “downwards” toward viewer)
  orbitTiltY?: number;        // radians
  mount?: HTMLElement;
};

export class CameraIndicator {
  private opts!: Required<CameraIndicatorOpts>;
  private wrapper!: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private hudCam!: THREE.PerspectiveCamera;

  private content!: THREE.Group;     // wraps house + orbitGroup
  private orbitGroup!: THREE.Group;  // wraps arc + cam (tilted as a unit)
  private arcGroup?: THREE.Group;    // for clean arc rebuilds

  private arcRadiusTarget!: number;
  private arcSpanRad!: number;
  private arcStart!: number;
  private arcEnd!: number;

  private house!: THREE.Object3D;
  private camMarker!: THREE.Object3D;

  private yawTarget = 0;
  private yawVisual = 0;
  private rafId = 0;
  private disposed = false;

  private _arcRadiusNow!: number;

  private hintEl?: HTMLDivElement;

  constructor(userOpts: CameraIndicatorOpts = {}) {
    // defaults
    this.opts = {
      width: 220,
      height: 170,
      offsetLeft: 16,
      offsetBottom: 16,
      arcSpanDeg: 140,
      arcY: 0,
      houseScale: 0.6,
      minArcRadius: 0.65,
      maxArcRadius: 1.15,
      minWorldDist: 2.0,
      maxWorldDist: 12.0,
      lerpFactor: 0.18,
      colorArc: 0x7df8ff,
      colorHouse: 0x0af038,
      colorHouseOutline: 0xcfa5e3,
      colorCamera: 0xcfa5e3,
      framePadding: 1.18,                 // breathing room in the HUD
      // Hint (plain text)
      hintText: ' LEFT-CLICK & DRAG ',
      showHint: true,
      hintColor: 'rgba(0, 0, 0, 1)',
      // Flip the default so arc looks the “other way around”
      orbitTiltX:  +0.22,                 // was negative; positive pitches it the other way
      orbitTiltY:  0.12,
      mount: document.body,
      ...userOpts,
    };

    this.arcSpanRad = THREE.MathUtils.degToRad(this.opts.arcSpanDeg);
    this.arcRadiusTarget = this.opts.minArcRadius;
    this._arcRadiusNow = this.opts.minArcRadius;

    // DOM wrapper (transparent)
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'cam-indicator';
    const s = this.wrapper.style;
    s.position = 'fixed';
    s.left = `${this.opts.offsetLeft}px`;
    s.bottom = `${this.opts.offsetBottom}px`;
    s.width = `${this.opts.width}px`;
    s.height = `${this.opts.height}px`;
    s.pointerEvents = 'none';
    s.borderRadius = '14px';
    s.overflow = 'hidden';
    s.background = 'transparent';
    s.boxShadow = 'none';
    s.backdropFilter = '';
    // ts-expect-error vendor prop
    (s as any).webkitBackdropFilter = '';
    s.border = 'none';
    (this.opts.mount || document.body).appendChild(this.wrapper);

    // renderer
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.opts.width, this.opts.height, false);
    this.renderer.setClearColor(0x000000, 0);
    this.wrapper.appendChild(this.renderer.domElement);

    // hint (plain text, no background)
    this.createHint();

    // scene + camera
    this.scene = new THREE.Scene();
    this.hudCam = new THREE.PerspectiveCamera(
      35,
      this.opts.width / this.opts.height,
      0.01,
      50
    );
    this.hudCam.position.set(0, 0.8, 3.1);
    this.hudCam.lookAt(0, 0.2, 0);

    // groups
    this.content = new THREE.Group();
    this.scene.add(this.content);

    this.orbitGroup = new THREE.Group();
    this.orbitGroup.rotation.set(this.opts.orbitTiltX, this.opts.orbitTiltY, 0);
    this.content.add(this.orbitGroup);

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.55);
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.65);
    dir1.position.set(1.2, 1.8, 1.0);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.25);
    dir2.position.set(-1.2, 0.6, -1.0);
    this.scene.add(amb, dir1, dir2);

    // build
    this.buildHouse();                   // added to content (not tilted)
    this.buildArc(this.arcRadiusTarget); // added to orbitGroup (tilted)
    this.buildCameraMarker();            // added to orbitGroup (tilted)

    // initial layout & hint placement
    this.layoutHUD();
    this.updateHintPosition();

    // animate
    this.loop = this.loop.bind(this);
    this.rafId = requestAnimationFrame(this.loop);

    new ResizeObserver(() => { this.onResize(); }).observe(this.wrapper);
  }

  // ---------- Public API ----------
  syncFromCamera(camera: THREE.Camera, target: Vec3 = new THREE.Vector3(0, 0, 0)) {
    if (!(camera as any).position) return;
    const camPos = (camera as any).position as THREE.Vector3;
    const offset = new THREE.Vector3().subVectors(camPos, target);
    const yaw = Math.atan2(offset.x, offset.z);
    this.setYaw(yaw);
    const dist = offset.length();
    this.setDistance(dist);
  }

  setYaw(yawRad: number) {
    const half = this.arcSpanRad * 0.5;
    this.yawTarget = THREE.MathUtils.clamp(yawRad, -half, half);
  }

  setDistance(worldDistance: number) {
    const t = THREE.MathUtils.clamp(
      (worldDistance - this.opts.minWorldDist) /
        (this.opts.maxWorldDist - this.opts.minWorldDist),
      0, 1
    );
    this.arcRadiusTarget = THREE.MathUtils.lerp(
      this.opts.minArcRadius,
      this.opts.maxArcRadius,
      t
    );
  }

  public setHintVisible(visible: boolean) {
    if (!this.hintEl) return;
    this.hintEl.style.display = visible ? '' : 'none';
  }

  public setHintText(text: string) {
    this.opts.hintText = text;
    if (this.hintEl) this.hintEl.textContent = text;
    this.updateHintPosition();
  }

  // ---------- Lifecycle ----------
  dispose() {
    if (this.disposed) return;
    cancelAnimationFrame(this.rafId);
    this.hintEl?.remove();
    this.wrapper.remove();
    this.disposed = true;
    this.scene.traverse(obj => {
      if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose?.();
      const mat = (obj as THREE.Mesh).material as any;
      if (mat?.dispose) mat.dispose();
    });
    this.renderer.dispose();
  }

  private onResize() {
    const rect = this.wrapper.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height, false);
    this.hudCam.aspect = rect.width / rect.height;
    this.hudCam.updateProjectionMatrix();
    this.layoutHUD();
    this.updateHintPosition();
  }

  // --- Auto-fit the content inside the HUD camera frustum ---
  private layoutHUD() {
    const box = new THREE.Box3().setFromObject(this.content);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const rect = this.wrapper.getBoundingClientRect();
    const aspect = rect.width / rect.height;

    const vFov = THREE.MathUtils.degToRad(this.hudCam.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const distH = (size.y * 0.5) / Math.tan(vFov / 2);
    const distW = (size.x * 0.5) / Math.tan(hFov / 2);
    let dist = Math.max(distH, distW);

    // add padding and account for depth thickness
    dist *= this.opts.framePadding;
    dist += size.z * 0.5;

    this.hudCam.position.set(center.x, center.y, center.z + dist);
    this.hudCam.lookAt(center);
    this.hudCam.updateProjectionMatrix();
  }

  // ---------- BUILDERS ----------
  private buildHouse() {
    const baseW = 0.8;
    const baseH = 0.72;
    const baseD = 0.8;

    // Subtle fill
    const gBase = new THREE.BoxGeometry(baseW, baseH, baseD);
    const mBase = new THREE.MeshStandardMaterial({
      color: this.opts.colorHouse,
      transparent: true,
      opacity: 0.05,
      metalness: 0.0,
      roughness: 1.0,
    });
    const base = new THREE.Mesh(gBase, mBase);

    // Strong edges – use colorHouseOutline
    const baseEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(gBase, 30),
      new THREE.LineBasicMaterial({
        color: this.opts.colorHouseOutline,
        transparent: true,
        opacity: 0.9,
      })
    );

    // Square pyramid roof
    const roofH = 0.46;
    const roofR = baseW / Math.SQRT2;
    const gRoof = new THREE.ConeGeometry(roofR, roofH, 4, 1);
    gRoof.rotateY(Math.PI / 4);

    const mRoof = new THREE.MeshStandardMaterial({
      color: this.opts.colorHouse,
      transparent: true,
      opacity: 0.05,
      metalness: 0.0,
      roughness: 1.0,
    });
    const roof = new THREE.Mesh(gRoof, mRoof);
    roof.position.y = baseH / 2 + roofH / 2;

    const roofEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(gRoof, 30),
      new THREE.LineBasicMaterial({
        color: this.opts.colorHouseOutline,
        transparent: true,
        opacity: 0.9,
      })
    );
    roofEdges.position.copy(roof.position);

    const house = new THREE.Group();
    house.add(base, baseEdges, roof, roofEdges);
    house.scale.setScalar(this.opts.houseScale);
    house.position.y = -0.03;

    this.house = house;
    this.content.add(house); // house stays un-tilted
  }

  private buildCameraMarker() {
    const group = new THREE.Group();

    // Square pyramid "camera", base faces house (-Z), apex points away (+Z)
    const pyrH = 0.14;
    const pyrR = 0.06;
    const gPyr = new THREE.ConeGeometry(pyrR, pyrH, 4, 1);
    gPyr.rotateY(Math.PI / 4);   // make it square
    gPyr.rotateX(-Math.PI / 2);  // orient along +Z (apex -> +Z, base -> -Z)

    const mPyr = new THREE.MeshStandardMaterial({
      color: this.opts.colorCamera,
      transparent: true,
      opacity: 0.25,
      metalness: 0.0,
      roughness: 0.95,
      emissive: new THREE.Color(this.opts.colorCamera).multiplyScalar(0.04),
    });
    const pyramid = new THREE.Mesh(gPyr, mPyr);

    const pyramidEdges = new THREE.LineSegments(
      new THREE.EdgesGeometry(gPyr, 30),
      new THREE.LineBasicMaterial({
        color: this.opts.colorCamera,
        transparent: true,
        opacity: 0.95,
      })
    );

    group.add(pyramid, pyramidEdges);
    group.scale.setScalar(0.95);

    this.camMarker = group;
    this.orbitGroup.add(group); // camera belongs to tilted orbit group
  }

  private buildArc(radius: number) {
    // dispose/remove old arc group if present
    if (this.arcGroup) {
      this.orbitGroup.remove(this.arcGroup);
      this.arcGroup.traverse(obj => {
        const mesh = obj as THREE.Mesh;
        (mesh.geometry as THREE.BufferGeometry)?.dispose?.();
        const mat = (mesh.material as THREE.Material) as any;
        mat?.dispose?.();
      });
      this.arcGroup = undefined;
    }

    const half = this.arcSpanRad * 0.5;
    this.arcStart = -half;
    this.arcEnd = half;

    // Avoid parameter properties (fixes TS1294 in some toolchains)
    class OrbitArcCurve extends THREE.Curve<THREE.Vector3> {
      private r: number;
      private y: number;
      private a0: number;
      private a1: number;
      constructor(r: number, y: number, a0: number, a1: number) {
        super();
        this.r = r; this.y = y; this.a0 = a0; this.a1 = a1;
      }
      getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
        const a = THREE.MathUtils.lerp(this.a0, this.a1, t);
        return target.set(Math.sin(a) * this.r, this.y, Math.cos(a) * this.r);
      }
    }

    const curve = new OrbitArcCurve(radius, this.opts.arcY, this.arcStart, this.arcEnd);
    const geo = new THREE.TubeGeometry(curve, 64, 0.01, 6, false);
    const mat = new THREE.MeshStandardMaterial({
      color: this.opts.colorArc,
      transparent: true,
      opacity: 0.8,
      roughness: 0,
      metalness: 0,
      emissive: new THREE.Color(this.opts.colorArc).multiplyScalar(0.12),
    });
    const arcMesh = new THREE.Mesh(geo, mat);

    // end ticks
    const tickGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6);
    const tickMat = new THREE.MeshStandardMaterial({
      color: this.opts.colorArc, transparent: true, opacity: 0.7
    });
    const tick1 = new THREE.Mesh(tickGeo, tickMat.clone());
    const tick2 = new THREE.Mesh(tickGeo, tickMat.clone());

    const pStart = new THREE.Vector3(Math.sin(this.arcStart) * radius, this.opts.arcY, Math.cos(this.arcStart) * radius);
    const pEnd   = new THREE.Vector3(Math.sin(this.arcEnd)   * radius, this.opts.arcY, Math.cos(this.arcEnd)   * radius);

    tick1.position.copy(pStart);
    tick2.position.copy(pEnd);
    tick1.rotation.x = Math.PI / 2;
    tick2.rotation.x = Math.PI / 2;

    // group and add to tilted orbit group
    const grp = new THREE.Group();
    grp.add(arcMesh, tick1, tick2);
    this.arcGroup = grp;
    this.orbitGroup.add(grp);

    // re-fit after arc size changes
    this.layoutHUD();
    this.updateHintPosition();
  }

  // ---------- LOOP ----------
  private loop() {
    if (this.disposed) return;

    const f = this.opts.lerpFactor;
    this.yawVisual = THREE.MathUtils.lerp(this.yawVisual, this.yawTarget, f);

    const currentR = this.currentArcRadius();
    const nextR = THREE.MathUtils.lerp(currentR, this.arcRadiusTarget, f);
    if (Math.abs(nextR - currentR) > 0.002) {
      this.setCurrentArcRadius(nextR);
      this.buildArc(nextR); // rebuild + re-layout
    }

    const r = this.currentArcRadius();
    const y = this.opts.arcY;
    const clampedYaw = THREE.MathUtils.clamp(this.yawVisual, this.arcStart, this.arcEnd);

    // Position camera marker on the arc (in orbitGroup local space)
    const pos = new THREE.Vector3(Math.sin(clampedYaw) * r, y, Math.cos(clampedYaw) * r);
    this.camMarker.position.copy(pos);

    // Aim the marker toward the orbit group’s center (world pos)
    const orbitWorldCenter = this.orbitGroup.getWorldPosition(new THREE.Vector3());
    this.camMarker.lookAt(orbitWorldCenter);

    this.house.rotation.y += 0.002;

    // update hint anchor every frame (cheap math + 1 style write)
    this.updateHintPosition();

    this.renderer.render(this.scene, this.hudCam);
    this.rafId = requestAnimationFrame(this.loop);
  }

  private currentArcRadius() { return this._arcRadiusNow; }
  private setCurrentArcRadius(r: number) { this._arcRadiusNow = r; }

  // ---------- Hint ----------
  private createHint() {
    const el = document.createElement('div');
    const s = el.style;
    s.position = 'absolute';
    s.left = '0px';
    s.top = '0px';
    s.transform = 'translate(-50%, -100%)'; // will anchor to projected top-center
    s.pointerEvents = 'none';
    s.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, "Helvetica Neue", Arial, sans-serif';
    s.fontSize = '12px';
    s.fontWeight = '600';
    s.lineHeight = '1.2';
    s.letterSpacing = '0.2px';
    s.color = this.opts.hintColor;
    s.whiteSpace = 'nowrap';
    s.userSelect = 'none';
    s.opacity = '1';

    el.textContent = this.opts.hintText;
    if (!this.opts.showHint) el.style.display = 'none';

    this.wrapper.appendChild(el);
    this.hintEl = el;
  }

  private updateHintPosition() {
    if (!this.hintEl) return;

    // Top-middle of combined content (house + arc + cam)
    const box = new THREE.Box3().setFromObject(this.content);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const topWorld = new THREE.Vector3(center.x, box.max.y + 0.02, center.z); // tiny margin above
    const ndc = topWorld.clone().project(this.hudCam);

    // Convert to widget pixel coords
    const rect = this.wrapper.getBoundingClientRect();
    const x = (ndc.x * 0.5 + 0.5) * rect.width;
    const y = (-ndc.y * 0.5 + 0.5) * rect.height;

    const s = this.hintEl.style;
    s.left = `${x}px`;
    s.top  = `${y}px`;
    // transform stays as translate(-50%, -100%) to sit just above the point
  }
}
