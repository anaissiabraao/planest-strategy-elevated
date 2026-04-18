import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

function Model({ accentHsl }: { accentHsl: string }) {
  const gltf = useLoader(GLTFLoader, "/models/model.gltf");
  const ref = useRef<THREE.Group>(null);

  // Apply orange + white materials
  useMemo(() => {
    const orange = new THREE.Color(accentHsl);
    let i = 0;
    gltf.scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const useOrange = i % 2 === 0;
        mesh.material = new THREE.MeshStandardMaterial({
          color: useOrange ? orange : new THREE.Color("#ffffff"),
          metalness: 0.25,
          roughness: 0.35,
        });
        i++;
      }
    });
  }, [gltf, accentHsl]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.15;
    ref.current.position.y = Math.sin(t * 0.8) * 0.15;
  });

  return (
    <group ref={ref}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export default function HeroModel({
  className = "",
  accent = "#E8521C",
}: {
  className?: string;
  accent?: string;
}) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}>
          <Model accentHsl={accent} />
        </Suspense>
      </Canvas>
    </div>
  );
}
