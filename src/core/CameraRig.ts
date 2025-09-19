import * as THREE from 'three';

type RigOpts = {
  fov?: number; near?: number; far?: number;
  initialPosition?: THREE.Vector3;
  lookAt?: THREE.Vector3;
};

export class CameraRig {
  public camera: THREE.PerspectiveCamera;

  constructor(opts: RigOpts = {}) {
    const fov = opts.fov ?? 50;
    const near = opts.near ?? 0.1;
    const far = opts.far ?? 1000;

    this.camera = new THREE.PerspectiveCamera(
      fov, window.innerWidth / window.innerHeight, near, far
    );

    this.camera.position.copy(opts.initialPosition ?? new THREE.Vector3(6, 1.5, 8));
    this.camera.lookAt(opts.lookAt ?? new THREE.Vector3(0, 1, 0));
  }
}
