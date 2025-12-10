'use client';

import { useEffect, useRef, useState } from 'react';

// Particle class for the energy field
class Particle {
    x: number;
    y: number;
    z: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
    alpha: number;

    constructor(width: number, height: number) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.z = Math.random() * 100;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
    }

    update(width: number, height: number, centerX: number, centerY: number) {
        // Gentle drift toward center
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 50) {
            this.speedX += dx * 0.00005;
            this.speedY += dy * 0.00005;
        }

        this.x += this.speedX;
        this.y += this.speedY;

        // Boundary wrap
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Shimmer
        this.alpha = Math.max(0.1, Math.min(0.6, this.alpha + (Math.random() - 0.5) * 0.02));
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

export default function BackgroundEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const particles: Particle[] = [];
        const particleCount = 150;
        let time = 0;

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(width, height));
        }

        // Core energy object position
        const coreX = width * 0.35;
        const coreY = height * 0.5;

        const animate = () => {
            time += 0.01;

            // Camera breathing effect
            const breathX = Math.sin(time * 0.5) * 3;
            const breathY = Math.cos(time * 0.3) * 2;
            setCameraOffset({ x: breathX, y: breathY });

            // Clear with fade effect
            ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
            ctx.fillRect(0, 0, width, height);

            // Draw volumetric cloud gradients
            const gradient1 = ctx.createRadialGradient(
                width * 0.2 + breathX * 5, height * 0.3 + breathY * 5, 0,
                width * 0.2 + breathX * 5, height * 0.3 + breathY * 5, 400
            );
            gradient1.addColorStop(0, 'rgba(79, 70, 229, 0.1)');
            gradient1.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
            gradient1.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient1;
            ctx.fillRect(0, 0, width, height);

            const gradient2 = ctx.createRadialGradient(
                width * 0.7 - breathX * 5, height * 0.7 - breathY * 5, 0,
                width * 0.7 - breathX * 5, height * 0.7 - breathY * 5, 350
            );
            gradient2.addColorStop(0, 'rgba(192, 38, 211, 0.08)');
            gradient2.addColorStop(0.5, 'rgba(168, 85, 247, 0.04)');
            gradient2.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient2;
            ctx.fillRect(0, 0, width, height);

            // Draw and update particles
            particles.forEach(p => {
                p.update(width, height, coreX, coreY);
                p.draw(ctx);
            });

            // Draw connecting lines between close particles
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.03)';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[j].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw energy core (rotating icosahedron-like shape)
            drawEnergyCore(ctx, coreX + breathX * 2, coreY + breathY * 2, time);

            // Energy pulse rings
            drawEnergyPulse(ctx, coreX + breathX * 2, coreY + breathY * 2, time);

            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        };

        const drawEnergyCore = (ctx: CanvasRenderingContext2D, x: number, y: number, t: number) => {
            const size = 80;
            const vertices = 12;

            ctx.save();
            ctx.translate(x, y);

            // Outer wireframe
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
            ctx.lineWidth = 1.5;

            for (let i = 0; i < vertices; i++) {
                const angle1 = (i / vertices) * Math.PI * 2 + t * 0.3;
                const angle2 = ((i + 1) / vertices) * Math.PI * 2 + t * 0.3;
                const r1 = size * (0.8 + Math.sin(t * 2 + i) * 0.2);
                const r2 = size * (0.8 + Math.sin(t * 2 + i + 1) * 0.2);

                const x1 = Math.cos(angle1) * r1;
                const y1 = Math.sin(angle1) * r1 * 0.6;
                const x2 = Math.cos(angle2) * r2;
                const y2 = Math.sin(angle2) * r2 * 0.6;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                // Inner connections
                ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(x1, y1);
                ctx.stroke();
            }

            // Inner glow
            const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
            innerGlow.addColorStop(0, 'rgba(167, 139, 250, 0.4)');
            innerGlow.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
            innerGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = innerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        const drawEnergyPulse = (ctx: CanvasRenderingContext2D, x: number, y: number, t: number) => {
            for (let i = 0; i < 3; i++) {
                const phase = (t + i * 0.5) % 2;
                const radius = phase * 150;
                const alpha = Math.max(0, 0.3 - phase * 0.15);

                ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.stroke();
            }
        };

        animate();

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div
            className="fixed inset-0 z-0 bg-[#050505]"
            style={{
                transform: `translate(${cameraOffset.x}px, ${cameraOffset.y}px)`,
                transition: 'transform 0.1s ease-out'
            }}
        >
            <canvas ref={canvasRef} className="w-full h-full" />
            {/* Overlay gradient for content blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>
    );
}
