import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // We can access the MotionValue directly, but since we are in a React component
  // that renders a Canvas and runs its own loop, we can just get the context.
  // However, getting the value inside the loop requires the context to be available in closure.
  const { audioLevel } = usePlayer();
  const audioLevelRef = useRef(audioLevel);

  useEffect(() => {
    audioLevelRef.current = audioLevel;
  }, [audioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }> = [];

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 20 : 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        vy: (Math.random() - 0.5) * (isMobile ? 0.3 : 0.5),
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 240, // Purple to blue range
      });
    }

    const animate = () => {
      // Get current audio level for this frame
      // Note: audioLevel is a MotionValue, so .get() is fast and doesn't trigger React render
      const level = audioLevelRef.current ? audioLevelRef.current.get() : 0;
      const speedMultiplier = 1 + level * 0.8; // Particles move faster with music
      const sizeMultiplier = 1 + level * 0.2; // Particles pulse slightly

      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use squared distance to avoid Math.sqrt calls
      const connectionDistance = 150;
      const connectionDistanceSq = connectionDistance * connectionDistance;

      particles.forEach((particle, i) => {
        particle.x += particle.vx * speedMultiplier;
        particle.y += particle.vy * speedMultiplier;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle with glow
        ctx.beginPath();
        const currentSize = particle.size * sizeMultiplier;
        
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, currentSize * 3
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        // Optimization: Only check particles that can possibly be in range (simple spatial partitioning is overkill for 50, but simple bounds checks help)
        for (let j = i + 1; j < particles.length; j++) {
          const otherParticle = particles[j];
          const dx = particle.x - otherParticle.x;
          // Quick check before expensive math
          if (Math.abs(dx) > connectionDistance) continue;
          
          const dy = particle.y - otherParticle.y;
          if (Math.abs(dy) > connectionDistance) continue;

          const distanceSq = dx * dx + dy * dy;

          if (distanceSq < connectionDistanceSq) {
            ctx.beginPath();
            // Approximation of distance for opacity calculation to avoid sqrt if possible, 
            // but we need linear opacity fade. sqrt is unavoidable for linear fade unless we change the visual style.
            // We can use (1 - distanceSq / connectionDistanceSq) for a quadratic fade which is faster and looks fine.
            const alpha = 0.1 * (1 - distanceSq / connectionDistanceSq) * (1 + level * 0.5); // Lines get brighter with music
            ctx.strokeStyle = `hsla(${particle.hue}, 70%, 60%, ${Math.min(1, alpha)})`;
            ctx.lineWidth = 0.5 + level * 0.2; // Lines get thicker
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty deps means this runs once, but we use ref for audioLevel access

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none opacity-40"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
