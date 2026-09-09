import { Box, dark, mint } from "./primitives";

export function Cubicle() {
  return (
    <>
      {" "}
      <color attach="background" args={["#a4c7b4"]} />
      <fog attach="fog" args={["#a4c7b4", 10, 23]} />
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[-3, 8, 6]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 2.6, 1]} color="#b8ff9b" intensity={2} />
      <Box position={[0, -0.1, 0]} size={[18, 0.2, 18]} color="#779888" />
      <Box position={[0, 2, -2]} size={[8, 4, 0.2]} color={mint} />
      <Box position={[-4, 2, 0]} size={[0.2, 4, 4]} color="#79a38c" />
      <Box position={[4, 2, 0]} size={[0.2, 4, 4]} color="#79a38c" />
      {[-3.9, 0, 3.9].map((x) => (
        <Box
          key={x}
          position={[x, 2, -1.84]}
          size={[0.05, 4, 0.07]}
          color="#527e68"
          radius={0.01}
        />
      ))}
      <Box position={[0, 4, -2]} size={[8.1, 0.14, 0.35]} color={dark} />
      <Box position={[0, 1.26, 0]} size={[7.2, 0.25, 3.6]} color="#d39c66" />
      <Box
        position={[0, 1.39, 0]}
        size={[7.18, 0.035, 3.57]}
        color="#efca8f"
        radius={0.01}
      />
      {[-2.9, 2.9].map((x) => (
        <Box
          key={x}
          position={[x, 0.55, 0.4]}
          size={[0.22, 1.4, 2.3]}
          color={dark}
        />
      ))}
    </>
  );
}
