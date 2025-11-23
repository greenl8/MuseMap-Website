import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import type { DiscographyData } from '../types';
import { artistConfig } from '../data/discography';

interface Props {
  data: DiscographyData[];
  onYearSelect: (year: DiscographyData) => void;
}

// Spring-based line component that lags behind with physics
const SpringLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  filter: string;
  delay: number;
  index: number;
}> = ({ x1, y1, x2, y2, stroke, strokeWidth, opacity, filter, delay, index }) => {
  // Create motion values with spring physics
  const springX = useMotionValue(x2);
  const springY = useMotionValue(y2);
  const springXAnimated = useSpring(springX, { 
    stiffness: 30 + index * 2, 
    damping: 10 + index * 0.4, 
    mass: 0.7 + index * 0.05 
  });
  const springYAnimated = useSpring(springY, { 
    stiffness: 30 + index * 2, 
    damping: 10 + index * 0.4, 
    mass: 0.7 + index * 0.05 
  });

  // Update spring targets when coordinates change
  useEffect(() => {
    springX.set(x2);
    springY.set(y2);
  }, [x2, y2, springX, springY]);

  // Create path string from spring values
  const pathString = useTransform(
    [springXAnimated, springYAnimated],
    ([x, y]) => `M ${x1} ${y1} L ${x} ${y}`
  );

  return (
    <motion.path
      d={pathString}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      opacity={opacity}
      filter={filter}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ 
        pathLength: 1,
        opacity: opacity,
      }}
      transition={{ 
        pathLength: { duration: 1, delay: delay },
        opacity: { duration: 0.3 },
      }}
    />
  );
};

const SpiderDiagramContent: React.FC<{ data: DiscographyData[]; onYearSelect: (year: DiscographyData) => void }> = ({ data, onYearSelect }) => {
  const { zoomToElement } = useControls();
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  // Calculate total tracks for each year
  const getTrackCount = (yearData: DiscographyData): number => {
    return yearData.albums.reduce((total, album) => total + album.songs.length, 0);
  };

  // Calculate min and max track counts for normalization
  const trackCounts = data.map(getTrackCount);
  const minTracks = Math.min(...trackCounts, 1); // At least 1 to avoid division by zero
  const maxTracks = Math.max(...trackCounts, 1);

  // Function to get color based on year (2025 = light green, 2015 = blue)
  const getYearColor = (year: number): { from: string; to: string; glow: string } => {
    const minYear = 2015;
    const maxYear = 2025;
    const normalized = (year - minYear) / (maxYear - minYear); // 0 to 1
    
    // Interpolate between blue (2015) and light green (2025)
    // Blue: #3b82f6 (rgb(59, 130, 246))
    // Light Green: #4ade80 (rgb(74, 222, 128))
    
    const r = Math.round(59 + (74 - 59) * normalized);
    const g = Math.round(130 + (222 - 130) * normalized);
    const b = Math.round(246 + (128 - 246) * normalized);
    
    const color = `rgb(${r}, ${g}, ${b})`;
    const lighter = `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`;
    
    return {
      from: color,
      to: lighter,
      glow: `rgba(${r}, ${g}, ${b}, 0.6)`,
    };
  };

  // Function to get circle size and glow color based on track count
  const getCircleSizeAndGlow = (trackCount: number): { size: number; glowColor: string } => {
    // Normalize track count (0 to 1)
    const normalized = maxTracks > minTracks 
      ? (trackCount - minTracks) / (maxTracks - minTracks)
      : 0.5;
    
    // Size ranges from 80px (small) to 140px (large)
    const size = 80 + (normalized * 60);
    
    // Glow color: yellow for bigger (high normalized), purple for smaller (low normalized)
    // Yellow: rgba(234, 179, 8, ...) - amber/yellow
    // Purple: rgba(168, 85, 247, ...) - purple
    const yellowIntensity = normalized;
    const purpleIntensity = 1 - normalized;
    
    // Blend yellow and purple based on size
    const r = Math.round(168 + (234 - 168) * yellowIntensity);
    const g = Math.round(85 + (179 - 85) * yellowIntensity);
    const b = Math.round(247 + (8 - 247) * yellowIntensity);
    
    const glowColor = `rgba(${r}, ${g}, ${b}, ${0.4 + normalized * 0.4})`;
    
    return { size, glowColor };
  };

  const handleYearClick = (e: React.MouseEvent, item: DiscographyData) => {
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    zoomToElement(target, 2.5, 800, "easeOutQuad");
    
    setTimeout(() => {
      onYearSelect(item);
    }, 300);
  };

  return (
    <>

      {/* Main Diagram Container */}
      <div className="relative w-[1400px] h-[1400px] flex-shrink-0">
        
        {/* Central Artist Node - Creative Design */}
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
        >
          <div className="relative">
            {/* Outer glow rings */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            
            {/* Main node */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)',
                boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-white font-bold text-2xl relative z-10 px-4 text-center leading-tight tracking-wide"
                style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.5)' }}
              >
                {artistConfig.name}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Animated Connections - Rendered AFTER artist node so lines appear on top */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-25">
          <defs>
            <linearGradient id="line-gradient-creative" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
            </linearGradient>
            
            {/* Glow filter for connections */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Animated gradient for pulsing effect */}
            <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6">
                <animate attributeName="stop-opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4">
                <animate attributeName="stop-opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
          
          {data.map((item, index) => {
            const angle = (index / data.length) * 2 * Math.PI - (Math.PI / 2);
            const radius = 500; 
            const baseCx = 700 + radius * Math.cos(angle);
            const baseCy = 700 + radius * Math.sin(angle);
            const isHovered = hoveredYear === item.year;
            const yearColors = getYearColor(item.year);

            return (
              <SpringLine
                key={`line-${item.year}`}
                x1={700}
                y1={700}
                x2={baseCx}
                y2={baseCy}
                stroke={yearColors.from}
                strokeWidth={isHovered ? 3 : 2.5}
                opacity={isHovered ? 0.9 : 0.7}
                filter="url(#glow)"
                delay={index * 0.05}
                index={index}
              />
            );
          })}
        </svg>

        {/* Year Nodes - Creative Organic Design */}
        {data.map((item, index) => {
          const angle = (index / data.length) * 2 * Math.PI - (Math.PI / 2);
          const radius = 500;
          const left = 700 + radius * Math.cos(angle);
          const top = 700 + radius * Math.sin(angle);
          const isHovered = hoveredYear === item.year;
          const hasAlbums = item.albums.length > 0;
          const yearColors = getYearColor(item.year);
          const trackCount = getTrackCount(item);
          const { size, glowColor } = getCircleSizeAndGlow(trackCount);

          return (
            <motion.div
              key={item.year}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ left, top }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                scale: isHovered ? 1.15 : 1,
              }}
              transition={{ 
                delay: index * 0.08,
                type: "spring",
                damping: 12,
                stiffness: 200,
              }}
              onMouseEnter={() => setHoveredYear(item.year)}
              onMouseLeave={() => setHoveredYear(null)}
              onClick={(e) => handleYearClick(e, item)}
            >
              {/* Outer glow - dynamic color based on track count */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${isHovered ? glowColor.replace(/0\.\d+/, '0.8') : glowColor} 0%, transparent 70%)`,
                  filter: 'blur(20px)',
                  width: `${size * 1.5}px`,
                  height: `${size * 1.5}px`,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />

              {/* Main node - with year-based color gradient and dynamic size */}
              <div
                className="relative rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  background: `linear-gradient(135deg, ${yearColors.from} 0%, ${yearColors.to} 100%)`,
                  boxShadow: isHovered 
                    ? `0 0 ${size * 0.3}px ${glowColor}, inset 0 0 ${size * 0.15}px rgba(255, 255, 255, 0.2)`
                    : `0 0 ${size * 0.2}px ${glowColor}, inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.1)`,
                  border: `2px solid ${isHovered ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
                  opacity: hasAlbums ? 1 : 0.7,
                }}
              >
                <span className="text-white font-bold relative z-10"
                  style={{ 
                    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
                    fontSize: `${size * 0.35}px`,
                  }}
                >
                  {item.year}
                </span>
              </div>

              {/* Hover tooltip */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none"
                  >
                    <div 
                      className="backdrop-blur-md px-4 py-2 rounded-lg border border-white/20 shadow-xl"
                      style={{ 
                        background: `linear-gradient(to right, ${yearColors.from}dd, ${yearColors.to}dd)`,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' 
                      }}
                    >
                      <div className="text-white font-semibold text-sm">
                        {item.albums.length} {item.albums.length === 1 ? 'Album' : 'Albums'}
                      </div>
                      <div className="text-white/80 text-xs mt-1">{item.description}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

const SpiderDiagram: React.FC<Props> = ({ data, onYearSelect }) => {
  return (
    <div className="fixed inset-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at center, #1e1b4b 0%, #0f172a 50%, #000000 100%)',
      }}
    >
      <TransformWrapper
        initialScale={0.7}
        minScale={0.1}
        maxScale={8}
        centerOnInit={true}
        limitToBounds={false}
        wheel={{ step: 0.05, smoothStep: 0.002 }}
        panning={{ velocityDisabled: false }}
        alignmentAnimation={{ sizeX: 0, sizeY: 0 }}
        velocityAnimation={{ sensitivity: 1, animationTime: 400, equalToMove: true, minState: 50 }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{
            width: "100vw",
            height: "100vh",
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden"
          }}
          contentStyle={{
             width: "100vw",
             height: "100vh",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
          }}
        >
          <SpiderDiagramContent data={data} onYearSelect={onYearSelect} />
        </TransformComponent>
      </TransformWrapper>
      
      {/* Creative Instructions */}
      <motion.div 
        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl"
          style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
        >
          <span className="text-slate-300 text-sm font-medium">
            Scroll to zoom • Drag to explore • Click to dive in
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default SpiderDiagram;
