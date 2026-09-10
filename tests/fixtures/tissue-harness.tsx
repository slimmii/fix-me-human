import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { TissueBox } from "../../src/scene/TissueBox";
import { Box } from "../../src/scene/primitives";

createRoot(document.getElementById("root")!).render(
  <Canvas
    camera={{ position: [1.78, 2.6, 3], fov: 40 }}
    onCreated={({ camera }) => camera.lookAt(1.78, 1.65, 1)}
  >
    <color attach="background" args={["#a4c7b4"]} />
    <ambientLight intensity={2} />
    <directionalLight position={[-3, 8, 6]} intensity={2} />
    <Box position={[1.78, 1.39, 1]} size={[2.6, 0.035, 1.7]} color="#efca8f" />
    <TissueBox
      reduced={false}
      focused={false}
      onProp={(text) => {
        document.getElementById("quote")!.textContent = text;
      }}
    />
  </Canvas>,
);
