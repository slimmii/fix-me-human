import * as THREE from "three";
import { useHoverHighlight } from "./useHoverHighlight";
import { useEffect, useMemo } from "react";
import { printTexture } from "./printTexture";
import { WALL_PRINTS } from "./wallPrints";
export function MotivationalPoster({ onClick }: { onClick: () => void }) {
  const highlight = useHoverHighlight<THREE.Mesh>();
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#a77a51";
    ctx.fillRect(0, 0, 768, 1024);
    ctx.fillStyle = "#f5e6b4";
    ctx.fillRect(14, 14, 740, 996);
    ctx.strokeStyle = "#c9b987";
    ctx.lineWidth = 2;
    ctx.strokeRect(36, 36, 696, 952);
    ctx.fillStyle = "#345242";
    ctx.textAlign = "center";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("HUMAN RESOURCES", 384, 94);
    ctx.fillRect(84, 126, 600, 3);
    ctx.font = "bold 142px sans-serif";
    ctx.fillText("HANG", 384, 274);
    ctx.font = "bold 124px sans-serif";
    ctx.fillText("IN THERE.", 384, 406);
    // A cheerful office flower, printed in the same warm ink as the props.
    ctx.strokeStyle = "#557962";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(384, 626);
    ctx.quadraticCurveTo(370, 706, 405, 748);
    ctx.stroke();
    ctx.fillStyle = "#557962";
    ctx.beginPath();
    ctx.ellipse(423, 697, 39, 16, -0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e7834a";
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.ellipse(
        384 + Math.cos(angle) * 78,
        566 + Math.sin(angle) * 78,
        51,
        28,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = "#edb84f";
    ctx.beginPath();
    ctx.arc(384, 566, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#345242";
    ctx.beginPath();
    ctx.arc(371, 559, 4, 0, Math.PI * 2);
    ctx.arc(397, 559, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#345242";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(384, 566, 15, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.fillStyle = "#203f37";
    ctx.font = "bold 43px sans-serif";
    ctx.fillText("YOU ARE NOT", 384, 822);
    ctx.fillText("REPLACEABLE.*", 384, 876);
    ctx.font = "bold italic 37px sans-serif";
    ctx.fillText("*yet.", 384, 943);
    return printTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh
      {...highlight.mesh}
      position={WALL_PRINTS.poster.position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <planeGeometry
        args={[WALL_PRINTS.poster.width, WALL_PRINTS.poster.height]}
      />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
export function BugCounterSign({ days }: { days: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#345242";
    ctx.fillRect(0, 0, 1024, 256);
    ctx.fillStyle = "#e7ead5";
    ctx.fillRect(10, 10, 1004, 236);
    ctx.strokeStyle = "#9eaf91";
    ctx.lineWidth = 2;
    ctx.strokeRect(22, 22, 980, 212);
    ctx.fillStyle = "#345242";
    ctx.textBaseline = "middle";
    ctx.font = "bold 76px sans-serif";
    ctx.fillText("DAYS WITHOUT", 48, 91);
    ctx.fillText("A BUG", 48, 181);
    ctx.fillStyle = "#345242";
    ctx.fillRect(764, 35, 210, 186);
    ctx.fillStyle = "#f5f0d3";
    ctx.fillRect(770, 41, 198, 174);
    ctx.fillStyle = "#345242";
    ctx.font = `bold ${Math.min(140, 270 / String(days).length)}px monospace`;
    ctx.textAlign = "center";
    ctx.fillText(String(days), 869, 135);
    return printTexture(canvas);
  }, [days]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0.2, 3.45, -1.8]}>
      <planeGeometry args={[1.72, 0.43]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
