import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { usePlayer } from '../context/PlayerContext';

// Bar interface
interface JoyDivisionRow {
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  line: THREE.Line;
}

// Audio-reactive Joy Division style wave trails
const AudioBars: React.FC<{ audioLevel: number }> = ({ audioLevel }) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const freezeAccumulatorRef = useRef(0);

  const lineCount = 120; // Same number of lines
  const pointsPerLine = 160;
  const lineSpacing = 0.15; // Increased spacing to extend trail much further into distance
  const waveWidth = 8; // Narrower width for better aspect ratio
  const freezePerSecond = 30; // Higher freeze rate for smoother continuous look
  const stepTime = 1 / freezePerSecond;

  // Pre-build the line geometries and Line objects so we only mutate buffer data at runtime
  const lineRows: JoyDivisionRow[] = useMemo(() => {
    return Array.from({ length: lineCount }, () => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(pointsPerLine * 3);

      for (let i = 0; i < pointsPerLine; i++) {
        const x = (i / (pointsPerLine - 1) - 0.5) * waveWidth;
        positions[i * 3] = x;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.computeBoundingSphere();

      const material = new THREE.LineBasicMaterial({
        color: 0xf9f9f9,
        transparent: true,
        toneMapped: false,
      });

      const line = new THREE.Line(geometry, material);

      return { geometry, positions, line };
    });
  }, [lineCount, pointsPerLine, waveWidth]);

  const rowsRef = useRef<JoyDivisionRow[]>(lineRows);
  rowsRef.current = lineRows;

  const lineOpacities = useMemo(() => {
    return lineRows.map((_, idx) => {
      const fade = 1 - idx / lineCount;
      return 0.15 + fade * 0.85;
    });
  }, [lineRows, lineCount]);

  useEffect(() => {
    return () => {
      lineRows.forEach((row) => {
        row.geometry.dispose();
        (row.line.material as THREE.Material).dispose();
      });
    };
  }, [lineRows]);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    timeRef.current += delta;
    freezeAccumulatorRef.current += delta;

    const normalizedLevel = THREE.MathUtils.clamp(audioLevel, 0, 1);
    const dynamicGain = Math.pow(normalizedLevel, 0.85);
    const envelopeBoost = 0.25 + dynamicGain * 1.1;
    const time = timeRef.current;
    const liveRow = rowsRef.current[0];
    const positions = liveRow.positions;

    // Create frequency-based waveform distribution
    // Map x position to frequency bands (left = bass, center = mid, right = treble)
    for (let i = 0; i < pointsPerLine; i++) {
      const idx = i * 3 + 1; // Y component
      const xNorm = i / (pointsPerLine - 1); // 0 to 1 across the width
      
      // Frequency band mapping (logarithmic like human hearing)
      const freqPosition = xNorm; // Linear for now, can be logarithmic
      
      // Different frequency bands respond differently
      let frequencyAmplitude = 0;
      
      if (freqPosition < 0.3) {
        // Bass frequencies (left side)
        const bassPhase = time * 2.0 + freqPosition * 5.0;
        const bassWave = Math.sin(bassPhase) * 0.5 + 0.5;
        const subBass = Math.sin(time * 1.2) * 0.3 + 0.7;
        frequencyAmplitude = (bassWave * 0.7 + subBass * 0.3) * (1.0 - freqPosition * 0.5);
      } else if (freqPosition < 0.7) {
        // Mid frequencies (center)
        const midPhase = time * 4.0 + freqPosition * 12.0;
        const midWave = Math.sin(midPhase) * 0.5 + 0.5;
        const harmonics = Math.sin(midPhase * 2.3) * 0.3 + 0.7;
        frequencyAmplitude = midWave * harmonics * 0.9;
      } else {
        // Treble frequencies (right side)
        const treblePhase = time * 6.0 + freqPosition * 25.0;
        const trebleWave = Math.sin(treblePhase) * 0.4 + 0.6;
        const shimmer = Math.sin(treblePhase * 3.7) * 0.2 + 0.8;
        frequencyAmplitude = trebleWave * shimmer * 0.7 * (1.0 - (freqPosition - 0.7) * 0.5);
      }
      
      // Add some organic variation
      const organic = Math.sin(time * 1.5 + xNorm * 20) * 0.15 + 0.85;
      
      // Scale by audio level and create waveform height
      // Ensure minimum visibility even at low audio levels
      const baseHeight = 0.2; // Minimum height for visibility
      const dynamicHeight = frequencyAmplitude * envelopeBoost * organic * 4.5; // Increased multiplier for taller waveform
      const height = baseHeight + dynamicHeight;
      
      positions[idx] = height;
    }

    liveRow.geometry.attributes.position.needsUpdate = true;

    // Freeze the current waveform into the history buffer to create the trail
    if (freezeAccumulatorRef.current >= stepTime) {
      freezeAccumulatorRef.current -= stepTime;

      for (let r = lineCount - 1; r > 0; r--) {
        rowsRef.current[r].positions.set(rowsRef.current[r - 1].positions);
        rowsRef.current[r].geometry.attributes.position.needsUpdate = true;
      }
    }

    // Update material opacities
    rowsRef.current.forEach((row, idx) => {
      const material = row.line.material as THREE.LineBasicMaterial;
      material.opacity = lineOpacities[idx];
    });

    // Position the waveform sheet flat
    groupRef.current.position.y = 0;
    groupRef.current.rotation.x = 0; // Flat, horizontal
  });

  return (
    <group ref={groupRef}>
      {lineRows.map((row, idx) => (
        <primitive
          key={`joy-line-${idx}`}
          object={row.line}
          position={[0, 0, -idx * lineSpacing]}
        />
      ))}
    </group>
  );
};

// Star field component
const StarField: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  
  const starCount = 2000;
  const spreadRadius = 50;
  
  const { positions, sizes, colors } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    const colors = new Float32Array(starCount * 3);
    
    for (let i = 0; i < starCount; i++) {
      // Random position in 3D space
      const x = (Math.random() - 0.5) * spreadRadius * 2;
      const y = (Math.random() - 0.5) * spreadRadius * 2;
      const z = (Math.random() - 0.5) * spreadRadius * 2;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Random size
      sizes[i] = Math.random() * 0.05 + 0.02;
      
      // White stars with slight variation
      const brightness = 0.7 + Math.random() * 0.3;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness;
      colors[i * 3 + 2] = brightness;
    }
    
    return { positions, sizes, colors };
  }, []);
  
  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geom.setAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    return geom;
  }, [positions, sizes, colors]);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 customColor;
        varying vec3 vColor;
        
        void main() {
          vColor = customColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          // Soft circular star with glow
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          float glow = exp(-dist * dist * 8.0) * 0.5;
          
          gl_FragColor = vec4(vColor + vec3(glow), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });
  }, []);
  
  useFrame((_, delta) => {
    if (pointsRef.current && material.uniforms) {
      material.uniforms.time.value += delta;
    }
  });
  
  return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Scene component
const Scene: React.FC<{ audioLevel: number }> = ({ audioLevel }) => {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 5, 5]} intensity={1.0} color="#ffd700" />
      <pointLight position={[0, -5, 5]} intensity={0.5} color="#ffd700" />
      
      <StarField />
      <AudioBars audioLevel={audioLevel} />
      <CameraController />
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={25}
        panSpeed={0.8}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        target={[0, 0, -9]} // Look at center of waveform trail (120 lines * 0.15 spacing / 2)
        minPolarAngle={Math.PI / 3} // Limit how far down you can look (60 degrees)
        maxPolarAngle={Math.PI / 2.2} // Limit how far up (about 82 degrees - nearly top-down)
      />
    </>
  );
};

// Camera controller - top-down squared view like Joy Division album cover
const CameraController: React.FC = () => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame(() => {
    if (!cameraRef.current) return;
    // Fixed top-down perspective - looking down at the waveform sheet
  });
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 6, 2]} // Elevated and slightly forward for angled top-down view
      fov={45} // Narrower FOV for more squared/rectangular view
      onUpdate={(c) => {
        // Look down at the center of the waveform trail (120 lines * 0.15 spacing / 2)
        c.lookAt(0, 0, -9);
      }}
    />
  );
};

interface BarsVisualizerProps {
  onClose: () => void;
}

const BarsVisualizer: React.FC<BarsVisualizerProps> = ({ onClose }) => {
  const { audioLevel, isPlaying } = usePlayer();
  const [currentAudioLevel, setCurrentAudioLevel] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const exitFullscreen = React.useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  }, []);

  // Detect mobile and landscape orientation
  useEffect(() => {
    const checkMobileLandscape = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const isLandscape = window.innerWidth > window.innerHeight;
      const shouldBeFullscreen = isMobile && isLandscape;
      
      setIsMobileLandscape(shouldBeFullscreen);
      
      if (shouldBeFullscreen && containerRef.current && !isFullscreen) {
        const element = containerRef.current;
        if (element.requestFullscreen) {
          element.requestFullscreen().then(() => {
            setIsFullscreen(true);
          }).catch(() => {
            setIsFullscreen(false);
          });
        } else if ((element as any).webkitRequestFullscreen) {
          (element as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        } else if ((element as any).mozRequestFullScreen) {
          (element as any).mozRequestFullScreen();
          setIsFullscreen(true);
        } else if ((element as any).msRequestFullscreen) {
          (element as any).msRequestFullscreen();
          setIsFullscreen(true);
        }
      } else if (!shouldBeFullscreen && isFullscreen) {
        exitFullscreen();
        setShowControls(true);
        if (hideControlsTimeoutRef.current) {
          clearTimeout(hideControlsTimeoutRef.current);
        }
      }
    };

    checkMobileLandscape();
    window.addEventListener('resize', checkMobileLandscape);
    window.addEventListener('orientationchange', checkMobileLandscape);

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', checkMobileLandscape);
      window.removeEventListener('orientationchange', checkMobileLandscape);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isFullscreen, exitFullscreen]);

  // Set up auto-hide timeout when in mobile landscape fullscreen
  useEffect(() => {
    if (isMobileLandscape && isFullscreen) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    } else {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    }

    return () => {
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
    };
  }, [isMobileLandscape, isFullscreen]);

  const handleClose = () => {
    if (isFullscreen) {
      exitFullscreen();
    }
    setTimeout(() => {
      onClose();
    }, 100);
  };

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

  // Handle screen click/touch to show controls in fullscreen landscape mode
  const handleScreenClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobileLandscape && isFullscreen) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        clearTimeout(hideControlsTimeoutRef.current);
      }
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
      return;
    }
    
    if (!isMobileLandscape && (e.target === e.currentTarget || e.target === containerRef.current)) {
      handleClose();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-md ${isMobileLandscape ? 'landscape-fullscreen' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleScreenClick}
      onTouchStart={handleScreenClick}
      style={{
        ...(isMobileLandscape && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
        })
      }}
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
      <div 
        className={`absolute ${isMobileLandscape ? 'top-6 right-6' : 'top-4 left-4'} z-[101] flex flex-col gap-3 transition-opacity duration-300 ${
          isMobileLandscape && !showControls 
            ? 'opacity-0 pointer-events-none' 
            : 'opacity-100 pointer-events-auto'
        }`}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClose();
          }}
          className={`px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg border border-white/20 backdrop-blur-md transition-all flex items-center gap-2 ${
            isMobileLandscape ? 'text-lg px-6 py-3 shadow-lg' : ''
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            {isMobileLandscape ? (
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            ) : (
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            )}
          </svg>
          {isMobileLandscape ? 'Back to Tracks' : 'Close'}
        </button>
      </div>

      {/* Info */}
      <div className={`absolute ${isMobileLandscape ? 'bottom-6 left-1/2 transform -translate-x-1/2' : 'bottom-4 left-1/2 transform -translate-x-1/2'} z-[101] bg-slate-800/80 backdrop-blur-md rounded-lg px-6 py-3 border border-white/20 ${
        isMobileLandscape ? 'hidden' : ''
      }`}>
        <p className="text-white text-sm text-center">
          {isPlaying ? '🎵 Audio-reactive Bars Visualizer' : '⏸️ Paused - Play music to see visualization'}
        </p>
        <p className="text-slate-400 text-xs text-center mt-1">
          Drag to rotate • Right-click drag to pan • Scroll to zoom • Click outside to close
        </p>
      </div>

      {/* Mobile Landscape Info */}
      {isMobileLandscape && (
        <div 
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[101] bg-slate-800/80 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20 transition-opacity duration-300 ${
            !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <p className="text-white text-xs text-center">
            {isPlaying ? '🎵 Fullscreen Visualization' : '⏸️ Paused'}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default BarsVisualizer;
