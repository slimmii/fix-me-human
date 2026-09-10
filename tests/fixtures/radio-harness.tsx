import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { Radio } from "../../src/scene/Radio";

createRoot(document.getElementById("root")!).render(
  <Canvas camera={{ position: [-2.85, 1.79, 5] }}>
    <ambientLight intensity={2} />
    <Radio
      mute={false}
      focused={false}
      onProp={(text) => {
        document.getElementById("quote")!.textContent = text;
      }}
    />
  </Canvas>,
);
