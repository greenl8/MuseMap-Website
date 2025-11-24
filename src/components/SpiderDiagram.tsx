import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import type { DiscographyData } from '../types';
import { artistConfig } from '../data/discography';
import { usePlayer } from '../context/PlayerContext';
import CircularSpectrum from './CircularSpectrum';

interface Props {
  data: DiscographyData[];
  onYearSelect: (year: DiscographyData) => void;
}

// Spring-based line component that lags behind with physics
const SpringLine: React.FC<{
  x1: number;
  y1: number;
  x2: number | ReturnType<typeof useMotionValue>;
  y2: number | ReturnType<typeof useMotionValue>;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  filter?: string;
  delay: number;
  index: number;
}> = ({ x1, y1, x2, y2, stroke, strokeWidth, opacity, filter, delay, index }) => {
  // Get initial values
  const initialX = typeof x2 === 'number' ? x2 : x2.get();
  const initialY = typeof y2 === 'number' ? y2 : y2.get();
  
  // Create motion values with spring physics
  const springX = useMotionValue(initialX);
  const springY = useMotionValue(initialY);
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
    if (typeof x2 === 'number') {
      springX.set(x2);
    } else {
      const unsubscribe = x2.on('change', (latest) => {
        springX.set(latest);
      });
      return unsubscribe;
    }
  }, [x2, springX]);
  
  useEffect(() => {
    if (typeof y2 === 'number') {
      springY.set(y2);
    } else {
      const unsubscribe = y2.on('change', (latest) => {
        springY.set(latest);
      });
      return unsubscribe;
    }
  }, [y2, springY]);

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
      style={{ willChange: 'd' }} 
    />
  );
};

const ConnectionLine: React.FC<{
  item: DiscographyData;
  index: number;
  dataLength: number;
  radiusMotion: any; // MotionValue
  getYearColor: (year: number) => { from: string; to: string; glow: string };
  isHovered: boolean;
  isMobile: boolean;
}> = ({ item, index, dataLength, radiusMotion, getYearColor, isHovered, isMobile }) => {
  const angle = (index / dataLength) * 2 * Math.PI - (Math.PI / 2);
  const yearColors = getYearColor(item.year);
  
  // Calculate animated positions from radius motion value
  const animatedX = useTransform(radiusMotion, (r: number) => 700 + r * Math.cos(angle));
  const animatedY = useTransform(radiusMotion, (r: number) => 700 + r * Math.sin(angle));

  return (
    <SpringLine
      key={`line-${item.year}`}
      x1={700}
      y1={700}
      x2={animatedX}
      y2={animatedY}
      stroke={yearColors.from}
      strokeWidth={isHovered ? 3 : 2.5}
      opacity={isHovered ? 0.9 : 0.7}
      // Disable filter on mobile or reduce complexity
      filter={isMobile ? undefined : "url(#glow)"}
      delay={index * 0.05}
      index={index}
    />
  );
};

const YearNode: React.FC<{
  item: DiscographyData;
  index: number;
  dataLength: number;
  radiusMotion: any; // MotionValue
  getYearColor: (year: number) => { from: string; to: string; glow: string };
  getAlbumCount: (yearData: DiscographyData) => number;
  getCircleSizeAndGlow: (albumCount: number) => { size: number; glowColor: string };
  handleYearClick: (e: React.MouseEvent, item: DiscographyData) => void;
  isHovered: boolean;
  setHoveredYear: (year: number | null) => void;
  isMobile: boolean;
  audioLevel: any; // MotionValue
  isPlayingThisYear: boolean;
}> = ({ 
  item, index, dataLength, radiusMotion, 
  getYearColor, getAlbumCount, getCircleSizeAndGlow,
  handleYearClick, isHovered, setHoveredYear, isMobile, audioLevel, isPlayingThisYear
}) => {
  const angle = (index / dataLength) * 2 * Math.PI - (Math.PI / 2);
  const hasAlbums = item.albums.length > 0;
  const yearColors = getYearColor(item.year);
  const albumCount = getAlbumCount(item);
  const { size, glowColor } = getCircleSizeAndGlow(albumCount);

  // Calculate position based on animated radius
  const left = useTransform(radiusMotion, (r: number) => 700 + r * Math.cos(angle));
  const top = useTransform(radiusMotion, (r: number) => 700 + r * Math.sin(angle));

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      style={{ 
        left, 
        top,
        willChange: 'transform, opacity',
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1,
        opacity: 1,
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
      {/* Use CSS for hover scale to avoid React state re-render issues interfering with motion values */}
      <div className="hover-scale-wrapper circle-scale-in"
           style={{ 
             transformOrigin: 'center',
             animationDelay: `${index * 0.08}s`,
           }}>
        {/* Circular Audio Spectrum */}
        <CircularSpectrum
          size={size}
          audioLevel={audioLevel}
          isActive={isPlayingThisYear}
          color={yearColors.from}
          barCount={20}
        />

        {/* Outer glow - dynamic color based on track count */}
        {!isMobile && (
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
              willChange: 'transform',
            }}
          />
        )}

        {/* Main node - with year-based color gradient and dynamic size */}
        <div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            background: `linear-gradient(135deg, ${yearColors.from} 0%, ${yearColors.to} 100%)`,
            boxShadow: isMobile 
              ? 'none' 
              : (isHovered 
                  ? `0 0 ${size * 0.3}px ${glowColor}, inset 0 0 ${size * 0.15}px rgba(255, 255, 255, 0.2)`
                  : `0 0 ${size * 0.2}px ${glowColor}, inset 0 0 ${size * 0.1}px rgba(255, 255, 255, 0.1)`
                ),
            border: `2px solid ${isHovered ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'}`,
            opacity: hasAlbums ? 1 : 0.7,
            willChange: 'transform, box-shadow',
          }}
        >
          <span className="text-white font-bold relative z-10"
            style={{ 
              textShadow: isMobile ? 'none' : '0 0 8px rgba(255, 255, 255, 0.5)',
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
      </div>
    </motion.div>
  );
};

// Component to manage animation for a single year group
const YearGroup: React.FC<{
  item: DiscographyData;
  index: number;
  dataLength: number;
  getYearRadius: (year: number) => number;
  getYearColor: (year: number) => { from: string; to: string; glow: string };
  getAlbumCount: (yearData: DiscographyData) => number;
  getCircleSizeAndGlow: (albumCount: number) => { size: number; glowColor: string };
  handleYearClick: (e: React.MouseEvent, item: DiscographyData) => void;
  isHovered: boolean;
  setHoveredYear: (year: number | null) => void;
  linesContainer: SVGElement | null;
  isMobile: boolean;
  audioLevel: any;
  currentSongYear: number | undefined;
}> = ({ 
  item, index, dataLength, getYearRadius, 
  getYearColor, getAlbumCount, getCircleSizeAndGlow,
  handleYearClick, isHovered, setHoveredYear, linesContainer, isMobile, audioLevel, currentSongYear
}) => {
  const baseRadius = getYearRadius(item.year);
  const radiusMotion = useMotionValue(baseRadius);

  // Only react if this year contains the currently playing song
  const isPlayingThisYear = currentSongYear === item.year;
  
  useEffect(() => {
    // Base breathing animation
    const animation = animate(
      radiusMotion,
      [baseRadius, baseRadius + 60, baseRadius], 
      {
        duration: 4 + index * 0.3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.2,
      }
    );
    
    return () => animation.stop();
  }, [baseRadius, index, radiusMotion]);

  // Combine breathing + audio pulse (removed audio pulse, keeping only breathing)
  const finalRadius = radiusMotion;

  return (
    <>
      {linesContainer && createPortal(
        <ConnectionLine
          item={item}
          index={index}
          dataLength={dataLength}
          radiusMotion={finalRadius}
          getYearColor={getYearColor}
          isHovered={isHovered}
          isMobile={isMobile}
        />,
        linesContainer
      )}
      
      <YearNode
        item={item}
        index={index}
        dataLength={dataLength}
        radiusMotion={finalRadius}
        getYearColor={getYearColor}
        getAlbumCount={getAlbumCount}
        getCircleSizeAndGlow={getCircleSizeAndGlow}
        handleYearClick={handleYearClick}
        isHovered={isHovered}
        setHoveredYear={setHoveredYear}
        isMobile={isMobile}
        audioLevel={audioLevel}
        isPlayingThisYear={isPlayingThisYear}
      />
    </>
  );
};

const SpiderDiagramContent: React.FC<{ data: DiscographyData[]; onYearSelect: (year: DiscographyData) => void }> = ({ data, onYearSelect }) => {
  const { zoomToElement } = useControls();
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [linesContainer, setLinesContainer] = useState<SVGElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { audioLevel, currentAlbum, isPlaying } = usePlayer();

  // Identify year of current song for targeted reactivity
  const currentSongYear = useMemo(() => {
    if (!currentAlbum) return undefined;
    // Find which year this album belongs to
    const yearData = data.find(y => y.albums.some(a => a.id === currentAlbum.id));
    return yearData?.year;
  }, [currentAlbum, data]);


  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Function to get radius for each year based on position (red circles indicate different distances)
  const getYearRadius = (year: number): number => {
    // Years with red circles (different positions): 2016, 2018, 2020, 2022, 2023, 2024, 2025
    // Years without red circles (standard position): 2015, 2017, 2019, 2021
    const radiusMap: { [key: number]: number } = {
      2015: 500,  // Standard position
      2016: 600,  // Red circle - further out
      2017: 500,  // Standard position
      2018: 550,  // Red circle - medium distance
      2019: 500,  // Standard position
      2020: 650,  // Red circle - furthest out
      2021: 500,  // Standard position
      2022: 580,  // Red circle - medium-far
      2023: 520,  // Red circle - slightly further
      2024: 620,  // Red circle - far out
      2025: 570,  // Red circle - medium-far
    };
    
    return radiusMap[year] || 500; // Default to 500 if year not in map
  };

  // Calculate album count for each year
  const getAlbumCount = (yearData: DiscographyData): number => {
    return yearData.albums.length;
  };

  // Calculate min and max album counts for normalization
  const albumCounts = data.map(getAlbumCount);
  const minAlbums = Math.min(...albumCounts, 1); // At least 1 to avoid division by zero
  const maxAlbums = Math.max(...albumCounts, 1);

  // Function to get color based on year (2025 = light green, 2015 = blue)
  const getYearColor = (year: number): { from: string; to: string; glow: string } => {
    const minYear = 2015;
    const maxYear = 2025;
    const normalized = (year - minYear) / (maxYear - minYear); // 0 to 1
    
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

  // Function to get circle size and glow color based on album count
  const getCircleSizeAndGlow = (albumCount: number): { size: number; glowColor: string } => {
    // Normalize album count (0 to 1)
    const normalized = maxAlbums > minAlbums 
      ? (albumCount - minAlbums) / (maxAlbums - minAlbums)
      : 0.5;
    
    // Size ranges from 80px (small) to 140px (large)
    const size = 80 + (normalized * 60);
    
    // Glow color: light blue for more albums (high normalized), light green for fewer albums (low normalized)
    const blueIntensity = normalized;
    
    const r = Math.round(134 + (96 - 134) * blueIntensity);
    const g = Math.round(239 + (165 - 239) * blueIntensity);
    const b = Math.round(172 + (250 - 172) * blueIntensity);
    
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
            {/* Outer glow rings - Hide on mobile */}
            {!isMobile && (
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />
            )}
            
            {/* Main node */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #06b6d4 100%)',
                boxShadow: isMobile ? 'none' : '0 0 40px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              }}
            >
              <span className="text-white font-bold text-2xl relative z-10 px-4 text-center leading-tight tracking-wide"
                style={{ textShadow: isMobile ? 'none' : '0 0 10px rgba(255, 255, 255, 0.5)' }}
              >
                {artistConfig.name}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Shared SVG Container for Lines */}
        <svg 
          ref={setLinesContainer}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {/* Portal target */}
        </svg>

        {data.map((item, index) => (
          <YearGroup
            key={item.year}
            item={item}
            index={index}
            dataLength={data.length}
            getYearRadius={getYearRadius}
            getYearColor={getYearColor}
            getAlbumCount={getAlbumCount}
            getCircleSizeAndGlow={getCircleSizeAndGlow}
            handleYearClick={handleYearClick}
            isHovered={hoveredYear === item.year}
            setHoveredYear={setHoveredYear}
            linesContainer={linesContainer}
            isMobile={isMobile}
            audioLevel={audioLevel}
            currentSongYear={currentSongYear}
          />
        ))}
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
        minScale={0.05}
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
        className="fixed bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none z-50 w-max max-w-[90%]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10 shadow-2xl flex items-center justify-center"
          style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
        >
          <span className="text-slate-300 text-xs md:text-sm font-medium text-center whitespace-nowrap">
            Zoom • Drag to explore • Tap to dive in
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default SpiderDiagram;
