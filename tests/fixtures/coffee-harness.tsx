import { createRoot } from "react-dom/client";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CoffeeMug } from "../../src/scene/CoffeeMug";
import { COFFEE } from "../../src/scene/coffeePhysics";
import { Box } from "../../src/scene/primitives";
import "../../src/style.css";

// Inspect the actual rendered objects, including their position after input.
function Probe() {
  useFrame(({ scene, camera, size }) => {
    const mug = scene.getObjectByName("coffee-mug");
    const surface = scene.getObjectByName("coffee-surface") as THREE.Mesh;
    const drops = scene.getObjectByName("coffee-drops") as THREE.InstancedMesh;
    const puddles = scene.getObjectByName("coffee-puddles");
    if (!mug || !surface || !drops || !puddles) return;
    const point = mug.getWorldPosition(new THREE.Vector3()).project(camera);
    document.getElementById("coffee-state")!.textContent = JSON.stringify({
      x: (point.x * 0.5 + 0.5) * size.width,
      y: (-point.y * 0.5 + 0.5) * size.height,
      tilt: Math.hypot(mug.rotation.x, mug.rotation.z),
      level: surface.geometry.attributes.position.getY(0),
      drops: drops.count,
      puddles: puddles.children.filter((puddle) => puddle.visible).length,
    });
  });
  return null;
}

createRoot(document.getElementById("root")!).render(
  <Canvas
    camera={{ position: [-1.05, 2.85, 2.85], fov: 40 }}
    onCreated={({ camera }) => camera.lookAt(-1.9, 1.7, 0.65)}
  >
    <color attach="background" args={["#a4c7b4"]} />
    <ambientLight intensity={1.5} />
    <directionalLight position={[-3, 8, 6]} intensity={2.5} />
    <Box
      position={[-1.9, COFFEE.deskHeight - 0.02, 0.65]}
      size={[3, 0.04, 2.5]}
      color="#efca8f"
      radius={0.01}
    />
    <CoffeeMug
      reduced={new URLSearchParams(location.search).has("reduced")}
      onProp={(text) => {
        document.getElementById("quote")!.textContent = text;
      }}
    />
    <Probe />
  </Canvas>,
);
