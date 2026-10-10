"use client";

import { useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function EarthSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* 
        Using MeshDistortMaterial to give it a slightly organic, stylized look. 
        It reacts to light beautifully, giving that AAA game feel.
      */}
      <Sphere args={[2.5, 64, 64]}>
        <MeshDistortMaterial
          color="#A8E6CF"
          attach="material"
          distort={0.1}
          speed={1.5}
          roughness={0.4}
          metalness={0.1}
        />
      </Sphere>

      {/* Atmospheric Glow */}
      <Sphere args={[2.7, 32, 32]}>
        <meshBasicMaterial color="#43C97B" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
      </Sphere>
    </mesh>
  );
}

export function ThreeEarth() {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#F7FFF8" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#79C8FF" />
        <EarthSphere />
      </Canvas>
    </div>
  );
}
