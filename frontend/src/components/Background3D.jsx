import React, { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// Elegant soft bokeh / floating orbs
function FloatingOrbs({ count = 18 }) {
  const groupRef = useRef();
  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 10 - 3,
      ],
      scale: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.15 + 0.05,
      color: i % 3 === 0 ? '#c9a96e' : i % 3 === 1 ? '#8b7355' : '#d4c5a9',
      opacity: Math.random() * 0.12 + 0.04,
    }));
  }, [count]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed * 4} rotationIntensity={0.1} floatIntensity={0.6}>
          <mesh position={orb.position}>
            <sphereGeometry args={[orb.scale, 32, 32]} />
            <meshStandardMaterial
              color={orb.color}
              transparent
              opacity={orb.opacity}
              roughness={0.8}
              metalness={0.3}
              emissive={orb.color}
              emissiveIntensity={0.15}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// Subtle dust particles (very sparse and gentle)
function DustParticles({ count = 60 }) {
  const pointsRef = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.006;
      pointsRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#c9a96e"
        transparent
        opacity={0.3}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// Gentle camera drift (very subtle)
function CameraRig() {
  useFrame((state) => {
    const targetX = state.mouse.x * 0.3;
    const targetY = state.mouse.y * 0.2;
    state.camera.position.x += (targetX - state.camera.position.x) * 0.015;
    state.camera.position.y += (targetY - state.camera.position.y) * 0.015;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

// Fallback gradient
function FallbackBackground() {
  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: 'radial-gradient(ellipse at 30% 20%, #1a1510 0%, #0d0b08 50%, #080604 100%)',
      }}
      aria-hidden="true"
    />
  );
}

export default function Background3D({ className = '' }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ willChange: 'transform' }}
    >
      {/* Base warm dark gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse at 40% 20%, #1a1510 0%, #0f0c09 40%, #080604 100%)',
        }}
      />

      {/* 3D Scene - Simple & Elegant */}
      <Suspense fallback={<FallbackBackground />}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.25} color="#f5e6d3" />
          <pointLight position={[10, 8, 8]} intensity={0.6} color="#c9a96e" />
          <pointLight position={[-8, -6, -4]} intensity={0.3} color="#8b7355" />

          <FloatingOrbs count={16} />
          <DustParticles count={50} />
          <CameraRig />
        </Canvas>
      </Suspense>

      {/* Soft vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(8,6,4,0.6) 100%)',
        }}
      />
    </div>
  );
}
