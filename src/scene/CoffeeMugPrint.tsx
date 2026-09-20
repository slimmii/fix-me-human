import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { printTexture } from "./printTexture";

// Follow the same taper and angular segments as the ceramic shell. The ink
// receives scene lighting and is hidden by the mug itself when viewed from behind.
const STEP = (Math.PI * 2) / 48;
const radiusAt = (y: number) => 0.23 + ((y + 0.255) / 0.507) * 0.03;

export function CoffeeMugPrint({ username }: { username?: string }) {
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    return printTexture(canvas);
  }, []);
  const geometry = useMemo(
    () =>
      new THREE.LatheGeometry(
        [-0.13, 0.13].map((y) => new THREE.Vector2(radiusAt(y), y)),
        16,
        -8 * STEP,
        16 * STEP,
      ),
    [],
  );

  useEffect(() => {
    let active = true;
    const paint = () => {
      if (!active) return;
      const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
      ctx.clearRect(0, 0, 1024, 512);
      ctx.fillStyle = "#365343";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let size = 156;
      ctx.font = `700 ${size}px "Space Grotesk", sans-serif`;
      if (username) {
        // Keep the entire name on one line, with generous unprinted margins.
        size *= Math.min(1, 830 / ctx.measureText(username).width);
        ctx.font = `700 ${size}px "Space Grotesk", sans-serif`;
        ctx.fillText(username, 512, 256);
      } else {
        ctx.fillText("I ♥", 512, 165);
        ctx.fillText("BUGS", 512, 345);
      }
      texture.needsUpdate = true;
      invalidate();
    };
    paint();
    void document.fonts
      .load('700 156px "Space Grotesk"', username ?? "I ♥ BUGS")
      .then(paint, paint);
    return () => {
      active = false;
    };
  }, [username, texture, invalidate]);

  useEffect(
    () => () => {
      texture.dispose();
      geometry.dispose();
    },
    [texture, geometry],
  );

  return (
    <mesh
      name="coffee-mug-print"
      geometry={geometry}
      receiveShadow
      raycast={() => {}}
    >
      <meshStandardMaterial
        map={texture}
        transparent
        roughness={0.28}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
        polygonOffsetUnits={-1}
      />
    </mesh>
  );
}
