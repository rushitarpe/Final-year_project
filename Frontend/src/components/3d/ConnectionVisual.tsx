import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface ConnectionVisualProps {
    count?: number;
}

interface NodeData {
    position: THREE.Vector3;
    isMentor: boolean;
}

export const ConnectionVisual = ({ count = 10 }: ConnectionVisualProps) => {
    const groupRef = useRef<THREE.Group>(null);

    // Create random nodes (mentors and mentees)
    const nodes = useMemo(() => {
        const temp: NodeData[] = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            const isMentor = Math.random() > 0.5;
            temp.push({ position: new THREE.Vector3(x, y, z), isMentor });
        }
        return temp;
    }, [count]);

    // Create connections between mentors and mentees
    const connections = useMemo(() => {
        const temp: [THREE.Vector3, THREE.Vector3][] = [];
        const mentors = nodes.filter(n => n.isMentor);
        const mentees = nodes.filter(n => !n.isMentor);

        // Connect each mentee to 1-2 random mentors
        mentees.forEach(mentee => {
            const numConnections = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < numConnections; i++) {
                if (mentors.length > 0) {
                    const randomMentor = mentors[Math.floor(Math.random() * mentors.length)];
                    temp.push([mentee.position, randomMentor.position]);
                }
            }
        });
        return temp;
    }, [nodes]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Nodes */}
            {nodes.map((node, i) => (
                <Sphere key={i} args={[node.isMentor ? 0.2 : 0.15, 16, 16]} position={node.position}>
                    <meshStandardMaterial
                        color={node.isMentor ? "#f59e0b" : "#38bdf8"}
                        emissive={node.isMentor ? "#f59e0b" : "#0ea5e9"}
                        emissiveIntensity={0.5}
                    />
                </Sphere>
            ))}

            {/* Connection Lines */}
            {connections.map((line, i) => (
                <Line
                    key={`line-${i}`}
                    points={line as [THREE.Vector3, THREE.Vector3]}
                    color="#94a3b8"
                    opacity={0.3}
                    transparent
                    lineWidth={1}
                />
            ))}
        </group>
    );
};
