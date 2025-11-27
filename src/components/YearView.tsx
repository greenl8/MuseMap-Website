import React, { useState, useRef, useEffect } from 'react';
import type { DiscographyData, Album, Song } from '../types';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import YearSpiderGraph from './YearSpiderGraph';
import { usePlayer } from '../context/PlayerContext';
import CircularSpectrum from './CircularSpectrum';
import MediaLibraryView from './MediaLibraryView';

interface Props {
  yearData: DiscographyData;
  allDiscography: DiscographyData[];
  onBack: () => void;
  onYearChange: (year: DiscographyData) => void;
}

// Song Circle Component with Motion Animation
const SongCircle: React.FC<{
  song: Song;
  songIndex: number;
  x: number;
  y: number;
  circleRadius: number;
  isCurrentSong: boolean;
  isPlaying: boolean;
  audioLevel: any;
  onClick: () => void;
  isMobile: boolean;
}> = ({ song, songIndex, x, y, circleRadius, isCurrentSong, isPlaying, audioLevel, onClick, isMobile }) => {
  const baseY = y;
  const yMotion = useMotionValue(baseY);

  useEffect(() => {
    const animation = animate(
      yMotion,
      [baseY, baseY - 10, baseY],
      {
        duration: 3 + songIndex * 0.3,
        repeat: Infinity,
        ease: "easeInOut",
        delay: songIndex * 0.2,
      }
    );
    return () => animation.stop();
  }, [baseY, songIndex, yMotion]);

  const animatedY = useTransform(yMotion, (val) => val);

  return (
    <motion.div
      className="absolute flex flex-col items-center cursor-pointer group z-20"
      style={{
        left: x,
        top: animatedY,
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, opacity'
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        delay: songIndex * 0.1,
        type: "spring",
        damping: 15,
        stiffness: 200
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* Circle */}
      <div 
        className={`relative rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
          isCurrentSong 
            ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)]' 
            : 'border-purple-500/40 group-hover:border-purple-400/60'
        }`}
        style={{
          width: circleRadius * 2,
          height: circleRadius * 2,
          backgroundColor: isCurrentSong 
            ? 'rgba(168, 85, 247, 0.2)' 
            : 'rgba(30, 41, 59, 0.8)',
          boxShadow: isCurrentSong 
            ? '0 0 30px rgba(168, 85, 247, 0.6)' 
            : '0 0 15px rgba(0, 0, 0, 0.5)',
          willChange: 'transform, box-shadow'
        }}
      >
        {/* Audio Spectrum for current song */}
        {isCurrentSong && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CircularSpectrum
              size={circleRadius * 2}
              audioLevel={audioLevel}
              isActive={isPlaying}
              color="rgba(168, 85, 247, 0.8)"
              barCount={16}
            />
          </div>
        )}

        {/* Glow effect */}
        {!isMobile && (
          <div 
            className={`absolute inset-0 rounded-full bg-purple-500/30 blur-xl transition-opacity duration-300 ${
              isCurrentSong ? 'opacity-100 scale-150' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ willChange: 'opacity' }}
          />
        )}

        {/* Song Number or Play Icon */}
        <div className="relative z-10 flex items-center justify-center">
          {isCurrentSong && isPlaying ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="text-purple-300"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          ) : (
            <span className="text-purple-300 font-mono text-lg font-semibold">
              {songIndex + 1}
            </span>
          )}
        </div>
      </div>

      {/* Song Title */}
      <motion.div 
        className="mt-4 text-center max-w-[140px] pointer-events-none"
        animate={{ 
          y: isCurrentSong ? -5 : 0,
          opacity: isCurrentSong ? 1 : 0.8
        }}
      >
        <h3 className={`text-sm font-semibold transition-colors break-words ${
          isCurrentSong 
            ? 'text-purple-300' 
            : 'text-slate-300 group-hover:text-purple-300'
        }`}>
          {song.title}
        </h3>
      </motion.div>
    </motion.div>
  );
};

// Inner content component that can use useControls hook
const AlbumViewContent: React.FC<{
  album: Album;
  onBack: () => void;
  isMobile: boolean;
  circleRadius: number;
  circleSpacing: number;
  containerPadding: number;
  totalWidth: number;
  totalHeight: number;
  centerY: number;
}> = ({ album, onBack, isMobile, circleRadius, circleSpacing, containerPadding, totalWidth, totalHeight, centerY }) => {
  const { currentSong, isPlaying, playSong, togglePlay, audioLevel } = usePlayer();
  const controls = useControls();

  const handleSongClick = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, album);
    }
  };

  // Center on first track when component mounts
  useEffect(() => {
    const firstTrackX = containerPadding;
    const initialScale = 0.9;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Content is centered by flex, so content center is at viewport center
    // First track is at containerPadding from content left edge
    // Content center is at totalWidth/2 from content left edge
    // So first track is offset by (containerPadding - totalWidth/2) from content center
    
    const offsetFromContentCenterX = firstTrackX - totalWidth / 2;
    const offsetFromContentCenterY = centerY - totalHeight / 2;
    
    // To center first track in viewport, we need to pan by negative offset, accounting for scale
    // When scaled, the offset needs to be multiplied by scale
    const targetX = -offsetFromContentCenterX * initialScale;
    const targetY = -offsetFromContentCenterY * initialScale;
    
    // Wait for TransformWrapper to be ready, then set position
    const timer1 = setTimeout(() => {
      try {
        // Try setPosition with scale
        controls.setPosition(targetX, targetY, initialScale);
      } catch (e) {
        // If that fails, try without scale parameter
        try {
          controls.setPosition(targetX, targetY);
        } catch (e2) {
          // If both fail, try centerView if available
          if (controls.centerView) {
            controls.centerView(firstTrackX, centerY, initialScale);
          }
        }
      }
    }, 100);
    
    // Also try again after a longer delay as backup
    const timer2 = setTimeout(() => {
      try {
        controls.setPosition(targetX, targetY, initialScale);
      } catch (e) {
        // Silently fail
      }
    }, 600);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [controls, containerPadding, centerY, totalWidth, totalHeight]);

  return (
    <>
      <div className="relative flex-shrink-0" style={{ width: totalWidth, height: totalHeight }}>
        {/* Song Circles */}
        {album.songs.map((song, songIndex) => {
          const isCurrentSong = currentSong?.id === song.id;
          const x = containerPadding + songIndex * circleSpacing;
          
          return (
            <SongCircle
              key={song.id}
              song={song}
              songIndex={songIndex}
              x={x}
              y={centerY}
              circleRadius={circleRadius}
              isCurrentSong={isCurrentSong}
              isPlaying={isPlaying}
              audioLevel={audioLevel}
              onClick={() => handleSongClick(song)}
              isMobile={isMobile}
            />
          );
        })}
      </div>
    </>
  );
};

const AlbumView: React.FC<{ 
  album: Album; 
  onBack: () => void;
}> = ({ album, onBack }) => {
  // Responsive sizing
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const circleRadius = isMobile ? 40 : 60;
  const circleSpacing = isMobile ? 120 : 180; // Space between circle centers
  const containerPadding = isMobile ? 40 : 80;
  const totalWidth = Math.max(isMobile ? 600 : 800, (album.songs.length - 1) * circleSpacing + containerPadding * 2);
  const totalHeight = 600;
  const centerY = totalHeight / 2; // Center line Y position

  return (
    <div className="w-full h-full relative overflow-hidden bg-transparent">
      {/* Cover Art Background */}
      {album.coverUrl && (
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}${album.coverUrl.replace(/^\//, '')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
          }}
        />
      )}

      {/* Floating Header */}
      <div className="absolute top-0 left-0 p-6 md:p-10 z-30 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          className="pointer-events-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2 drop-shadow-lg">
            {album.title}
          </h2>
          {album.artist && (
            <p className="text-blue-300 text-lg md:text-xl font-medium drop-shadow-md">
              {album.artist}
            </p>
          )}
        </motion.div>
      </div>

      {/* Floating Back Button */}
      <div className="absolute top-0 right-0 p-6 md:p-10 z-30 pointer-events-none">
        <motion.button
          initial={{ x: 20, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          onClick={onBack}
          className="pointer-events-auto px-6 py-3 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-white rounded-full border border-white/20 shadow-lg flex items-center gap-2 transition-all group"
        >
          <span>Back to Albums</span>
          <span className="group-hover:translate-x-1 transition-transform">✕</span>
        </motion.button>
      </div>

      {/* Transform Wrapper for Pan/Zoom */}
      <TransformWrapper
        initialScale={0.9}
        minScale={0.5}
        maxScale={3}
        centerOnInit={false}
        limitToBounds={false}
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <AlbumViewContent
            album={album}
            onBack={onBack}
            isMobile={isMobile}
            circleRadius={circleRadius}
            circleSpacing={circleSpacing}
            containerPadding={containerPadding}
            totalWidth={totalWidth}
            totalHeight={totalHeight}
            centerY={centerY}
          />
        </TransformComponent>
      </TransformWrapper>
      
      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none opacity-60 z-30">
        <p className="text-slate-400 text-xs">Drag to explore • Click a song to play</p>
      </div>
    </div>
  );
};

const YearView: React.FC<Props> = ({ yearData, allDiscography, onBack, onYearChange }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showMedia, setShowMedia] = useState(false);

  // Find album index in the year's albums array
  const handleAlbumSelect = (album: Album) => {
    setSelectedAlbum(album);
    setShowMedia(false);
  };

  const handleMediaSelect = () => {
    setShowMedia(true);
    setSelectedAlbum(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900 text-white">
       <AnimatePresence mode="wait">
         {selectedAlbum ? (
            // ALBUM VIEW MODE - Full screen like spider view
            <motion.div
               key="album-view"
               className="absolute inset-0 z-0"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
               <AlbumView 
                 album={selectedAlbum}
                 onBack={() => setSelectedAlbum(null)} 
               />
            </motion.div>
         ) : showMedia && yearData.media ? (
            // MEDIA LIBRARY VIEW MODE
            <motion.div
               key="media-view"
               className="absolute inset-0 z-0 overflow-hidden"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
               <div className="w-full h-full relative bg-transparent">
                 {/* Floating Header */}
                 <div className="absolute top-0 left-0 p-6 md:p-10 z-30 pointer-events-none">
                   <motion.div 
                     initial={{ y: -20, opacity: 0 }} 
                     animate={{ y: 0, opacity: 1 }} 
                     className="pointer-events-auto"
                   >
                     <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 drop-shadow-lg">
                       {yearData.year}
                     </h1>
                     <p className="text-xl md:text-2xl text-green-200 mt-2 font-light max-w-md drop-shadow-md">
                       {yearData.description}
                     </p>
                   </motion.div>
                 </div>

                 {/* Floating Back Button */}
                 <div className="absolute top-0 right-0 p-6 md:p-10 z-30 pointer-events-none">
                   <motion.button
                     initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                     onClick={() => setShowMedia(false)}
                     className="pointer-events-auto px-6 py-3 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-white rounded-full border border-white/20 shadow-lg flex items-center gap-2 transition-all group"
                   >
                     <span>Back to Albums</span>
                     <span className="group-hover:translate-x-1 transition-transform">✕</span>
                   </motion.button>
                 </div>

                 {/* Scrollable Content Area */}
                 <div className="w-full h-full overflow-y-auto custom-scrollbar pt-32 pb-24">
                   <MediaLibraryView 
                     media={yearData.media}
                     year={yearData.year}
                     onBack={() => setShowMedia(false)}
                   />
                 </div>
               </div>
            </motion.div>
         ) : (
            // SPIDER VIEW MODE - Full Screen "Open Feel"
            <motion.div
               key="spider-view"
               className="absolute inset-0 z-0"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
               {/* Floating Header */}
               <div className="absolute top-0 left-0 p-6 md:p-10 z-20 pointer-events-none">
                  <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pointer-events-auto">
                      <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
                        {yearData.year}
                      </h1>
                      <p className="text-xl md:text-2xl text-purple-200 mt-2 font-light max-w-md drop-shadow-md">
                        {yearData.description}
                      </p>
                  </motion.div>
               </div>

               {/* Floating Back Button */}
               <div className="absolute top-0 right-0 p-6 md:p-10 z-20 pointer-events-none">
                  <motion.button
                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                    onClick={onBack}
                    className="pointer-events-auto px-6 py-3 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-white rounded-full border border-white/20 shadow-lg flex items-center gap-2 transition-all group"
                  >
                     <span>Back to Timeline</span>
                     <span className="group-hover:translate-x-1 transition-transform">✕</span>
                  </motion.button>
               </div>
               
               {/* The Graph - Full Screen */}
               <YearSpiderGraph 
                 yearData={yearData} 
                 onAlbumSelect={handleAlbumSelect}
                 onMediaSelect={handleMediaSelect}
               />
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default YearView;
