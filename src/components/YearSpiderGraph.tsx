import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { motion, useMotionValue, useSpring, useTransform, animate, MotionValue } from 'framer-motion';
import type { DiscographyData, Album } from '../types';
import { usePlayer } from '../context/PlayerContext';
import CircularSpectrum from './CircularSpectrum';

interface Props {
  yearData: DiscographyData;
  onAlbumSelect: (album: Album) => void;
  onMediaSelect?: () => void;
}

// Spring-based line component (reused concept from SpiderDiagram)
const SpringLine: React.FC<{
  x1: number;
  y1: number;
  x2: number | MotionValue<number>;
  y2: number | MotionValue<number>;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  delay: number;
  index: number;
}> = ({ x1, y1, x2, y2, stroke, strokeWidth, opacity, delay }) => {
  const initialX = typeof x2 === 'number' ? x2 : x2.get();
  const initialY = typeof y2 === 'number' ? y2 : y2.get();
  
  const springX = useMotionValue(initialX);
  const springY = useMotionValue(initialY);
  const springXAnimated = useSpring(springX, { stiffness: 40, damping: 15 });
  const springYAnimated = useSpring(springY, { stiffness: 40, damping: 15 });

  useEffect(() => {
    if (typeof x2 !== 'number') {
      return (x2 as MotionValue<number>).on('change', (latest: number) => springX.set(latest));
    }
    springX.set(x2);
  }, [x2, springX]);
  
  useEffect(() => {
    if (typeof y2 !== 'number') {
      return (y2 as MotionValue<number>).on('change', (latest: number) => springY.set(latest));
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
      style={{ willChange: 'd' }}
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
  isMobile: boolean;
  audioLevel: any; // MotionValue
  isPlayingThisAlbum: boolean;
}> = ({ album, index, totalAlbums, radiusMotion, onClick, isHovered, setHoveredId, isMobile, audioLevel, isPlayingThisAlbum }) => {
  const angle = (index / totalAlbums) * 2 * Math.PI - (Math.PI / 2);
  
  const left = useTransform(radiusMotion, (r: number) => 500 + r * Math.cos(angle));
  const top = useTransform(radiusMotion, (r: number) => 500 + r * Math.sin(angle));
  const nodeSize = isMobile ? 96 : 128;

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      style={{ 
        left, 
        top,
        willChange: 'transform, opacity'
      }}
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
        {/* Circular Audio Spectrum */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CircularSpectrum
            size={nodeSize}
            audioLevel={audioLevel}
            isActive={isPlayingThisAlbum}
            color="rgba(168, 85, 247, 0.8)"
            barCount={16}
          />
        </div>

        {/* Glow effect - only on desktop or reduced on mobile */}
        {!isMobile && (
          <div 
              className={`absolute inset-0 rounded-full bg-purple-500/30 blur-xl transition-opacity duration-300 ${isHovered ? 'opacity-100 scale-150' : 'opacity-0'}`}
              style={{ willChange: 'opacity' }}
          />
        )}
        
        {/* Album Art / Node */}
        <div 
          className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 transition-all duration-300 ${isHovered ? 'border-white scale-110' : 'border-white/20'}`}
          style={{
            boxShadow: isMobile 
              ? 'none' 
              : (isHovered ? '0 0 30px rgba(168, 85, 247, 0.6)' : '0 0 15px rgba(0,0,0,0.5)'),
            willChange: 'transform, box-shadow'
          }}
        >
          {album.coverUrl ? (
            <img src={`${import.meta.env.BASE_URL}${album.coverUrl.replace(/^\//, '')}`} alt={album.title} className="w-full h-full object-cover" />
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
  linesContainer: SVGElement | null;
  isMobile: boolean;
  audioLevel: any;
  currentAlbum: Album | null;
}> = ({ album, index, totalAlbums, onAlbumSelect, isHovered, setHoveredId, linesContainer, isMobile, audioLevel, currentAlbum }) => {
  const baseRadius = 250;
  const radiusMotion = useMotionValue(baseRadius);

  // Only react if this is the currently playing album
  const isPlayingThisAlbum = currentAlbum?.id === album.id;

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
      {linesContainer && createPortal(
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
        />,
        linesContainer
      )}
      
      <AlbumNode
        album={album}
        index={index}
        totalAlbums={totalAlbums}
        radiusMotion={radiusMotion}
        onClick={onAlbumSelect}
        isHovered={isHovered}
        setHoveredId={setHoveredId}
        isMobile={isMobile}
        audioLevel={audioLevel}
        isPlayingThisAlbum={isPlayingThisAlbum}
      />
    </>
  );
};

// Media Node Component
const MediaNode: React.FC<{
  index: number;
  totalItems: number;
  radiusMotion: any;
  onClick: () => void;
  isHovered: boolean;
  setHoveredId: (id: string | null) => void;
  isMobile: boolean;
}> = ({ index, totalItems, radiusMotion, onClick, isHovered, setHoveredId, isMobile }) => {
  const angle = (index / totalItems) * 2 * Math.PI - (Math.PI / 2);
  
  const left = useTransform(radiusMotion, (r: number) => 500 + r * Math.cos(angle));
  const top = useTransform(radiusMotion, (r: number) => 500 + r * Math.sin(angle));

  return (
    <motion.div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      style={{ 
        left, 
        top,
        willChange: 'transform, opacity'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.1, type: "spring", damping: 12, stiffness: 200 }}
      onMouseEnter={() => setHoveredId('media')}
      onMouseLeave={() => setHoveredId(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="relative group">
        {/* Glow effect */}
        {!isMobile && (
          <div 
            className={`absolute inset-0 rounded-full bg-green-500/30 blur-xl transition-opacity duration-300 ${isHovered ? 'opacity-100 scale-150' : 'opacity-0'}`}
            style={{ willChange: 'opacity' }}
          />
        )}
        
        {/* Media Node */}
        <div 
          className={`relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 transition-all duration-300 ${isHovered ? 'border-green-400 scale-110' : 'border-green-500/40'}`}
          style={{
            boxShadow: isMobile 
              ? 'none' 
              : (isHovered ? '0 0 30px rgba(34, 197, 94, 0.6)' : '0 0 15px rgba(0,0,0,0.5)'),
            willChange: 'transform, box-shadow',
            backgroundColor: 'rgba(34, 197, 94, 0.1)'
          }}
        >
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-800/50 to-green-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-green-400">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          
          {/* Overlay */}
          <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`} />
        </div>

        {/* Label */}
        <motion.div 
          className="absolute top-full mt-3 left-1/2 transform -translate-x-1/2 text-center w-48 pointer-events-none"
          animate={{ y: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0.7 }}
        >
          <h3 className="text-white font-bold text-sm md:text-base shadow-black drop-shadow-lg">Media Library</h3>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Media Group Component
const MediaGroup: React.FC<{
  index: number;
  totalItems: number;
  onMediaSelect: () => void;
  isHovered: boolean;
  setHoveredId: (id: string | null) => void;
  linesContainer: SVGElement | null;
  isMobile: boolean;
}> = ({ index, totalItems, onMediaSelect, isHovered, setHoveredId, linesContainer, isMobile }) => {
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

  const angle = (index / totalItems) * 2 * Math.PI - (Math.PI / 2);
  const endX = useTransform(radiusMotion, (r: number) => 500 + r * Math.cos(angle));
  const endY = useTransform(radiusMotion, (r: number) => 500 + r * Math.sin(angle));

  return (
    <>
      {linesContainer && createPortal(
        <SpringLine
          x1={500}
          y1={500}
          x2={endX}
          y2={endY}
          stroke={isHovered ? "rgba(34, 197, 94, 0.8)" : "rgba(148, 163, 184, 0.3)"}
          strokeWidth={isHovered ? 2 : 1}
          opacity={1}
          delay={index * 0.1}
          index={index}
        />,
        linesContainer
      )}
      
      <MediaNode
        index={index}
        totalItems={totalItems}
        radiusMotion={radiusMotion}
        onClick={onMediaSelect}
        isHovered={isHovered}
        setHoveredId={setHoveredId}
        isMobile={isMobile}
      />
    </>
  );
};

const YearSpiderGraph: React.FC<Props> = ({ yearData, onAlbumSelect, onMediaSelect }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [linesContainer, setLinesContainer] = useState<SVGElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { audioLevel, currentAlbum } = usePlayer();

  // Check if current album belongs to this year
  const isCurrentYear = currentAlbum ? yearData.albums.some(a => a.id === currentAlbum.id) : false;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate total items (albums + media if exists)
  const totalAlbums = yearData.albums?.length || 0;
  const hasMedia = yearData.media && (
    (yearData.media.images && yearData.media.images.length > 0) ||
    (yearData.media.videos && yearData.media.videos.length > 0) ||
    (yearData.media.writing && yearData.media.writing.length > 0)
  );
  const totalItems = totalAlbums + (hasMedia ? 1 : 0);

  // If no albums and no media, show a message
  if (totalItems === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <p>No content recorded for {yearData.year}</p>
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
                {/* Circular Audio Spectrum for center node */}
                {isCurrentYear && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CircularSpectrum
                      size={128}
                      audioLevel={audioLevel}
                      isActive={isCurrentYear}
                      color="rgba(59, 130, 246, 0.8)"
                      barCount={20}
                    />
                  </div>
                )}

                {/* Glow */}
                {!isMobile && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl" />
                )}
                
                {/* Node */}
                <div 
                  className="relative w-32 h-32 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-blue-500/50"
                  style={{
                    boxShadow: isMobile ? 'none' : '0 0 40px rgba(59,130,246,0.4)'
                  }}
                >
                  <span className="text-white font-bold text-3xl">{yearData.year}</span>
                </div>
              </div>
            </motion.div>

            {/* Shared SVG Container for Lines */}
            <svg 
              ref={setLinesContainer}
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
            >
               {/* Portal target */}
            </svg>

            {/* Albums */}
            {yearData.albums.map((album, index) => (
              <AlbumGroup
                key={album.id}
                album={album}
                index={index}
                totalAlbums={totalItems}
                onAlbumSelect={onAlbumSelect}
                isHovered={hoveredId === album.id}
                setHoveredId={setHoveredId}
                linesContainer={linesContainer}
                isMobile={isMobile}
                audioLevel={audioLevel}
                currentAlbum={currentAlbum}
              />
            ))}

            {/* Media Library Node */}
            {hasMedia && onMediaSelect && (
              <MediaGroup
                index={totalAlbums}
                totalItems={totalItems}
                onMediaSelect={onMediaSelect}
                isHovered={hoveredId === 'media'}
                setHoveredId={setHoveredId}
                linesContainer={linesContainer}
                isMobile={isMobile}
              />
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
      
      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-60">
         <p className="text-slate-400 text-xs">Drag to explore • Click an album or media to view details</p>
      </div>
    </div>
  );
};

export default YearSpiderGraph;
