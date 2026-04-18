import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

function Model({ accentHsl }: { accentHsl: string }) {
  const gltf = useLoader(GLTFLoader, "/models/model.gltf");
  const ref = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  // Apply orange + white materials and auto-fit
  const fittedScene = useMemo(() => {
    const orange = new THREE.Color(accentHsl);
    let i = 0;
    gltf.scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        const useOrange = i % 2 === 0;
        mesh.material = new THREE.MeshStandardMaterial({
          color: useOrange ? orange : new THREE.Color("#ffffff"),
          metalness: 0.3,
          roughness: 0.35,
        });
        i++;
      }
    });

    // Auto-center
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const sizeVec = box.getSize(new THREE.Vector3());
    gltf.scene.position.sub(center);

    // Normalize to fit in a ~2.5 unit cube
    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
    const scale = 2.5 / maxDim;
    gltf.scene.scale.setScalar(scale);

    return gltf.scene;
  }, [gltf, accentHsl]);

  // Adjust camera to frame the object
  useEffect(() => {
    const aspect = size.width / size.height;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = 2.5 / (2 * Math.tan(fov / 2)) * 1.6;
    camera.position.set(0, 0.3, Math.max(dist, 3));
    camera.lookAt(0, 0, 0);
  }, [camera, size]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.5;
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.12;
    ref.current.position.y = Math.sin(t * 0.8) * 0.12;
  });

  return (
    <group ref={ref}>
      <primitive object={fittedScene} />
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
    <div className={className} style={{ minHeight: 200 }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} />
        <directionalLight position={[-5, -3, -5]} intensity={0.5} color="#ffffff" />
        <Suspense fallback={null}>
          <Model accentHsl={accent} />
        </Suspense>
      </Canvas>
    </div>
  );
}
