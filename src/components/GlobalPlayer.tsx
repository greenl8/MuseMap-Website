import React, { useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';

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
  const { currentSong, currentAlbum, isPlaying, setPlaying, nextSong, prevSong, togglePlay } = usePlayer();
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // YouTube Player Options
  const opts: YouTubeOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      playsinline: 1, // Critical for mobile
      rel: 0,
      showinfo: 0,
    },
  };

  // Update progress bar
  useEffect(() => {
    if (playerRef.current && isReady && isPlaying && currentSong) {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      
      // Update progress every 100ms
      progressIntervalRef.current = setInterval(() => {
        // Double-check player is still valid
        if (playerRef.current && isReady) {
          try {
            // Check if player methods are available
            if (typeof playerRef.current.getCurrentTime === 'function' && 
                typeof playerRef.current.getDuration === 'function') {
              const current = playerRef.current.getCurrentTime();
              const total = playerRef.current.getDuration();
              
              if (typeof current === 'number' && !isNaN(current) && isFinite(current)) {
                setCurrentTime(current);
              }
              if (typeof total === 'number' && !isNaN(total) && isFinite(total) && total > 0) {
                setDuration(total);
              }
            }
          } catch (error) {
            // Player might not be ready or might be transitioning
            // Silently handle - this is expected during transitions
          }
        }
      }, 100);
    } else {
      // Clear interval when paused or not ready
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isReady, isPlaying, currentSong]);

  // Handle Song Changes
  useEffect(() => {
    if (currentSong) {
      // Reset time and state when song changes
      setCurrentTime(0);
      setDuration(0);
      setIsReady(false);
      
      // Clear any existing progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Reset player ref - it will be set again when new video is ready
      // Don't set to null immediately to avoid race conditions
    }
  }, [currentSong]);

  // Handle Play/Pause State
  useEffect(() => {
    if (playerRef.current && isReady && currentSong) {
      try {
        if (isPlaying) {
          // Check if getPlayerState method exists before calling
          if (typeof playerRef.current.getPlayerState === 'function') {
            const playerState = playerRef.current.getPlayerState();
            // 1 = playing, 2 = paused, 5 = cued, -1 = unstarted
            if (playerState !== 1 && playerState !== 3) { // 3 is buffering
              if (typeof playerRef.current.playVideo === 'function') {
                playerRef.current.playVideo();
              }
            }
          }
        } else {
          if (typeof playerRef.current.pauseVideo === 'function') {
            playerRef.current.pauseVideo();
          }
        }
      } catch (error) {
        // Player might be transitioning - ignore errors during transitions
      }
    }
  }, [isPlaying, isReady, currentSong]);

  const onPlayerReady = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setIsReady(true);
    
    // Get initial duration
    try {
      const total = event.target.getDuration();
      if (typeof total === 'number' && !isNaN(total) && total > 0) {
        setDuration(total);
      }
    } catch (error) {
      // Duration might not be available immediately
    }
    
    if (isPlaying) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // Make sure event.target is valid
    if (!event.target) return;
    
    // Update local state if external factors (buffering, etc) change it?
    // Actually, we mostly care about Ended (0) or Playing (1) / Paused (2)
    if (event.data === 0) { // Ended
      // Use setTimeout to avoid race conditions during player cleanup
      setTimeout(() => {
        nextSong();
      }, 100);
    }
    if (event.data === 1) { // Playing
        if (!isPlaying) setPlaying(true);
        // Try to get duration when playing starts
        try {
          if (event.target && typeof event.target.getDuration === 'function') {
            const total = event.target.getDuration();
            if (typeof total === 'number' && !isNaN(total) && total > 0) {
              setDuration(total);
            }
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

  if (!currentSong) return null;

  return (
    <>
      {/* Hidden YouTube Player */}
      <div className="fixed bottom-0 left-0 w-px h-px opacity-0 pointer-events-none overflow-hidden">
        <YouTube
          videoId={currentSong.youtubeId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onEnd={() => nextSong()} // Redundant with onStateChange(0) but safe
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
                  src={currentAlbum.coverUrl} 
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
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"/>
                </svg>
              </button>

              <button 
                onClick={togglePlay}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white text-slate-900 flex items-center justify-center hover:bg-slate-200 transition-colors shadow-lg"
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
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default GlobalPlayer;

