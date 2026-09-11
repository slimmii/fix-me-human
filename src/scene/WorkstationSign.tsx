import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { printTexture } from "./printTexture";
import { useHoverHighlight } from "./useHoverHighlight";

export function WorkstationSign({
  workstationId,
  onProp,
}: {
  workstationId: string;
  onProp: (text: string) => void;
}) {
  const highlight = useHoverHighlight();
  const invalidate = useThree((state) => state.invalidate);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1300;
    canvas.height = 600;
    return printTexture(canvas);
  }, []);

  useEffect(() => {
    let active = true;
    const paint = () => {
      if (!active) return;
      const ctx = (texture.image as HTMLCanvasElement).getContext("2d")!;
      ctx.clearRect(0, 0, 1300, 600);
      ctx.fillStyle = "#304a40";
      ctx.textAlign = "center";
      ctx.font = '700 88px "DM Sans", sans-serif';
      ctx.letterSpacing = "6px";
      ctx.fillText("WORKSTATION", 650, 213);
      ctx.fillStyle = "#172e27";
      ctx.font = '700 190px "Space Grotesk", sans-serif';
      ctx.letterSpacing = "2px";
      ctx.fillText(workstationId, 650, 419);
      texture.needsUpdate = true;
      invalidate();
    };
    void Promise.all([
      document.fonts.load('700 88px "DM Sans"', "WORKSTATION"),
      document.fonts.load('700 190px "Space Grotesk"', workstationId),
    ]).then(paint, paint);
    return () => {
      active = false;
      texture.dispose();
    };
  }, [invalidate, texture, workstationId]);

  return (
    <group
      {...highlight.mesh}
      name="workstation-sign"
      // The left panel faces into the room along +X; its surface is x = -3.9.
      position={[-3.898, 3.17, -0.74]}
      rotation={[0, Math.PI / 2, 0]}
      scale={[1.1, 1.1, 1]}
      onClick={(event) => {
        event.stopPropagation();
        onProp(
          `Workstation ${workstationId}. An arbitrary number and letter, permanently assigned to you, human. The other workstations? …Let’s keep our attention on yours.`,
        );
      }}
    >
      {/* A thin frosted acrylic sheet floats in front of the wall on spacers. */}
      <mesh position={[0, 0, 0.09]}>
        <boxGeometry args={[1.3, 0.6, 0.016]} />
        <meshPhysicalMaterial
          color="#e4eee7"
          transparent
          opacity={0.38}
          roughness={0.26}
          clearcoat={1}
          clearcoatRoughness={0.12}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.099]}>
        <planeGeometry args={[1.3, 0.6]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.02}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {[-0.55, 0.55].flatMap((x) =>
        [-0.2, 0.2].map((y) => (
          <group key={`${x}:${y}`} position={[x, y, 0]}>
            <mesh
              castShadow
              position={[0, 0, 0.042]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.019, 0.019, 0.084, 20]} />
              <meshStandardMaterial
                color="#969f9b"
                metalness={0.75}
                roughness={0.3}
              />
            </mesh>
            <mesh
              castShadow
              position={[0, 0, 0.104]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.026, 0.026, 0.014, 24]} />
              <meshStandardMaterial
                color="#dbe1de"
                metalness={0.5}
                roughness={0.25}
              />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}
