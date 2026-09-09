import * as THREE from "three";
// Match texture and plane aspect ratios so printed lettering is never stretched.
export function printTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
