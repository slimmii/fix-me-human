import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { FanAirflow } from "./fanAirflow";

const CYCLE = 12;
const LIFETIME = 3.2;
const vertexShader = `
  uniform vec3 wind;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    // Keep the base near the cup and let the top curve into the breeze.
    worldPosition.xyz += wind * vUv.y * vUv.y * 0.75;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;
const fragmentShader = `
  uniform float age;
  uniform float opacity;
  varying vec2 vUv;
  void main() {
    float curl = sin(vUv.y * 9.0 - age * 1.8) * (0.06 + vUv.y * 0.17);
    float width = mix(0.045, 0.13, vUv.y);
    float wisp = 1.0 - smoothstep(0.0, width, abs(vUv.x - 0.5 - curl));
    float ends = smoothstep(0.0, 0.16, vUv.y) * (1.0 - smoothstep(0.5, 1.0, vUv.y));
    gl_FragColor = vec4(1.0, 0.97, 0.9, wisp * ends * opacity);
  }
`;

export function CoffeeSteam({ airflow }: { airflow?: FanAirflow }) {
  const wisps = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const { wind, targetWind, fromFan, localWind, rotation } = useMemo(
    () => ({
      wind: new THREE.Vector3(),
      targetWind: new THREE.Vector3(),
      fromFan: new THREE.Vector3(),
      localWind: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
    }),
    [],
  );

  useFrame(({ camera }, delta) => {
    elapsed.current = (elapsed.current + delta) % CYCLE;
    if (!wisps.current) return;
    targetWind.set(0, 0, 0);
    if (airflow && airflow.strength > 0) {
      fromFan.set(0, 0.55, 0);
      wisps.current.localToWorld(fromFan).sub(airflow.position);
      const distance = fromFan.length();
      fromFan.normalize();
      // A spreading breeze only reaches steam in front of the fan.
      const coverage = THREE.MathUtils.smoothstep(
        fromFan.dot(airflow.direction),
        0.65,
        0.95,
      );
      const strength =
        (airflow.strength * coverage) / (1 + distance * distance * 0.12);
      targetWind
        .copy(airflow.direction)
        .lerp(fromFan, 0.5)
        .setY(0)
        .normalize()
        .multiplyScalar(strength);
    }
    wind.lerp(targetWind, 1 - Math.exp(-delta * 2.5));
    wisps.current.getWorldQuaternion(rotation).invert();
    localWind.copy(wind).applyQuaternion(rotation);
    wisps.current?.children.forEach((child, i) => {
      const wisp = child as THREE.Mesh<
        THREE.PlaneGeometry,
        THREE.ShaderMaterial
      >;
      // Stagger a short burst, then leave several seconds with no steam.
      const age = elapsed.current - 1.5 - i * 0.65;
      wisp.visible = age > 0 && age < LIFETIME;
      if (!wisp.visible) return;
      const progress = age / LIFETIME;
      wisp.position.set(
        (i - 1) * 0.11 + Math.sin(age * 1.3 + i) * 0.035 * progress,
        0.55 + progress * 0.3,
        0,
      );
      wisp.position.addScaledVector(localWind, progress * 0.35);
      wisp.scale.set(1 + progress * 0.45, 0.7 + progress * 0.45, 1);
      wisp.quaternion.copy(rotation).multiply(camera.quaternion);
      wisp.material.uniforms.wind.value.copy(wind);
      wisp.material.uniforms.age.value = age + i * 1.7;
      wisp.material.uniforms.opacity.value =
        Math.sin(progress * Math.PI) * 0.42;
    });
  });

  return (
    <group ref={wisps}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} visible={false} frustumCulled={false} raycast={() => {}}>
          <planeGeometry args={[0.24, 0.62, 1, 16]} />
          <shaderMaterial
            transparent
            depthWrite={false}
            toneMapped={false}
            uniforms={{
              age: { value: 0 },
              opacity: { value: 0 },
              wind: { value: new THREE.Vector3() },
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
          />
        </mesh>
      ))}
    </group>
  );
}
