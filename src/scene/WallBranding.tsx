import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { printTexture } from "./printTexture";

export function WallBranding() {
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1120;
    canvas.height = 560;
    return printTexture(canvas);
  }, []);

  useEffect(() => {
    let active = true;
    const paint = () => {
      if (!active) return;
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(4, 0, 0, 4, 0, 0);
      ctx.clearRect(0, 0, 280, 140);
      ctx.fillStyle = "#243e34";
      ctx.font = '700 11px "DM Sans", sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText("BUG INDUSTRIES™", 8, 18);
      ctx.font = '700 44px "Space Grotesk", sans-serif';
      ctx.letterSpacing = "-2.5px";
      ctx.fillText("One human.", 8, 80);
      ctx.fillText("Several bugs.", 8, 80 + 44 * 1.04);
      texture.needsUpdate = true;
      invalidate();
    };

    // Canvas text must wait for the same bundled fonts used by the UI.
    void Promise.all([
      document.fonts.load('700 11px "DM Sans"', "BUG INDUSTRIES™"),
      document.fonts.load(
        '700 44px "Space Grotesk"',
        "One human. Several bugs.",
      ),
    ]).then(paint, paint);
    return () => {
      active = false;
      texture.dispose();
    };
  }, [invalidate, texture]);

  return (
    <mesh
      name="bug-industries-wall-branding"
      position={[-3.895, 3.32, -1.05]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <planeGeometry args={[1.5, 0.75]} />
      {/* Transparent ink sits just inside the left panel's face at x = -3.9. */}
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
