import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MONITOR, SCREEN_CENTER, SEATED_VIEW } from "../monitor";

import type { WorldProps } from "./types";
import { WALL_PRINTS } from "./wallPrints";
export function useSeatedCamera(props: WorldProps) {
  const { focused, reduced } = props;
  useFrame(({ camera, size }, dt) => {
    const wallPrint = props.wallFocus ? WALL_PRINTS[props.wallFocus] : null;
    props.wallClick.current = (pointer, event) => {
      if (!wallPrint) return;
      const ray = new THREE.Raycaster();
      ray.setFromCamera(pointer, camera);
      const hit = ray.ray.intersectPlane(
        new THREE.Plane(new THREE.Vector3(0, 0, 1), -wallPrint.position[2]),
        new THREE.Vector3(),
      );
      const local = hit
        ?.sub(new THREE.Vector3(...wallPrint.position))
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), -wallPrint.rotation);
      if (
        !local ||
        Math.abs(local.x) > wallPrint.width / 2 ||
        Math.abs(local.y) > wallPrint.height / 2
      ) {
        event.stopPropagation();
        props.onDesk();
      }
    };
    // Keep the seated viewing direction fixed throughout zooms. Changing the
    // look-at point while translating caused the scene to sweep around the player.
    const deskPosition = new THREE.Vector3(...SEATED_VIEW.position);
    const direction = new THREE.Vector3(...SEATED_VIEW.target)
      .sub(deskPosition)
      .normalize();
    const target = deskPosition.clone();
    if (wallPrint || focused) {
      const showDeskPaper = focused && props.assignmentCollected;
      const width = wallPrint
        ? wallPrint.width
        : showDeskPaper
          ? 2.8
          : MONITOR.width;
      const height = wallPrint ? wallPrint.height : MONITOR.height;
      // Frame the physical casing, leaving room for B.U.G. below the monitor.
      const viewingMonitor = focused && !wallPrint;
      const distance = Math.max(
        height /
          (2 * Math.tan((Math.PI * 44) / 360) * (viewingMonitor ? 0.8 : 0.72)),
        width /
          (2 *
            Math.tan((Math.PI * 44) / 360) *
            (size.width / size.height) *
            (viewingMonitor ? 0.92 : 0.8)),
      );
      const center = wallPrint
        ? new THREE.Vector3(...wallPrint.position)
        : new THREE.Vector3(
            showDeskPaper ? 0.3 : 0,
            SCREEN_CENTER[1] - (showDeskPaper ? 0.15 : 0.18),
            SCREEN_CENTER[2],
          );
      target.copy(center).addScaledVector(direction, -distance);
      if (focused && props.assignmentOpen) {
        // Make room for the brief by panning only; preserve the monitor's scale.
        target.x = Math.max(
          target.x,
          distance *
            Math.tan((Math.PI * 44) / 360) *
            (size.width / size.height) *
            0.28,
        );
      }
    }
    camera.position.lerp(target, reduced ? 1 : 1 - Math.exp(-dt * 6));
    if (camera.position.distanceTo(target) < 0.01) camera.position.copy(target);
    camera.lookAt(camera.position.clone().add(direction));
    // Drei projects the HTML in this same frame, including the final demand frame.
    camera.updateMatrixWorld();
  }, -1); // Update before Drei measures the HTML screen, including demand frames.
}
