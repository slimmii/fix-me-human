import { useHoverHighlight } from "./useHoverHighlight";
import { Html } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneProps as Props } from "./types";
import { CoffeeSteam } from "./CoffeeSteam";
import type { FanAirflow } from "./fanAirflow";
import {
  COFFEE,
  coffeeSurface,
  createCoffeePhysics,
  updateCoffee,
  wiggleCoffee,
} from "./coffeePhysics";

const REMARK = "Coffee: 98% caffeine. 2% unresolved promises.";
const UP = new THREE.Vector3(0, 1, 0);

function createLiquidGeometry() {
  const geometry = new THREE.RingGeometry(0, COFFEE.radius, 48, 6);
  geometry.rotateX(-Math.PI / 2);
  (geometry.attributes.position as THREE.BufferAttribute).setUsage(
    THREE.DynamicDrawUsage,
  );
  return geometry;
}

export function CoffeeMug({
  reduced,
  onProp,
  airflow,
}: Pick<Props, "reduced" | "onProp"> & { airflow?: FanAirflow }) {
  const mug = useRef<THREE.Group>(null);
  const highlight = useHoverHighlight(mug);
  const { invalidate } = useThree();
  const physics = useMemo(createCoffeePhysics, []);
  const liquid = useMemo(createLiquidGeometry, []);
  const shell = useMemo(
    () =>
      new THREE.LatheGeometry(
        [
          [0, -0.275],
          [0.212, -0.275],
          [0.23, -0.255],
          [0.26, 0.252],
          [0.26, 0.266],
          [0.252, COFFEE.rim],
          [0.229, COFFEE.rim],
          [COFFEE.radius, 0.263],
          [COFFEE.radius, -0.205],
          [0.2, COFFEE.bottom],
          [0, COFFEE.bottom],
        ].map(([x, y]) => new THREE.Vector2(x, y)),
        48,
      ),
    [],
  );
  const puddleGeometry = useMemo(() => {
    const geometry = new THREE.CircleGeometry(1, 40);
    geometry.rotateX(-Math.PI / 2);
    const vertices = geometry.attributes.position;
    for (let i = 1; i < vertices.count; i++) {
      const angle = Math.atan2(vertices.getZ(i), vertices.getX(i));
      const edge = 1 + Math.sin(angle * 3) * 0.09 + Math.cos(angle * 5) * 0.05;
      vertices.setXYZ(i, vertices.getX(i) * edge, 0, vertices.getZ(i) * edge);
    }
    return geometry;
  }, []);
  useEffect(
    () => () => {
      liquid.dispose();
      shell.dispose();
      puddleGeometry.dispose();
    },
    [liquid, shell, puddleGeometry],
  );
  const drops = useRef<THREE.InstancedMesh>(null);
  const puddles = useRef<THREE.Group>(null);
  const steam = useRef<THREE.Group>(null);
  const scratch = useMemo(() => new THREE.Object3D(), []);
  const dropDirection = useMemo(() => new THREE.Vector3(), []);
  const drag = useRef({ pointer: -1, x: 0, y: 0, distance: 0 });

  useFrame((_, delta) => {
    updateCoffee(physics, delta, reduced);
    if (!mug.current) return;
    mug.current.rotation.copy(physics.rotation);
    mug.current.position.y = physics.bodyHeight;
    const surface = coffeeSurface(physics);
    const vertices = liquid.attributes.position;
    const wave = Math.min(0.006, Math.hypot(surface.x, surface.z) * 0.004);
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const z = vertices.getZ(i);
      const radius = Math.hypot(x, z) / COFFEE.radius;
      const ripple =
        Math.sin(radius * 15 - physics.time * 16) * wave * (1 - radius);
      vertices.setY(
        i,
        THREE.MathUtils.clamp(
          surface.level + surface.x * x + surface.z * z + ripple,
          COFFEE.bottom + 0.001,
          COFFEE.rim,
        ),
      );
    }
    vertices.needsUpdate = true;
    liquid.computeVertexNormals();
    if (steam.current) {
      steam.current.position
        .set(0, surface.level, 0)
        .applyEuler(physics.rotation);
      // CoffeeSteam's original source is at the rim of a full cup.
      steam.current.position.y += physics.bodyHeight - COFFEE.rim;
      steam.current.visible = physics.volume > 0.001;
    }
    if (drops.current) {
      let count = 0;
      for (const drop of physics.drops) {
        if (!drop.active) continue;
        scratch.position.copy(drop.position);
        scratch.quaternion.setFromUnitVectors(
          UP,
          dropDirection.copy(drop.velocity).normalize(),
        );
        const radius = Math.cbrt((drop.volume * 3) / (4 * Math.PI));
        scratch.scale.set(radius * 0.8, radius * 1.2, radius * 0.8);
        scratch.updateMatrix();
        drops.current.setMatrixAt(count++, scratch.matrix);
      }
      drops.current.count = count;
      drops.current.instanceMatrix.needsUpdate = true;
    }
    puddles.current?.children.forEach((mesh, i) => {
      const puddle = physics.puddles[i];
      mesh.visible = puddle.volume > 0;
      mesh.position.set(puddle.x, 0.002 + i * 0.00002, puddle.z);
      const radius = Math.sqrt(puddle.volume / (Math.PI * 0.02));
      const size = reduced
        ? radius
        : THREE.MathUtils.lerp(mesh.scale.x, radius, 1 - Math.exp(-delta * 12));
      mesh.scale.set(size, 1, size * 0.8);
    });
  });

  function endDrag(event: ThreeEvent<PointerEvent>) {
    if (drag.current.pointer !== event.pointerId) return;
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);
    drag.current.pointer = -1;
  }

  return (
    <group position={[-1.9, COFFEE.deskHeight, 0.65]}>
      {!reduced && (
        <group ref={steam}>
          <CoffeeSteam airflow={airflow} />
        </group>
      )}
      <group
        {...highlight.mesh}
        name="coffee-mug"
        position={[0, 0.275, 0]}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.stopPropagation();
          drag.current = {
            pointer: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            distance: 0,
          };
          (event.target as Element).setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current.pointer !== event.pointerId) return;
          event.stopPropagation();
          const dx = event.clientX - drag.current.x;
          const dy = event.clientY - drag.current.y;
          const previousDistance = drag.current.distance;
          drag.current.distance += Math.hypot(dx, dy);
          drag.current.x = event.clientX;
          drag.current.y = event.clientY;
          if (drag.current.distance <= 4) return;
          if (previousDistance <= 4) onProp(REMARK);
          if (!reduced) wiggleCoffee(physics, dy * 0.045, -dx * 0.055);
          invalidate();
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          drag.current.pointer = -1;
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (drag.current.distance > 4) return;
          if (!reduced) wiggleCoffee(physics);
          invalidate();
          onProp(REMARK);
        }}
      >
        <mesh geometry={shell} castShadow receiveShadow>
          <meshStandardMaterial color="#f7eee0" roughness={0.28} />
        </mesh>
        <mesh name="coffee-surface" geometry={liquid} frustumCulled={false}>
          <meshPhysicalMaterial
            color="#3d2113"
            roughness={0.23}
            clearcoat={0.8}
            clearcoatRoughness={0.16}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0.28, 0, 0]}>
          <torusGeometry args={[0.17, 0.055, 8, 16]} />
          <meshStandardMaterial color="#f7eee0" />
        </mesh>
        <Html
          zIndexRange={[5, 0]}
          pointerEvents="none"
          style={{ pointerEvents: "none" }}
          position={[0, 0, 0.25]}
          transform
          distanceFactor={1.8}
        >
          <b className="mug-label">
            I ♥<br />
            BUGS
          </b>
        </Html>
      </group>
      <instancedMesh
        ref={drops}
        name="coffee-drops"
        args={[undefined, undefined, COFFEE.dropCount]}
        count={0}
        frustumCulled={false}
        raycast={() => {}}
      >
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#482817" roughness={0.22} />
      </instancedMesh>
      <group ref={puddles} name="coffee-puddles">
        {physics.puddles.map((_, i) => (
          <mesh
            key={i}
            geometry={puddleGeometry}
            visible={false}
            scale={[0, 1, 0]}
            rotation={[0, i * 2.4, 0]}
            raycast={() => {}}
          >
            <meshPhysicalMaterial
              color="#51301b"
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.12}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
