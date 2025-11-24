import React, { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';

interface CircularSpectrumProps {
  size: number;
  audioLevel: MotionValue<number>;
  isActive: boolean;
  color: string;
  barCount?: number;
}

const CircularSpectrum: React.FC<CircularSpectrumProps> = ({ 
  size, 
  audioLevel, 
  isActive, 
  color,
  barCount = 24 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const barsRef = useRef<SVGRectElement[]>([]);

  useEffect(() => {
    if (!isActive || !svgRef.current) return;

    let animationFrameId: number;

    const updateSpectrum = () => {
      const level = audioLevel.get();
      if (level === 0) {
        // Hide all bars
        barsRef.current.forEach(bar => {
          if (bar) bar.setAttribute('opacity', '0');
        });
        animationFrameId = requestAnimationFrame(updateSpectrum);
        return;
      }

      const radius = size / 2;
      // Increased base bar length - much more visible
      const minBarLength = size * 0.12; // Minimum visible height even at low levels
      const baseBarLength = size * 0.25; // Base height for medium levels
      const maxBarLength = size * 0.6; // Maximum extension for high levels
      const spacing = (Math.PI * 2) / barCount;
      const barWidth = (Math.PI * 2 * radius) / barCount; // Width to cover full arc with no gaps
      const time = Date.now() * 0.005; // Slower animation

      // Use exponential scaling for more dramatic response to higher levels
      // Power function makes peaks much more pronounced
      const intensity = Math.pow(level, 1.3); // Exponential scaling for intensity

      barsRef.current.forEach((bar, index) => {
        if (!bar) return;

        // Create variation in bar heights to simulate frequency bands
        // More dramatic variation for visible peaks
        const variation = Math.sin(index * 0.5 + time) * 0.4 + 0.6; // Wider range (0.2 to 1.0)
        // Scale bar height with intensity - always visible, extends dramatically at high levels
        const barHeight = minBarLength + (intensity * (maxBarLength - minBarLength) * variation);

        const angle = (index * spacing) - (Math.PI / 2); // Start from top
        const centerX = radius + radius * Math.cos(angle);
        const centerY = radius + radius * Math.sin(angle);
        
        // Calculate rectangle position and rotation
        const x = centerX - barWidth / 2;
        const y = centerY;
        const rotation = (angle * 180) / Math.PI + 90; // Convert to degrees and adjust

        bar.setAttribute('x', x.toString());
        bar.setAttribute('y', y.toString());
        bar.setAttribute('width', barWidth.toString());
        bar.setAttribute('height', barHeight.toString());
        bar.setAttribute('transform', `rotate(${rotation} ${centerX} ${centerY})`);
        // Opacity scales with intensity - always visible, brighter at higher levels
        // Base opacity of 0.7 ensures visibility, scales up to 1.0 at peak
        const opacity = Math.min(1, 0.7 + intensity * 0.3);
        bar.setAttribute('opacity', opacity.toString());
      });

      animationFrameId = requestAnimationFrame(updateSpectrum);
    };

    updateSpectrum(); // Start animation

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isActive, audioLevel, size, barCount]);

  if (!isActive) return null;

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className="absolute inset-0 pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      {Array.from({ length: barCount }).map((_, index) => (
        <rect
          key={index}
          ref={(el) => {
            if (el) barsRef.current[index] = el;
          }}
          x={size / 2}
          y={size / 2}
          width="0"
          height="0"
          fill={color}
          opacity="0"
        />
      ))}
    </svg>
  );
};

export default CircularSpectrum;
