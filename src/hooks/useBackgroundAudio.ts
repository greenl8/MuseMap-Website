import { useEffect, useRef, useCallback } from 'react';

interface MediaSessionOptions {
  title: string;
  artist: string;
  album: string;
  artwork?: string;
  isPlaying: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSeekBackward?: () => void;
  onSeekForward?: () => void;
}

/**
 * Hook to enable background audio playback on mobile devices.
 * Uses Media Session API for lock screen controls and a silent audio context
 * to keep the audio pipeline alive when the tab is in the background.
 */
export function useBackgroundAudio(options: MediaSessionOptions) {
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const keepAliveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    title,
    artist,
    album,
    artwork,
    isPlaying,
    onPlay,
    onPause,
    onNext,
    onPrev,
    onSeekBackward,
    onSeekForward,
  } = options;

  // Create a silent audio element to keep the audio session alive
  const initSilentAudio = useCallback(() => {
    if (silentAudioRef.current) return;

    // Create a silent audio element
    // This tricks the browser into keeping our audio session active
    const audio = new Audio();
    
    // Create a tiny silent audio using a data URI
    // This is a minimal valid MP3 file (silence)
    audio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbAAqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV1dXV//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAbD/////////////////////////////////////////////////';
    
    audio.loop = true;
    audio.volume = 0.001; // Nearly silent but not muted
    audio.playsInline = true;
    
    // Set attributes for mobile
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    
    silentAudioRef.current = audio;

    return audio;
  }, []);

  // Initialize AudioContext for additional background support
  const initAudioContext = useCallback(() => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (e) {
      console.warn('Could not create AudioContext:', e);
    }
  }, []);

  // Keep the audio context alive
  const startKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) return;

    keepAliveIntervalRef.current = setInterval(() => {
      // Resume audio context if it was suspended
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }

      // Make sure silent audio is playing
      if (silentAudioRef.current && silentAudioRef.current.paused && isPlaying) {
        silentAudioRef.current.play().catch(() => {});
      }
    }, 1000);
  }, [isPlaying]);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveIntervalRef.current) {
      clearInterval(keepAliveIntervalRef.current);
      keepAliveIntervalRef.current = null;
    }
  }, []);

  // Update Media Session metadata
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const artworkArray: MediaImage[] = [];
    if (artwork) {
      artworkArray.push(
        { src: artwork, sizes: '96x96', type: 'image/jpeg' },
        { src: artwork, sizes: '128x128', type: 'image/jpeg' },
        { src: artwork, sizes: '192x192', type: 'image/jpeg' },
        { src: artwork, sizes: '256x256', type: 'image/jpeg' },
        { src: artwork, sizes: '384x384', type: 'image/jpeg' },
        { src: artwork, sizes: '512x512', type: 'image/jpeg' }
      );
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title || 'Unknown Track',
      artist: artist || 'Unknown Artist',
      album: album || 'Unknown Album',
      artwork: artworkArray,
    });
  }, [title, artist, album, artwork]);

  // Update playback state
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Set up Media Session action handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    const handlers: { [key: string]: MediaSessionActionHandler | null } = {
      play: onPlay || null,
      pause: onPause || null,
      previoustrack: onPrev || null,
      nexttrack: onNext || null,
      seekbackward: onSeekBackward || null,
      seekforward: onSeekForward || null,
    };

    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(
          action as MediaSessionAction,
          handler
        );
      } catch (e) {
        // Some actions might not be supported
        console.warn(`Media Session action "${action}" not supported`);
      }
    });

    return () => {
      // Clean up handlers
      Object.keys(handlers).forEach((action) => {
        try {
          navigator.mediaSession.setActionHandler(
            action as MediaSessionAction,
            null
          );
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, [onPlay, onPause, onNext, onPrev, onSeekBackward, onSeekForward]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        // Page is hidden but we're playing - ensure audio stays active
        if (audioContextRef.current?.state === 'suspended') {
          audioContextRef.current.resume().catch(() => {});
        }
        if (silentAudioRef.current?.paused) {
          silentAudioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Start/stop silent audio based on playback state
  useEffect(() => {
    if (isPlaying) {
      // Initialize on first play (requires user gesture)
      initSilentAudio();
      initAudioContext();
      startKeepAlive();

      // Start silent audio
      if (silentAudioRef.current) {
        silentAudioRef.current.play().catch((e) => {
          // Autoplay might be blocked - that's okay, user interaction will start it
          console.warn('Silent audio autoplay blocked:', e);
        });
      }

      // Resume audio context
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    } else {
      // Pause silent audio when not playing
      if (silentAudioRef.current && !silentAudioRef.current.paused) {
        silentAudioRef.current.pause();
      }
      stopKeepAlive();
    }
  }, [isPlaying, initSilentAudio, initAudioContext, startKeepAlive, stopKeepAlive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopKeepAlive();
      
      if (silentAudioRef.current) {
        silentAudioRef.current.pause();
        silentAudioRef.current.src = '';
        silentAudioRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [stopKeepAlive]);
}

