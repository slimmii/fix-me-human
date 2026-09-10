import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CRT } from "../monitor";

import type { ThreeElements } from "@react-three/fiber";
import type { WorldProps } from "./types";
import { WALL_PRINTS } from "./wallPrints";
export function useSeatedCamera(props: WorldProps) {
  const { focused, reduced } = props;
  const drag = useRef({ down: false, x: 0, y: 0, yaw: 0, pitch: 0 });
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
    }; // Keep the seated viewing direction fixed throughout zooms. Changing the
    // look-at point while translating caused the scene to sweep around the player.
    const deskPosition = new THREE.Vector3(
      drag.current.yaw,
      3.45 + drag.current.pitch,
      6.8,
    );
    const direction = new THREE.Vector3(0, 1.9, -0.45)
      .sub(deskPosition)
      .normalize();
    const target = deskPosition.clone();
    if (wallPrint || focused) {
      const showDeskPaper = focused && props.assignmentCollected;
      const width = wallPrint
        ? wallPrint.width
        : showDeskPaper
          ? 2.8
          : CRT.width;
      const height = wallPrint
        ? wallPrint.height
        : showDeskPaper
          ? 1.3
          : CRT.height;
      const distance = Math.max(
        height / (2 * Math.tan((Math.PI * 44) / 360) * 0.72),
        width /
          (2 *
            Math.tan((Math.PI * 44) / 360) *
            (size.width / size.height) *
            0.8),
      );
      const center = wallPrint
        ? new THREE.Vector3(...wallPrint.position)
        : new THREE.Vector3(
            showDeskPaper ? 0.3 : 0,
            CRT.centerY - (showDeskPaper ? 0.15 : 0),
            CRT.surfaceZ,
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

  const handlers: Pick<
    ThreeElements["group"],
    "onPointerDown" | "onPointerUp" | "onPointerLeave" | "onPointerMove"
  > = {
    onPointerDown: (e) => {
      drag.current.down = true;
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    },
    onPointerUp: () => {
      drag.current.down = false;
    },
    onPointerLeave: () => {
      drag.current.down = false;
    },
    onPointerMove: (e) => {
      if (!drag.current.down || focused || props.wallFocus) return;
      drag.current.yaw = THREE.MathUtils.clamp(
        drag.current.yaw + (drag.current.x - e.clientX) * 0.008,
        -1.1,
        1.1,
      );
      drag.current.pitch = THREE.MathUtils.clamp(
        drag.current.pitch + (e.clientY - drag.current.y) * 0.005,
        -0.3,
        0.5,
      );
      drag.current.x = e.clientX;
      drag.current.y = e.clientY;
    },
  };
  return handlers;
}
