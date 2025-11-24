import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';
import type { Song, Album, DiscographyData } from '../types';
import { discography } from '../data/discography';

interface PlayerContextType {
  currentSong: Song | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  playSong: (song: Song, album: Album) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setPlaying: (playing: boolean) => void;
  audioLevel: MotionValue<number>; // 0 to 1 value representing "loudness" or "beat"
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Helper to flatten songs for navigation
const getAllSongsChronologically = (allDiscography: DiscographyData[]) => {
  const allSongs: Array<{ 
    song: Song; 
    album: Album; 
    year: number; 
  }> = [];
  
  allDiscography.forEach((yearData) => {
    yearData.albums.forEach((album) => {
      album.songs.forEach((song) => {
        allSongs.push({ 
          song, 
          album, 
          year: yearData.year, 
        });
      });
    });
  });
  
  return allSongs;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Shared audio level value (0 to 1)
  const audioLevel = useMotionValue(0);

  // Simulated Audio Visualization Loop
  useEffect(() => {
    let animationFrameId: number;
    
    const updateAudioLevel = () => {
      if (isPlaying) {
        // Create a simulated "beat" pattern
        const time = Date.now() / 1000;
        
        // Base beat (approx 120 BPM) + some Perlin-like noise using sines
        const beat = Math.sin(time * 10) * 0.5 + 0.5; // Fast pulse
        const bass = Math.sin(time * 3) * 0.5 + 0.5;  // Slow swell
        const random = Math.random() * 0.2;           // Noise
        
        // Combine for a dynamic feeling value
        // We want mostly around 0.3-0.5 with spikes to 1.0
        const level = (beat * 0.3 + bass * 0.4 + random) * 0.8 + 0.2;
        
        audioLevel.set(level);
      } else {
        // Smoothly decay to 0 (or just set to 0 for now)
        const current = audioLevel.get();
        if (current > 0.01) {
            audioLevel.set(current * 0.9);
        } else {
            audioLevel.set(0);
        }
      }
      
      animationFrameId = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, audioLevel]);

  const allSongs = useMemo(() => getAllSongsChronologically(discography), []);

  const playSong = useCallback((song: Song, album: Album) => {
    setCurrentSong(song);
    setCurrentAlbum(album);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (currentSong) {
      setIsPlaying(prev => !prev);
    }
  }, [currentSong]);

  const setPlaying = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  const nextSong = useCallback(() => {
    if (!currentSong) return;

    const currentIndex = allSongs.findIndex(item => item.song.id === currentSong.id);
    if (currentIndex === -1) return;

    const nextIndex = (currentIndex + 1) % allSongs.length;
    const nextItem = allSongs[nextIndex];
    
    setCurrentSong(nextItem.song);
    setCurrentAlbum(nextItem.album);
    setIsPlaying(true);
  }, [currentSong, allSongs]);

  const prevSong = useCallback(() => {
    if (!currentSong) return;

    const currentIndex = allSongs.findIndex(item => item.song.id === currentSong.id);
    if (currentIndex === -1) return;

    const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    const prevItem = allSongs[prevIndex];
    
    setCurrentSong(prevItem.song);
    setCurrentAlbum(prevItem.album);
    setIsPlaying(true);
  }, [currentSong, allSongs]);

  return (
    <PlayerContext.Provider value={{
      currentSong,
      currentAlbum,
      isPlaying,
      playSong,
      togglePlay,
      nextSong,
      prevSong,
      setPlaying,
      audioLevel
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
