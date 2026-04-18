import { Suspense, useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

function Model({ accentHsl }: { accentHsl: string }) {
  const gltf = useLoader(GLTFLoader, "/models/model.gltf");
  const ref = useRef<THREE.Group>(null);
  const { camera, size } = useThree();

  const fittedScene = useMemo(() => {
    const scene = gltf.scene.clone(true);
    const orange = new THREE.Color(accentHsl);
    let i = 0;

    scene.traverse((child) => {
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

    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const sizeVec = box.getSize(new THREE.Vector3());
    scene.position.sub(center);

    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z) || 1;
    const scale = 2.5 / maxDim;
    scene.scale.setScalar(scale);

    return scene;
  }, [gltf.scene, accentHsl]);

  // Adjust camera once to frame the object (avoids zoom drift on resize)
  const framedRef = useRef(false);
  useEffect(() => {
    if (framedRef.current) return;
    if (!size.width || !size.height) return;
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const dist = (2.5 / (2 * Math.tan(fov / 2))) * 1.8;
    camera.position.set(0, 0.3, Math.max(dist, 3.5));
    camera.lookAt(0, 0, 0);
    framedRef.current = true;
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
