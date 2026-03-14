import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import * from 'three';





export const ConnectionVisual = ({ count = 10 }) => {
    const groupRef = useRef(null);

    // Create random nodes (mentors and mentees)
    const nodes = useMemo(() => {
        const temp = [];
        for (let i = 0; i  0.5;
            temp.push({ position THREE.Vector3(x, y, z), isMentor });
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
            for (let i = 0; i  0) {
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
                <Sphere key={i} args={[node.isMentor ? 0.2 , 16, 16]} position={node.position}>
                    <meshStandardMaterial
                        color={node.isMentor ? "#f59e0b" : "#38bdf8"}
                        emissive={node.isMentor ? "#f59e0b" : "#0ea5e9"}
                        emissiveIntensity={0.5}
                    />
                
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
        
    );
};
