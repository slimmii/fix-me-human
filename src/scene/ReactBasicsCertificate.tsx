import { Html } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { printTexture } from "./printTexture";
import { useHoverHighlight } from "./useHoverHighlight";
import { WALL_PRINTS } from "./wallPrints";

export const CERTIFICATE = {
  title: "REACT BASICS",
  subtitle: "Certified Mostly Functional",
  work: "You shipped a board. You obeyed the hooks.",
  qualification: "You are now qualified to introduce more advanced bugs.",
  signature: "Reluctantly approved by B.U.G.",
};

export function ReactBasicsCertificate({ onClick }: { onClick: () => void }) {
  const highlight = useHoverHighlight();
  const paper = WALL_PRINTS.certificate;
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff9dd";
    ctx.fillRect(0, 0, 1024, 768);

    // Two attempts at a straight border. Neither supervised by a ruler.
    ctx.strokeStyle = "#64529c";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(35, 48);
    ctx.lineTo(982, 32);
    ctx.lineTo(990, 723);
    ctx.lineTo(43, 734);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "#458b71";
    ctx.lineWidth = 3;
    ctx.strokeRect(57, 58, 909, 650);

    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(510, 166);
    ctx.rotate(-0.025);
    ctx.font = 'bold 98px "Comic Sans MS", "Chalkboard SE", cursive';
    ctx.fillStyle = "#e5ae60";
    ctx.fillText(CERTIFICATE.title, 5, 6);
    ctx.fillStyle = "#624492";
    ctx.fillText(CERTIFICATE.title, 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(508, 247);
    ctx.rotate(0.015);
    ctx.font = 'bold 49px "Times New Roman", serif';
    ctx.fillStyle = "#286d52";
    ctx.fillText(CERTIFICATE.subtitle, 0, 0);
    ctx.strokeStyle = "#286d52";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-305, 15);
    ctx.quadraticCurveTo(25, 24, 306, 10);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#3a3546";
    ctx.font = '30px "Courier New", monospace';
    ctx.fillText(CERTIFICATE.work, 512, 354);
    ctx.font = '35px "Comic Sans MS", "Chalkboard SE", cursive';
    ctx.fillText("You are now qualified to introduce", 516, 423);
    ctx.font = 'bold 43px "Comic Sans MS", "Chalkboard SE", cursive';
    ctx.fillText("more advanced bugs.", 493, 480);

    // A gold star drawn directly on the paper. Stickers were over budget.
    ctx.save();
    ctx.translate(174, 594);
    ctx.rotate(-0.16);
    ctx.fillStyle = "#f5cc49";
    ctx.strokeStyle = "#b58631";
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let point = 0; point < 10; point++) {
      const angle = -Math.PI / 2 + (point * Math.PI) / 5;
      const radius = point % 2 ? 30 : 68 + (point % 3) * 3;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#59452e";
    ctx.beginPath();
    ctx.arc(-12, -8, 3, 0, Math.PI * 2);
    ctx.arc(13, -6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, 12);
    ctx.quadraticCurveTo(3, 25, 16, 10);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(608, 620);
    ctx.rotate(-0.025);
    ctx.fillStyle = "#55458b";
    ctx.font = 'italic 35px "Comic Sans MS", "Chalkboard SE", cursive';
    ctx.fillText(CERTIFICATE.signature, 0, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#55458b";
    ctx.beginPath();
    ctx.moveTo(-269, 15);
    ctx.lineTo(255, 19);
    ctx.stroke();
    ctx.restore();
    return printTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group
      {...highlight.mesh}
      name="react-basics-certificate"
      position={paper.position}
      rotation={[0, 0, paper.rotation]}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <mesh position={[0.012, -0.018, -0.005]}>
        <planeGeometry args={[paper.width, paper.height]} />
        <meshBasicMaterial color="#4d6853" transparent opacity={0.22} />
      </mesh>
      <mesh>
        <planeGeometry args={[paper.width, paper.height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.37, 0.397, 0.007]}
          rotation={[0, 0, side === -1 ? -0.19 : 0.28]}
        >
          <planeGeometry args={[0.23, 0.085]} />
          <meshBasicMaterial color="#ddcea3" transparent opacity={0.82} />
        </mesh>
      ))}
      <Html
        transform
        distanceFactor={2}
        position={[0, 0, 0.01]}
        zIndexRange={[6, 1]}
      >
        <button
          {...highlight.html}
          className="wall-certificate-button"
          aria-label="Read REACT BASICS certificate"
          aria-description={Object.values(CERTIFICATE).join(". ")}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
        />
      </Html>
    </group>
  );
}
