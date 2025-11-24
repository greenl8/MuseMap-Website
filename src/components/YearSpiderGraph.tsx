import React, { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import type { DiscographyData, Album } from '../types';

interface Props {
  yearData: DiscographyData;
  onAlbumSelect: (album: Album) => void;
}

// Spring-based line component (reused concept from SpiderDiagram)
const SpringLine: React.FC<{
  x1: number;
  y1: number;
  x2: number | ReturnType<typeof useMotionValue>;
  y2: number | ReturnType<typeof useMotionValue>;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  delay: number;
  index: number;
}> = ({ x1, y1, x2, y2, stroke, strokeWidth, opacity, delay, index }) => {
  const initialX = typeof x2 === 'number' ? x2 : x2.get();
  const initialY = typeof y2 === 'number' ? y2 : y2.get();
  
  const springX = useMotionValue(initialX);
  const springY = useMotionValue(initialY);
  const springXAnimated = useSpring(springX, { stiffness: 40, damping: 15 });
  const springYAnimated = useSpring(springY, { stiffness: 40, damping: 15 });

  useEffect(() => {
    if (typeof x2 !== 'number') {
      return x2.on('change', (latest) => springX.set(latest));
    }
    springX.set(x2);
  }, [x2, springX]);
  
  useEffect(() => {
    if (typeof y2 !== 'number') {
      return y2.on('change', (latest) => springY.set(latest));
    }
    springY.set(y2);
  }, [y2, springY]);

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
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: opacity }}
      transition={{ duration: 1, delay: delay }}
    />
  );
};

const AlbumNode: React.FC<{
  album: Album;
  index: number;
  totalAlbums: number;
  radiusMotion: any;
  onClick: (album: Album) => void;
  isHovered: boolean;
  setHoveredId: (id: string | null) => void;
}> = ({ album, index, totalAlbums, radiusMotion, onClick, isHovered, setHoveredId }) => {
  const angle = (index / totalAlbums) * 2 * Math.PI - (Math.PI / 2);
  
  const left = useTransform(radiusMotion, (r: number) => 500 + r * Math.cos(angle));
  const top = useTransform(radiusMotion, (r: number) => 500 + r * Math.sin(angle));

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      style={{ left, top }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, type: "spring", damping: 12, stiffness: 200 }}
      onMouseEnter={() => setHoveredId(album.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(album);
      }}
    >
      <div className="relative group">
        {/* Glow effect */}
        <div 
            className={`absolute inset-0 rounded-full bg-purple-500/30 blur-xl transition-opacity duration-300 ${isHovered ? 'opacity-100 scale-150' : 'opacity-0'}`}
        />
        
        {/* Album Art / Node */}
        <div 
          className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 transition-all duration-300 ${isHovered ? 'border-white scale-110' : 'border-white/20'}`}
          style={{
            boxShadow: isHovered ? '0 0 30px rgba(168, 85, 247, 0.6)' : '0 0 15px rgba(0,0,0,0.5)'
          }}
        >
          {album.coverUrl ? (
            <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
               <span className="text-2xl">🎵</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
        </div>

        {/* Label */}
        <motion.div 
            className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 text-center w-48 pointer-events-none"
            animate={{ y: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0.7 }}
        >
            <h3 className="text-white font-bold text-sm md:text-base shadow-black drop-shadow-lg">{album.title}</h3>
            <p className="text-purple-300 text-xs shadow-black drop-shadow-md">{album.songs.length} Songs</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

const AlbumGroup: React.FC<{
  album: Album;
  index: number;
  totalAlbums: number;
  onAlbumSelect: (album: Album) => void;
  isHovered: boolean;
  setHoveredId: (id: string | null) => void;
}> = ({ album, index, totalAlbums, onAlbumSelect, isHovered, setHoveredId }) => {
  const baseRadius = 250;
  const radiusMotion = useMotionValue(baseRadius);

  useEffect(() => {
    const animation = animate(
      radiusMotion,
      [baseRadius, baseRadius + 20, baseRadius],
      {
        duration: 3 + index * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.2,
      }
    );
    return () => animation.stop();
  }, [baseRadius, index, radiusMotion]);

  const angle = (index / totalAlbums) * 2 * Math.PI - (Math.PI / 2);
  const endX = useTransform(radiusMotion, (r: number) => 500 + r * Math.cos(angle));
  const endY = useTransform(radiusMotion, (r: number) => 500 + r * Math.sin(angle));

  return (
    <>
      <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
        <SpringLine
          x1={500}
          y1={500}
          x2={endX}
          y2={endY}
          stroke={isHovered ? "rgba(168, 85, 247, 0.8)" : "rgba(148, 163, 184, 0.3)"}
          strokeWidth={isHovered ? 2 : 1}
          opacity={1}
          delay={index * 0.1}
          index={index}
        />
      </svg>
      <AlbumNode
        album={album}
        index={index}
        totalAlbums={totalAlbums}
        radiusMotion={radiusMotion}
        onClick={onAlbumSelect}
        isHovered={isHovered}
        setHoveredId={setHoveredId}
      />
    </>
  );
};

const YearSpiderGraph: React.FC<Props> = ({ yearData, onAlbumSelect }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // If no albums, show a message
  if (!yearData.albums || yearData.albums.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <p>No albums recorded for {yearData.year}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      <TransformWrapper
        initialScale={0.9}
        minScale={0.5}
        maxScale={3}
        centerOnInit={true}
        limitToBounds={false}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div className="relative w-[1000px] h-[1000px] flex-shrink-0">
            {/* Central Year Node */}
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
            >
              <div className="relative">
                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl" />
                
                {/* Node */}
                <div className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                  <span className="text-white font-bold text-3xl">{yearData.year}</span>
                </div>
              </div>
            </motion.div>

            {/* Albums */}
            {yearData.albums.map((album, index) => (
              <AlbumGroup
                key={album.id}
                album={album}
                index={index}
                totalAlbums={yearData.albums.length}
                onAlbumSelect={onAlbumSelect}
                isHovered={hoveredId === album.id}
                setHoveredId={setHoveredId}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>
      
      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-60">
         <p className="text-slate-400 text-xs">Drag to explore • Click an album to view details</p>
      </div>
    </div>
  );
};

export default YearSpiderGraph;

