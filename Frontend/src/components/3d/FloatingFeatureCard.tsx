import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';

interface CardProps {
    position: [number, number, number];
    title: string;
    delay?: number;
    color?: string;
}

export const FloatingFeatureCard = ({ position, title, delay = 0, color = "#0ea5e9" }: CardProps) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Add a slight gentle sway to the cards in addition to the Float
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.05;
        }
    });

    return (
        <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={1}
            position={position}
        >
            <group ref={groupRef}>
                <mesh ref={meshRef}>
                    <boxGeometry args={[3, 1, 0.1]} />
                    <meshPhysicalMaterial
                        color={color}
                        transparent
                        opacity={0.7}
                        roughness={0.1}
                        metalness={0.5}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                    />
                </mesh>
                <Text
                    position={[0, 0, 0.1]}
                    fontSize={0.25}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    maxWidth={2.8}
                >
                    {title}
                </Text>
            </group>
        </Float>
    );
};
