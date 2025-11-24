import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { DiscographyData, Album, Song } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import YearSpiderGraph from './YearSpiderGraph';

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

  // Handle video play - stop other videos
  const handleVideoPlay = (playingSongId: string) => {
    Object.keys(playerRefs.current).forEach((songId) => {
      if (songId !== playingSongId && playerRefs.current[songId]) {
        if (typeof playerRefs.current[songId].pauseVideo === 'function') {
          playerRefs.current[songId].pauseVideo();
        }
      }
    });
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
      className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar relative"
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
          className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2"
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
            className="text-blue-300 text-lg md:text-xl font-medium"
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
                    onPlay={() => handleVideoPlay(song.id)}
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900 text-white">
       {/* We need a way to handle the "Back" action for the main view. 
           If we are in AlbumView, "Back" goes to YearView (Spider).
           If we are in YearView, "Back" goes to Main App (onBack prop).
       */}

       <AnimatePresence mode="wait">
         {selectedAlbum ? (
            // ALBUM VIEW MODE - Keep inside a modal/container for readability
            <motion.div 
               key="album-view-modal"
               className="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8"
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedAlbum(null)} />
                <motion.div 
                   className="relative w-full max-w-6xl h-full bg-slate-900/90 rounded-3xl border border-purple-500/20 overflow-hidden flex flex-col shadow-2xl"
                   initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }}
                >
                    {/* Close button for Album View (returns to Spider) */}
                   <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                       <h2 className="text-xl font-bold">{yearData.year} Releases</h2>
                       <button onClick={() => setSelectedAlbum(null)} className="px-4 py-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                          Close Album
                       </button>
                   </div>

                   <AlbumView 
                     album={selectedAlbum}
                     year={yearData.year}
                     yearIndex={selectedYearIndex}
                     albumIndex={selectedAlbumIndex}
                     allDiscography={allDiscography}
                     onBack={() => setSelectedAlbum(null)} 
                     onNavigateToAlbum={handleNavigateToAlbum}
                     initialSongIndex={selectedSongIndex}
                     shouldAutoplay={shouldAutoplay}
                   />
                </motion.div>
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
               />
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default YearView;
