import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import NoiseFieldVisualizer from './NoiseFieldVisualizer';
import BarsVisualizer from './BarsVisualizer';

// Types for YouTube Player
type YouTubeEvent = {
  data: number;
  target: any;
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

const GlobalPlayer: React.FC = () => {
  const { currentSong, currentAlbum, isPlaying, isShuffle, setPlaying, nextSong, prevSong, togglePlay, toggleShuffle } = usePlayer();
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [showVisualizerMenu, setShowVisualizerMenu] = useState(false);
  const [selectedVisualizer, setSelectedVisualizer] = useState<'noise' | 'bars'>('noise');
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // YouTube Player Options
  const opts: YouTubeOpts = {
    height: '1',
    width: '1',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      showinfo: 0,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  };

  // Update progress bar
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    if (playerRef.current && isReady && isPlaying) {
      // Update progress every 250ms
      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const current = playerRef.current.getCurrentTime();
            const total = playerRef.current.getDuration();
            
            if (typeof current === 'number' && !isNaN(current)) {
              setCurrentTime(current);
            }
            if (typeof total === 'number' && !isNaN(total) && total > 0) {
              setDuration(total);
            }
          } catch (error) {
            // Ignore errors during transitions
          }
        }
      }, 250);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isReady, isPlaying]);

  // Handle Song Changes - Reset state when song changes
  useEffect(() => {
    // Reset time and state when song changes
    setCurrentTime(0);
    setDuration(0);
    setIsReady(false);
    
    // Clear the player ref - new player will be created via key prop
    playerRef.current = null;
    
    // Clear any existing progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, [currentSong?.id]); // Only trigger on song ID change

  // Handle Play/Pause State
  useEffect(() => {
    if (!playerRef.current || !isReady) return;
    
    try {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (error) {
      // Player might be transitioning - ignore errors
    }
  }, [isPlaying, isReady]);

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    
    // Ensure not muted and volume is up
    try {
      event.target.unMute();
      event.target.setVolume(100);
    } catch (e) {
      // Ignore volume errors
    }
    
    // Get initial duration
    try {
      const total = event.target.getDuration();
      if (typeof total === 'number' && !isNaN(total) && total > 0) {
        setDuration(total);
      }
    } catch (error) {
      // Duration might not be available immediately
    }
    
    setIsReady(true);
    
    // Auto-play if we're supposed to be playing
    if (isPlaying) {
      try {
        event.target.playVideo();
      } catch (error) {
        // Ignore play errors
      }
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    if (!event.target) return;
    
    // YouTube player states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
    if (event.data === 0) { // Ended
      nextSong();
    }
    if (event.data === 1) { // Playing
      if (!isPlaying) setPlaying(true);
      // Try to get duration when playing starts
      try {
        const total = event.target.getDuration();
        if (typeof total === 'number' && !isNaN(total) && total > 0) {
          setDuration(total);
        }
      } catch (error) {
        // Duration might not be available yet
      }
    }
    if (event.data === 2) { // Paused
      if (isPlaying) setPlaying(false);
    }
  };

  const onPlayerError = (event: any) => {
    console.error("YouTube Player Error:", event);
    // Try next song on error?
    nextSong();
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle seeking on progress bar click
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration || !isReady) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const seekTime = percentage * duration;
    
    try {
      if (typeof playerRef.current.seekTo === 'function') {
        playerRef.current.seekTo(seekTime, true);
        setCurrentTime(seekTime);
      }
    } catch (error) {
      // Silently handle seek errors - might happen during transitions
    }
  };

  // Close visualizer menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowVisualizerMenu(false);
      }
    };

    if (showVisualizerMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVisualizerMenu]);

  const handleVisualizerSelect = (type: 'noise' | 'bars') => {
    setSelectedVisualizer(type);
    setShowVisualizerMenu(false);
    setShowVisualizer(true);
  };

  if (!currentSong) return null;

  return (
    <>
      {/* Hidden YouTube Player */}
      <div className="fixed bottom-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden">
        <YouTube
          key={currentSong.id}
          videoId={currentSong.youtubeId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onError={onPlayerError}
        />
      </div>

      {/* Visible Mini Player Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
      >
        <div className="max-w-3xl mx-auto bg-slate-900/80 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-3">
          {/* Progress Bar / Timeline */}
          <div className="mb-3">
            <div 
              className="w-full h-1.5 bg-slate-700/50 rounded-full cursor-pointer group relative"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-purple-500 rounded-full transition-all duration-100 relative"
                style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Album Art */}
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
              {currentAlbum?.coverUrl ? (
                <img 
                  src={`${import.meta.env.BASE_URL}${currentAlbum.coverUrl.replace(/^\//, '')}`} 
                  alt={currentAlbum.title} 
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse-slow' : ''}`} 
                />
              ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                  <span className="text-lg">🎵</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm md:text-base truncate">
                {currentSong.title}
              </h3>
              <p className="text-slate-400 text-xs md:text-sm truncate">
                {currentAlbum?.artist || "Artist"} • {currentAlbum?.title}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 md:gap-4">
              <button 
                onClick={prevSong}
                className="text-slate-400 hover:text-white transition-colors p-2"
                title="Previous song"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"/>
                </svg>
              </button>

              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-lg"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>

              <button 
                onClick={nextSong}
                className="text-slate-400 hover:text-white transition-colors p-2"
                title="Next song"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z"/>
                </svg>
              </button>

              <button 
                onClick={toggleShuffle}
                className={`transition-colors p-2 ${
                  isShuffle 
                    ? 'text-purple-400 hover:text-purple-300' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title={isShuffle ? "Shuffle: On" : "Shuffle: Off"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                </svg>
              </button>

              <div className="relative" ref={menuRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVisualizerMenu(!showVisualizerMenu);
                  }}
                  className="text-slate-400 hover:text-purple-400 transition-colors p-2"
                  title="Audio Visualizers"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </button>
                
                {/* Visualizer Selection Menu */}
                <AnimatePresence>
                  {showVisualizerMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full right-0 mb-2 bg-slate-800/95 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[180px]"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVisualizerSelect('noise');
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span className="text-sm">Noise Field</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVisualizerSelect('bars');
                        }}
                        className="w-full px-4 py-3 text-left text-white hover:bg-slate-700/50 transition-colors flex items-center gap-2 border-t border-white/10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                        </svg>
                        <span className="text-sm">Bars</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Visualizers */}
      <AnimatePresence>
        {showVisualizer && selectedVisualizer === 'noise' && (
          <NoiseFieldVisualizer 
            key="noise-field-visualizer"
            onClose={() => setShowVisualizer(false)} 
          />
        )}
        {showVisualizer && selectedVisualizer === 'bars' && (
          <BarsVisualizer 
            key="bars-visualizer"
            onClose={() => setShowVisualizer(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalPlayer;


