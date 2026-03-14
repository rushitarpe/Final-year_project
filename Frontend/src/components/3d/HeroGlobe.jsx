/* eslint-disable react/no-unknown-property */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Ring, Torus } from '@react-three/drei';
import * as THREE from 'three';

export const HeroGlobe = () => {
    const sphereRef = useRef(null);
    const ring1Ref = useRef(null);
    const ring2Ref = useRef(null);
    const outerGlowRef = useRef(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (sphereRef.current) {
            sphereRef.current.rotation.y = t * 0.15;
            sphereRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
        }
        if (ring1Ref.current) {
            ring1Ref.current.rotation.z = t * 0.4;
            ring1Ref.current.rotation.x = 0.4;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.z = -t * 0.25;
            ring2Ref.current.rotation.y = 0.6;
        }
        if (outerGlowRef.current) {
            outerGlowRef.current.rotation.y = t * 0.1;
            const s = 1 + Math.sin(t * 0.8) * 0.04;
            outerGlowRef.current.scale.set(s, s, s);
        }
    });

    return (
        <group position={[1.5, 0, 0]}>
            {/* Lights */}
            <ambientLight intensity={0.3} />
            <pointLight position={[-8, 6, 4]} color="#8b5cf6" intensity={6} />
            <pointLight position={[8, -6, -4]} color="#06b6d4" intensity={5} />
            <pointLight position={[0, 10, 0]} color="#a78bfa" intensity={3} />
            <pointLight position={[0, 0, 6]} color="#7c3aed" intensity={2} />

            {/* Outer glow sphere */}
            <Sphere ref={outerGlowRef} args={[2.1, 32, 32]}>
                <meshBasicMaterial color="#6d28d9" transparent opacity={0.06} side={THREE.BackSide} />
            </Sphere>

            {/* Main distorted globe */}
            <Sphere ref={sphereRef} args={[1.6, 128, 128]}>
                <MeshDistortMaterial
                    color="#5b21b6"
                    attach="material"
                    distort={0.35}
                    speed={2}
                    roughness={0.05}
                    metalness={0.95}
                    envMapIntensity={2}
                />
            </Sphere>

            {/* Inner core glow */}
            <Sphere args={[0.8, 32, 32]}>
                <meshBasicMaterial color="#a78bfa" transparent opacity={0.12} />
            </Sphere>

            {/* Orbit ring 1 */}
            <Torus ref={ring1Ref} args={[2.3, 0.015, 16, 200]}>
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
            </Torus>

            {/* Orbit ring 2 */}
            <Torus ref={ring2Ref} args={[2.7, 0.01, 16, 200]}>
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
            </Torus>

            {/* Dotted equator ring */}
            <Ring args={[1.95, 1.97, 128]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#7c3aed" transparent opacity={0.4} side={THREE.DoubleSide} />
            </Ring>
        </group>
    );
};
