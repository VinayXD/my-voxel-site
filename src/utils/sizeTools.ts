import * as THREE from 'three';

export function getBounds(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  return { box, size, center };
}

/** Uniformly scales the object so its *height* equals targetHeight (world units). */
export function scaleObjectToHeight(object: THREE.Object3D, targetHeight: number): number {
  const { size } = getBounds(object);
  const h = size.y || 1;
  const s = targetHeight / h;
  object.scale.multiplyScalar(s);
  object.updateMatrixWorld(true);
  return s;
}

/** Optional: show a visible box for debugging size */
export function addBoxHelper(object: THREE.Object3D, color = 0x00aaff): THREE.Box3Helper {
  const helper = new THREE.Box3Helper(new THREE.Box3().setFromObject(object), color);
  object.add(helper);
  return helper;
}
