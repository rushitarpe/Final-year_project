import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const HeroGlobe = () => {
    const sphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (sphereRef.current) {
            sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
            sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <group>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <pointLight position={[-10, -10, -5]} color="#0ea5e9" intensity={2} />
            <pointLight position={[10, -10, 5]} color="#38bdf8" intensity={2} />

            <Sphere ref={sphereRef} args={[1.5, 64, 64]} scale={0.9}>
                <MeshDistortMaterial
                    color="#0ea5e9"
                    attach="material"
                    distort={0.3}
                    speed={1.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </group>
    );
};
