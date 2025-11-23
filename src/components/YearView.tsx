import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { DiscographyData, Album, Song } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

// Define types locally - react-youtube exports may not work with Vite
type YouTubeEvent = {
  data: any;
  target: any; // YouTubePlayer instance
};

type YouTubeOpts = {
  width?: string | number;
  height?: string | number;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    modestbranding?: number;
    showinfo?: number;
    rel?: number;
    iv_load_policy?: number;
    fs?: number;
    cc_load_policy?: number;
    playsinline?: number;
    disablekb?: number;
    enablejsapi?: number;
    origin?: string;
  };
};

interface Props {
  yearData: DiscographyData;
  allDiscography: DiscographyData[];
  onBack: () => void;
  onYearChange: (year: DiscographyData) => void;
}

// Helper function to get all songs chronologically across all years
const getAllSongsChronologically = (allDiscography: DiscographyData[]): Array<{ 
  song: Song; 
  album: Album; 
  year: number; 
  yearIndex: number;
  albumIndex: number; 
  songIndex: number 
}> => {
  const allSongs: Array<{ 
    song: Song; 
    album: Album; 
    year: number; 
    yearIndex: number;
    albumIndex: number; 
    songIndex: number 
  }> = [];
  
  allDiscography.forEach((yearData, yearIndex) => {
    yearData.albums.forEach((album, albumIndex) => {
      album.songs.forEach((song, songIndex) => {
        allSongs.push({ 
          song, 
          album, 
          year: yearData.year, 
          yearIndex,
          albumIndex, 
          songIndex 
        });
      });
    });
  });
  
  return allSongs;
};

// Helper function to get next song chronologically
const getNextSongInfo = (
  allDiscography: DiscographyData[],
  currentYear: number,
  currentAlbumIndex: number,
  currentSongIndex: number
): { 
  song: Song; 
  album: Album; 
  year: number; 
  yearIndex: number;
  albumIndex: number;
  songIndex: number;
} | null => {
  const allSongs = getAllSongsChronologically(allDiscography);
  const currentYearData = allDiscography.find(y => y.year === currentYear);
  if (!currentYearData) return null;
  
  const currentIndex = allSongs.findIndex(
    item => item.year === currentYear && 
            item.albumIndex === currentAlbumIndex && 
            item.songIndex === currentSongIndex
  );
  
  if (currentIndex === -1) return null;
  
  // If last song, loop to first
  if (currentIndex === allSongs.length - 1) {
    return allSongs[0];
  }
  
  return allSongs[currentIndex + 1];
};

const AlbumView: React.FC<{ 
  album: Album; 
  year: number;
  yearIndex: number;
  albumIndex: number;
  allDiscography: DiscographyData[];
  onBack: () => void;
  onNavigateToAlbum: (yearIndex: number, albumIndex: number, songIndex: number, shouldAutoplay?: boolean) => void;
  initialSongIndex?: number;
  shouldAutoplay?: boolean;
}> = ({ album, year, yearIndex, albumIndex, allDiscography, onBack, onNavigateToAlbum, initialSongIndex = 0, shouldAutoplay = false }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(initialSongIndex);
  const playerRefs = useRef<{ [key: string]: any }>({});

  // Handle video end - auto advance to next song
  const handleVideoEnd = (event: YouTubeEvent, songIndex: number) => {
    const nextSongInfo = getNextSongInfo(allDiscography, year, albumIndex, songIndex);
    
    if (nextSongInfo) {
      // If next song is in same album, play it
      if (nextSongInfo.year === year && nextSongInfo.album.id === album.id) {
        setCurrentSongIndex(nextSongInfo.songIndex);
        // Play the next video
        const nextPlayer = playerRefs.current[nextSongInfo.song.id];
        if (nextPlayer) {
          setTimeout(() => {
            nextPlayer.playVideo();
          }, 500);
        }
      } else {
        // Next song is in different album/year - navigate to it with autoplay flag
        onNavigateToAlbum(nextSongInfo.yearIndex, nextSongInfo.albumIndex, nextSongInfo.songIndex, true);
      }
    } else {
      // Loop back to first song with autoplay flag
      const firstSong = getAllSongsChronologically(allDiscography)[0];
      if (firstSong) {
        onNavigateToAlbum(firstSong.yearIndex, firstSong.albumIndex, firstSong.songIndex, true);
      }
    }
  };

  const onPlayerReady = (event: YouTubeEvent, songId: string, songIndex: number) => {
    playerRefs.current[songId] = event.target;
    
    // Only autoplay if this is the initial song AND we're auto-advancing (not manual selection)
    if (shouldAutoplay && songIndex === initialSongIndex) {
      setTimeout(() => {
        event.target.playVideo();
      }, 500);
    }
  };

  // Reset song index when album changes
  useEffect(() => {
    setCurrentSongIndex(initialSongIndex);
  }, [album.id, initialSongIndex]);

  // YouTube player options - minimal controls only
  const getPlayerOpts = (): YouTubeOpts => ({
    width: '100%',
    height: '200',
    playerVars: {
      autoplay: 0,
      controls: 1, // Show controls (play/pause and timeline)
      modestbranding: 1,
      showinfo: 0, // Hide video title
      rel: 0, // Don't show related videos
      iv_load_policy: 3, // Hide annotations
      fs: 0, // Hide fullscreen button
      cc_load_policy: 0, // Hide captions
      playsinline: 1,
      disablekb: 1,
      enablejsapi: 1,
      origin: window.location.origin,
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative"
    >
      {/* Cover Art Background */}
      {album.coverUrl && (
        <div 
          className="fixed inset-0 opacity-20 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${album.coverUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(40px)',
          }}
        />
      )}

      {/* Back Button */}
      <motion.button
        onClick={onBack}
        className="mb-6 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-colors border border-purple-500/20 text-purple-300 hover:text-purple-200 flex items-center gap-2 text-sm relative z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>←</span>
        <span>Back to Albums</span>
      </motion.button>

      {/* Album Title */}
      <div className="mb-8 relative z-10">
        <motion.h2
          className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textShadow: '0 0 20px rgba(168, 85, 247, 0.3)',
          }}
        >
          {album.title}
        </motion.h2>
        {album.artist && (
          <motion.p
            className="text-blue-300 text-xl font-medium"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {album.artist}
          </motion.p>
        )}
      </div>

      {/* Songs Grid */}
      <div className="grid md:grid-cols-2 gap-6 relative z-10">
        {album.songs.map((song, songIndex) => (
          <motion.div
            key={song.id}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all group backdrop-blur-md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: songIndex * 0.05 }}
            whileHover={{ scale: 1.02, y: -5 }}
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Song Title */}
            <div className="p-5 border-b border-purple-500/10 bg-gradient-to-r from-purple-900/40 to-blue-900/40">
              <h3 className="font-semibold text-lg text-slate-200 group-hover:text-purple-300 transition-colors mb-1">
                {song.title}
              </h3>
              {album.artist && (
                <p className="text-blue-300 text-sm font-medium">{album.artist}</p>
              )}
            </div>

            {/* YouTube Player - Minimal, clipped container */}
            <div className="w-full bg-black relative overflow-hidden" style={{ height: '50px' }}>
              <div style={{ 
                position: 'absolute',
                top: '-60px', // Position iframe so bottom controls with logo show fully
                left: 0,
                width: '100%',
                height: '200px',
              }}>
                  <YouTube
                    videoId={song.youtubeId}
                    className="w-full"
                    iframeClassName="w-full h-full"
                    opts={getPlayerOpts()}
                    onReady={(e) => onPlayerReady(e, song.id, songIndex)}
                    onEnd={(e) => handleVideoEnd(e, songIndex)}
                  />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const YearView: React.FC<Props> = ({ yearData, allDiscography, onBack, onYearChange }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState<number>(0);
  const [selectedSongIndex, setSelectedSongIndex] = useState<number>(0);
  const [shouldAutoplay, setShouldAutoplay] = useState<boolean>(false);
  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(() => {
    return allDiscography.findIndex(y => y.year === yearData.year);
  });

  // Reset selected album when yearData changes (unless we're navigating)
  const navigatingRef = useRef<{ yearIndex: number; albumIndex: number; songIndex: number; shouldAutoplay: boolean } | null>(null);
  
  useEffect(() => {
    const newYearIndex = allDiscography.findIndex(y => y.year === yearData.year);
    setSelectedYearIndex(newYearIndex);
    
    // If we were navigating, apply the navigation now
    if (navigatingRef.current && navigatingRef.current.yearIndex === newYearIndex) {
      const { albumIndex, songIndex, shouldAutoplay: autoplay } = navigatingRef.current;
      const targetYear = allDiscography[newYearIndex];
      if (targetYear && targetYear.albums[albumIndex]) {
        setSelectedAlbumIndex(albumIndex);
        setSelectedAlbum(targetYear.albums[albumIndex]);
        setSelectedSongIndex(songIndex);
        setShouldAutoplay(autoplay);
      }
      navigatingRef.current = null;
    } else if (!navigatingRef.current) {
      // If not navigating, reset selected album
      setSelectedAlbum(null);
      setSelectedSongIndex(0);
      setShouldAutoplay(false);
    }
  }, [yearData.year, allDiscography]);

  // Navigate to a specific album (can be in different year)
  const handleNavigateToAlbum = (yearIndex: number, albumIndex: number, songIndex: number = 0, shouldAutoplayFlag: boolean = false) => {
    const targetYear = allDiscography[yearIndex];
    if (!targetYear || !targetYear.albums[albumIndex]) return;
    
    // If different year, change year and mark navigation
    if (yearIndex !== selectedYearIndex) {
      navigatingRef.current = { yearIndex, albumIndex, songIndex, shouldAutoplay: shouldAutoplayFlag };
      setSelectedYearIndex(yearIndex);
      onYearChange(targetYear);
    } else {
      setSelectedAlbumIndex(albumIndex);
      setSelectedAlbum(targetYear.albums[albumIndex]);
      setSelectedSongIndex(songIndex);
      setShouldAutoplay(shouldAutoplayFlag);
    }
  };

  // Find album index in the year's albums array
  const handleAlbumSelect = (album: Album) => {
    const index = yearData.albums.findIndex(a => a.id === album.id);
    setSelectedAlbumIndex(index);
    setSelectedAlbum(album);
    setSelectedSongIndex(0); // Reset to first song when manually selecting
    setShouldAutoplay(false); // Never autoplay on manual selection
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
    >
      {/* Animated Backdrop */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-purple-900/90 to-slate-900/95 pointer-events-auto"
        onClick={onBack}
      />

      {/* Modal Content */}
      <motion.div
        className="relative w-full max-w-6xl h-[90vh] bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden pointer-events-auto flex flex-col backdrop-blur-xl"
        style={{
          boxShadow: '0 0 60px rgba(168, 85, 247, 0.3), inset 0 0 40px rgba(59, 130, 246, 0.1)',
        }}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Header */}
        <div className="relative p-8 border-b border-purple-500/20 flex items-center justify-between bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur sticky top-0 z-20 overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.1), transparent)',
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <div className="relative z-10">
            <motion.h1
              className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                textShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {yearData.year}
            </motion.h1>
            <motion.p
              className="text-purple-300 mt-2 text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {yearData.description}
            </motion.p>
          </div>

          <motion.button
            onClick={onBack}
            className="relative z-10 px-6 py-3 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 rounded-full transition-all border border-white/20 text-white font-medium text-sm flex items-center gap-2 group backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)',
            }}
          >
            <span>Close</span>
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
            >
              ✕
            </motion.span>
          </motion.button>
        </div>

        {/* Content Area - Albums List or Album View */}
        <AnimatePresence mode="wait">
          {selectedAlbum ? (
            <AlbumView 
              key={selectedAlbum.id} 
              album={selectedAlbum} 
              year={yearData.year}
              yearIndex={selectedYearIndex}
              albumIndex={selectedAlbumIndex}
              allDiscography={allDiscography}
              onBack={() => {
                setSelectedAlbum(null);
                setShouldAutoplay(false);
              }} 
              onNavigateToAlbum={handleNavigateToAlbum}
              initialSongIndex={selectedSongIndex}
              shouldAutoplay={shouldAutoplay}
            />
          ) : (
            <motion.div
              key="albums-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 overflow-y-auto p-8 custom-scrollbar"
            >
              {yearData.albums.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearData.albums.map((album, albumIndex) => (
                    <motion.div
                      key={album.id}
                      className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-400/40 transition-all cursor-pointer group backdrop-blur-sm"
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: albumIndex * 0.1 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      onClick={() => handleAlbumSelect(album)}
                      style={{
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {/* Album Cover Area */}
                      <div className="aspect-square w-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center relative overflow-hidden">
                        {album.coverUrl ? (
                          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-6xl opacity-50">🎵</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="text-white font-bold text-xl mb-1">{album.title}</div>
                          {album.artist && (
                            <div className="text-blue-300 text-xs mb-1 font-medium">{album.artist}</div>
                          )}
                          <div className="text-purple-300 text-sm">{album.songs.length} {album.songs.length === 1 ? 'Song' : 'Songs'}</div>
                        </div>
                      </div>

                      {/* Album Info */}
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm group-hover:text-purple-300 transition-colors">
                            Click to explore →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="text-center text-slate-400 py-20 flex flex-col items-center gap-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center text-4xl border border-purple-500/30"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    🎵
                  </motion.div>
                  <p className="text-xl">No releases recorded for this year.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default YearView;
