/* eslint-disable react/no-unknown-property */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Particles = ({ count = 500 }) => {
    const mesh = useRef(null);

    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100;
            const factor = 20 + Math.random() * 100;
            const speed = 0.01 + Math.random() / 200;
            const xFactor = -50 + Math.random() * 100;
            const yFactor = -50 + Math.random() * 100;
            const zFactor = -50 + Math.random() * 100;
            const mx = 0;
            const my = 0;
            temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx, my });
        }
        return temp;
    }, [count]);

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = particles[i].xFactor;
            pos[i * 3 + 1] = particles[i].yFactor;
            pos[i * 3 + 2] = particles[i].zFactor;
        }
        return pos;
    }, [count, particles]);

    useFrame((state) => {
        particles.forEach((particle) => {
            let { t, factor, speed, xFactor, yFactor, zFactor } = particle;
            t = particle.t += speed / 2;
            const a = Math.cos(t) + Math.sin(t * 1) / 10;
            const b = Math.sin(t) + Math.cos(t * 2) / 10;
            const s = Math.cos(t);

            dummy.position.set(
                (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            );
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
        });

        if (mesh.current) {
            mesh.current.rotation.x = state.clock.getElapsedTime() * 0.05;
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.03;
        }
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={positions.length / 3}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.1} color="#38bdf8" sizeAttenuation transparent opacity={0.6} />
        </points>
    );
};
