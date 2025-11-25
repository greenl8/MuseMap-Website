import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { usePlayer } from '../context/PlayerContext';

// Generate gaussian random number using Box-Muller transform
const gaussianRandom = (mean: number = 0, stdDev: number = 1): number => {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
};

// Particle interface
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
  size: number;
  opacity: number;
  baseColor: THREE.Color;
  hueOffset: number; // Offset for cycling through tritone hues
  saturation: number; // Stored saturation value
  lightness: number; // Stored lightness value
}

// Gaussian Particle Field Component
// Trail particle interface
interface TrailParticle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  targetVelocity: THREE.Vector3; // Target velocity for smooth easing
  hueOffset: number;
  saturation: number;
  lightness: number;
  lastDirectionChange: number;
}

const GaussianParticleField: React.FC<{ audioLevel: number }> = ({ audioLevel }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const previousSizesRef = useRef<Float32Array | null>(null);
  const trailParticleRef = useRef<TrailParticle | null>(null);
  const trailPositionsRef = useRef<THREE.Vector3[]>([]);
  
  const particleCount = 8000;
  const trailLength = 500; // Number of trail segments (increased for longer trail)
  const spreadRadius = 8;
  const gaussianStdDev = 2.5;

  // Initialize trail particle
  useEffect(() => {
    if (!trailParticleRef.current) {
      const initialPos = new THREE.Vector3(
        (Math.random() - 0.5) * spreadRadius * 0.5,
        (Math.random() - 0.5) * spreadRadius * 0.5,
        (Math.random() - 0.5) * spreadRadius * 0.5
      );
      const initialVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      ).normalize().multiplyScalar(0.06); // Slower speed for smoother movement
      
      trailParticleRef.current = {
        position: initialPos.clone(),
        velocity: initialVelocity.clone(),
        targetVelocity: initialVelocity.clone(), // Start with same velocity as target
        hueOffset: Math.random(),
        saturation: 0.9, // More saturated
        lightness: 0.7, // Brighter
        lastDirectionChange: 0,
      };
      // Initialize trail positions
      for (let i = 0; i < trailLength; i++) {
        trailPositionsRef.current.push(initialPos.clone());
      }
    }
  }, []);

  // Initialize particles with gaussian distribution
  const { positions, sizes, colors, opacities } = useMemo(() => {
    const totalParticles = particleCount + trailLength;
    const positions = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const colors = new Float32Array(totalParticles * 3);
    const opacities = new Float32Array(totalParticles);
    
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Generate gaussian-distributed positions
      const x = gaussianRandom(0, gaussianStdDev);
      const y = gaussianRandom(0, gaussianStdDev);
      const z = gaussianRandom(0, gaussianStdDev);
      
      // Clamp to spread radius
      const distance = Math.sqrt(x * x + y * y + z * z);
      const clampedDistance = Math.min(distance, spreadRadius);
      const scale = clampedDistance / distance;
      
      const px = x * scale;
      const py = y * scale;
      const pz = z * scale;

      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;

      // Base size varies with distance from center (gaussian falloff)
      const normalizedDistance = clampedDistance / spreadRadius;
      const gaussianWeight = Math.exp(-(normalizedDistance * normalizedDistance) / 0.5);
      sizes[i] = 0.02 + gaussianWeight * 0.08;

      // Generate initial color from tritone palette (yellow, blue, purple)
      // Each particle starts at a random position in the tritone cycle
      const hueOffset = Math.random(); // Random starting position (0-1)
      // Tritone hues: Yellow (~0.17), Blue (~0.67), Purple (~0.83)
      const yellowHue = 0.17;
      const blueHue = 0.67;
      const purpleHue = 0.83;
      
      // Start with one of the tritone colors based on hueOffset
      let initialHue = yellowHue;
      if (hueOffset < 0.33) {
        initialHue = yellowHue;
      } else if (hueOffset < 0.67) {
        initialHue = blueHue;
      } else {
        initialHue = purpleHue;
      }
      
      const saturation = 0.7 + Math.random() * 0.3; // 0.7-1.0 saturation
      const lightness = 0.5 + Math.random() * 0.2; // 0.5-0.7 lightness
      const baseColor = new THREE.Color().setHSL(initialHue, saturation, lightness);
      
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;

      // Opacity based on gaussian distribution
      opacities[i] = 0.3 + gaussianWeight * 0.7;

      // Store particle data for animation
      particles.push({
        position: new THREE.Vector3(px, py, pz),
        velocity: new THREE.Vector3(
          gaussianRandom(0, 0.02),
          gaussianRandom(0, 0.02),
          gaussianRandom(0, 0.02)
        ),
        basePosition: new THREE.Vector3(px, py, pz),
        size: sizes[i],
        opacity: opacities[i],
        baseColor: baseColor.clone(), // Store initial color for this particle
        hueOffset: hueOffset, // Store hue offset for cycling
        saturation: saturation, // Store saturation
        lightness: lightness, // Store lightness
      });
    }

    // Initialize trail particles (will be updated in useFrame)
    const trailStartIndex = particleCount;
    for (let i = 0; i < trailLength; i++) {
      const idx = trailStartIndex + i;
      // Initial positions will be set in useFrame based on trail positions
      positions[idx * 3] = 0;
      positions[idx * 3 + 1] = 0;
      positions[idx * 3 + 2] = 0;
      sizes[idx] = 0.03; // Slightly larger trail particles
      colors[idx * 3] = 0.5;
      colors[idx * 3 + 1] = 0.5;
      colors[idx * 3 + 2] = 0.5;
      opacities[idx] = 0.1; // Low initial opacity
    }

    particlesRef.current = particles;
    return { positions, sizes, colors, opacities };
  }, []);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    geom.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
    // Initialize previous sizes for smoothing
    previousSizesRef.current = new Float32Array(sizes);
    return geom;
  }, [positions, sizes, colors, opacities]);

  useFrame((_, delta) => {
    if (!pointsRef.current || !geometry) return;

    timeRef.current += delta;
    const time = timeRef.current;

    // Normalize audio level (0-1 range)
    const normalizedAudioLevel = Math.min(Math.max(audioLevel, 0), 1);

    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const sizeAttribute = geometry.attributes.size as THREE.BufferAttribute;
    const opacityAttribute = geometry.attributes.opacity as THREE.BufferAttribute;
    const colorAttribute = geometry.attributes.customColor as THREE.BufferAttribute;

    const particles = particlesRef.current;

    for (let i = 0; i < particleCount; i++) {
      const particle = particles[i];
      
      // Calculate distance from center (normalized 0-1)
      const distanceFromCenter = particle.basePosition.length();
      const normalizedDistance = Math.min(distanceFromCenter / spreadRadius, 1);
      
      // Intensity multiplier: stronger at center, weaker at edges
      // Using gentler falloff so outer particles react more
      const intensityMultiplier = Math.exp(-normalizedDistance * 1.2); // 1.0 at center, ~0.30 at edge (was ~0.08)
      
      // Wave delay: outer particles react later (delay based on distance)
      // Create a wave effect that propagates outward from center
      const waveSpeed = 2.5; // Speed of wave propagation (higher = faster wave)
      const waveDelay = normalizedDistance * waveSpeed; // Delay increases with distance
      // Simulate wave propagation by using time offset
      // Outer particles see the audio reaction later, creating a ripple effect
      const delayedTime = time - waveDelay;
      // Create wave modulation based on delayed time and audio level
      const waveModulation = Math.sin(delayedTime * 4.0 + normalizedAudioLevel * 8.0) * 0.5 + 0.5;
      
      // Apply intensity multiplier and wave delay to audio level
      // Center particles react immediately and strongly, outer particles follow with delay
      // Increased base reactivity and reduced wave modulation impact for more consistent outer particle reaction
      const delayedAudioLevel = normalizedAudioLevel * intensityMultiplier * (0.6 + 0.4 * waveModulation);
      
      // Smooth drift motion only (no audio-driven movement)
      const driftSpeed = 0.3;
      const driftX = Math.sin(time * driftSpeed + particle.basePosition.x * 0.1) * 0.3;
      const driftY = Math.cos(time * driftSpeed * 0.8 + particle.basePosition.y * 0.1) * 0.3;
      const driftZ = Math.sin(time * driftSpeed * 0.6 + particle.basePosition.z * 0.1) * 0.2;
      
      // Calculate new position (only drift, no audio expansion)
      const newX = particle.basePosition.x + driftX;
      const newY = particle.basePosition.y + driftY;
      const newZ = particle.basePosition.z + driftZ;

      positionAttribute.setXYZ(i, newX, newY, newZ);

      // Cycle through tritone hues (yellow, blue, purple) slowly over time
      const cycleSpeed = 0.1; // Speed of hue cycling (slower = more gradual)
      const cyclePosition = ((time * cycleSpeed + particle.hueOffset) % 3) / 3; // 0-1 cycle through 3 colors
      
      // Tritone hues: Yellow (~0.17), Blue (~0.67), Purple (~0.83)
      const yellowHue = 0.17;
      const blueHue = 0.67;
      const purpleHue = 0.83;
      
      // Interpolate between tritone colors based on cycle position
      let currentHue: number;
      if (cyclePosition < 0.33) {
        // Yellow to Blue
        const t = cyclePosition / 0.33;
        currentHue = yellowHue + (blueHue - yellowHue) * t;
      } else if (cyclePosition < 0.67) {
        // Blue to Purple
        const t = (cyclePosition - 0.33) / 0.34;
        currentHue = blueHue + (purpleHue - blueHue) * t;
      } else {
        // Purple back to Yellow (wrapping around)
        const t = (cyclePosition - 0.67) / 0.33;
        // Handle wrap-around: purple to yellow goes through 1.0
        const purpleToYellow = (1.0 - purpleHue) + yellowHue;
        currentHue = purpleHue + purpleToYellow * t;
        if (currentHue > 1.0) currentHue -= 1.0;
      }
      
      // Get base color from HSL with cycling hue
      const baseColor = new THREE.Color().setHSL(currentHue, particle.saturation, particle.lightness);
      
      // Audio reactivity: adjust color brightness while preserving saturation
      // Apply distance-based intensity and wave delay
      const colorMix = Math.min(delayedAudioLevel * 1.2, 1.0); // Amplify and clamp to 0-1
      
      // Interpolate between dark and bright versions while preserving color hue
      // Low audio: darker version (0.3x), High audio: full brightness (1.0x)
      const darkColor = new THREE.Color(
        baseColor.r * 0.3,
        baseColor.g * 0.3,
        baseColor.b * 0.3
      );
      const brightColor = new THREE.Color(
        baseColor.r,
        baseColor.g,
        baseColor.b
      );
      
      // Interpolate between dark and bright to preserve color saturation
      const finalColor = new THREE.Color().lerpColors(darkColor, brightColor, colorMix);
      
      // Size increases with audio level - brighter particles get much larger
      // Base size + audio-reactive size increase (up to 3x larger at max audio)
      const targetSizeMultiplier = 1.0 + (colorMix * 2.0); // 1.0x to 3.0x size
      const targetSize = particle.size * targetSizeMultiplier;
      
      // Smooth size transitions for fluid animation
      const smoothingFactor = 0.15; // Lower = smoother but slower response
      const previousSize = previousSizesRef.current ? previousSizesRef.current[i] : particle.size;
      const smoothedSize = previousSize + (targetSize - previousSize) * smoothingFactor;
      
      sizeAttribute.setX(i, smoothedSize);
      
      // Update previous size for next frame
      if (previousSizesRef.current) {
        previousSizesRef.current[i] = smoothedSize;
      }

      // Keep opacity static (no audio pulsing)
      opacityAttribute.setX(i, particle.opacity);
      
      colorAttribute.setXYZ(i, finalColor.r, finalColor.g, finalColor.b);
    }

    // Update trail particle
    if (trailParticleRef.current && trailPositionsRef.current.length > 0) {
      const trailParticle = trailParticleRef.current;
      const trailStartIndex = particleCount;
      
      // Change target direction randomly (every 3-5 seconds) with smooth easing
      if (time - trailParticle.lastDirectionChange > 3 + Math.random() * 2) {
        trailParticle.targetVelocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ).normalize().multiplyScalar(0.06); // Slower speed
        trailParticle.lastDirectionChange = time;
      }
      
      // Smoothly ease velocity towards target velocity with significant easing
      const easingFactor = 0.08; // Lower = smoother easing (0.08 = very smooth, gradual transition)
      const velocityDiff = trailParticle.targetVelocity.clone().sub(trailParticle.velocity);
      trailParticle.velocity.add(velocityDiff.multiplyScalar(easingFactor));
      
      // Update trail particle position
      trailParticle.position.add(trailParticle.velocity.clone().multiplyScalar(delta * 60));
      
      // Keep trail particle within bounds
      const distance = trailParticle.position.length();
      if (distance > spreadRadius) {
        trailParticle.position.normalize().multiplyScalar(spreadRadius);
        const normal = trailParticle.position.clone().normalize();
        // Bounce back both velocity and target velocity
        trailParticle.velocity.reflect(normal);
        trailParticle.targetVelocity.reflect(normal);
      }
      
      // Update trail positions (shift array, add new position at front)
      trailPositionsRef.current.pop(); // Remove oldest
      trailPositionsRef.current.unshift(trailParticle.position.clone()); // Add newest at front
      
      // Update trail particle colors (cycle through tritone hues)
      const cycleSpeed = 0.1;
      const cyclePosition = ((time * cycleSpeed + trailParticle.hueOffset) % 3) / 3;
      const yellowHue = 0.17;
      const blueHue = 0.67;
      const purpleHue = 0.83;
      
      let currentHue: number;
      if (cyclePosition < 0.33) {
        const t = cyclePosition / 0.33;
        currentHue = yellowHue + (blueHue - yellowHue) * t;
      } else if (cyclePosition < 0.67) {
        const t = (cyclePosition - 0.33) / 0.34;
        currentHue = blueHue + (purpleHue - blueHue) * t;
      } else {
        const t = (cyclePosition - 0.67) / 0.33;
        const purpleToYellow = (1.0 - purpleHue) + yellowHue;
        currentHue = purpleHue + purpleToYellow * t;
        if (currentHue > 1.0) currentHue -= 1.0;
      }
      
      const trailBaseColor = new THREE.Color().setHSL(currentHue, trailParticle.saturation, trailParticle.lightness);
      
      // Update trail particles in geometry
      for (let i = 0; i < trailLength; i++) {
        const idx = trailStartIndex + i;
        const trailPos = trailPositionsRef.current[i];
        
        // Update position
        positionAttribute.setXYZ(idx, trailPos.x, trailPos.y, trailPos.z);
        
        // Fade opacity along trail (newer = brighter, much more visible)
        const fadeFactor = 1.0 - (i / trailLength);
        // Much higher opacity - trail head is fully opaque, tail fades
        opacityAttribute.setX(idx, Math.max(0.3, fadeFactor * 1.0));
        
        // Update color (same hue cycling as main particle)
        colorAttribute.setXYZ(idx, trailBaseColor.r, trailBaseColor.g, trailBaseColor.b);
        
        // Much larger size for visibility - trail head is largest
        const sizeMultiplier = 0.15 + (fadeFactor * 0.25); // 0.15 to 0.4 size
        sizeAttribute.setX(idx, sizeMultiplier);
      }
      
      // Make the trail particle itself visible and prominent
      const trailParticleIdx = trailStartIndex; // First trail particle is the actual particle
      positionAttribute.setXYZ(trailParticleIdx, trailParticle.position.x, trailParticle.position.y, trailParticle.position.z);
      opacityAttribute.setX(trailParticleIdx, 1.0); // Fully opaque
      colorAttribute.setXYZ(trailParticleIdx, trailBaseColor.r, trailBaseColor.g, trailBaseColor.b);
      sizeAttribute.setX(trailParticleIdx, 0.5); // Much larger - very visible
    }

    positionAttribute.needsUpdate = true;
    sizeAttribute.needsUpdate = true;
    opacityAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;

    // Slow rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005;
      pointsRef.current.rotation.x += 0.0003;
    }
  });

  // Custom shader material for particles
  const material = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        audioLevel: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute vec3 customColor;
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          vColor = customColor;
          vOpacity = opacity;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Soft circular particle with gaussian falloff
          float alpha = vOpacity * (1.0 - smoothstep(0.0, 0.5, dist));
          
          // Add subtle glow
          float glow = exp(-dist * dist * 8.0) * 0.5;
          
          gl_FragColor = vec4(vColor + vec3(glow * 0.3), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    return mat;
  }, []);

  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Camera Controller Component
const CameraController: React.FC<{ audioLevel: number }> = ({ audioLevel }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const timeRef = useRef(0);
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const targetRadiusRef = useRef(6); // Closer to particle field for submerged effect
  const currentRadiusRef = useRef(6); // Closer to particle field for submerged effect
  const targetHeightRef = useRef(0);
  const currentHeightRef = useRef(0);
  const currentNudgeRef = useRef(0); // Smooth nudge amount
  
  useFrame((_, delta) => {
    if (!cameraRef.current) return;
    
    timeRef.current += delta;
    const time = timeRef.current;

    // Smooth orbital rotation around center
    const orbitSpeed = 0.15; // Speed of rotation (slower = smoother)
    targetAngleRef.current += orbitSpeed * delta;
    
    // Smooth easing for angle
    const angleDiff = targetAngleRef.current - currentAngleRef.current;
    currentAngleRef.current += angleDiff * 0.05; // Smooth interpolation
    
    // Vary height slightly for more interesting movement
    targetHeightRef.current = Math.sin(time * 0.3) * 2; // Slow vertical movement
    const heightDiff = targetHeightRef.current - currentHeightRef.current;
    currentHeightRef.current += heightDiff * 0.1; // Smooth height interpolation
    
    // Vary radius slightly (around the closer base distance)
    targetRadiusRef.current = 6 + Math.sin(time * 0.2) * 1.0; // Slight zoom in/out around closer position
    const radiusDiff = targetRadiusRef.current - currentRadiusRef.current;
    currentRadiusRef.current += radiusDiff * 0.1; // Smooth radius interpolation
    
    // Audio-reactive nudging to the right (more subtle)
    const audioIntensity = Math.pow(audioLevel, 1.5); // Higher exponent for smoother response
    const targetNudge = audioIntensity * 0.2; // Reduced nudge strength for subtlety
    
    // Smooth the nudge amount for more subtle, gradual movement
    const nudgeDiff = targetNudge - currentNudgeRef.current;
    currentNudgeRef.current += nudgeDiff * 0.15; // Smooth interpolation for subtle effect
    
    // Calculate camera position with orbital motion
    const angle = currentAngleRef.current;
    const radius = currentRadiusRef.current;
    const height = currentHeightRef.current;
    
    // Base orbital position
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = height;
    
    // Apply audio-reactive nudge to the right (positive X direction)
    const nudgedX = x + currentNudgeRef.current;
    
    // Smooth camera position updates
    const currentPos = cameraRef.current.position;
    const targetPos = new THREE.Vector3(nudgedX, y, z);
    currentPos.lerp(targetPos, 0.1); // Smooth interpolation
    
    // Always look at center
    cameraRef.current.lookAt(0, 0, 0);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[6, 0, 0]}
      fov={75}
    />
  );
};

// Scene Component
const Scene: React.FC<{ audioLevel: number }> = ({ audioLevel }) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#a855f7" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />

      <GaussianParticleField audioLevel={audioLevel} />
      <CameraController audioLevel={audioLevel} />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={false}
        minDistance={3}
        maxDistance={25}
      />
    </>
  );
};

interface NoiseFieldVisualizerProps {
  onClose: () => void;
}

const NoiseFieldVisualizer: React.FC<NoiseFieldVisualizerProps> = ({ onClose }) => {
  const { audioLevel, isPlaying } = usePlayer();
  const [currentAudioLevel, setCurrentAudioLevel] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Update audio level in a loop
  useEffect(() => {
    let animationFrameId: number;
    
    const updateLevel = () => {
      setCurrentAudioLevel(audioLevel.get());
      animationFrameId = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [audioLevel]);

  // Prevent closing when clicking inside the visualizer
  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the background div, not on children
    if (e.target === e.currentTarget || e.target === containerRef.current) {
      onClose();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <Canvas
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
          className="pointer-events-auto"
        >
          <Scene audioLevel={currentAudioLevel} />
        </Canvas>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-[101] flex flex-col gap-3 pointer-events-auto">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          Close
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[101] bg-slate-800/80 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20">
        <p className="text-white text-sm text-center">
          {isPlaying ? '🎵 Audio-driven Gaussian Particle Field' : '⏸️ Paused - Play music to see visualization'}
        </p>
        <p className="text-slate-400 text-xs text-center mt-1">
          Drag to rotate • Scroll to zoom • Click outside to close
        </p>
      </div>
    </motion.div>
  );
};

export default NoiseFieldVisualizer;

