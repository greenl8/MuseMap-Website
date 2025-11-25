import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useMotionValue, MotionValue } from 'framer-motion';
import type { Song, Album, DiscographyData } from '../types';
import { discography } from '../data/discography';

interface PlayerContextType {
  currentSong: Song | null;
  currentAlbum: Album | null;
  isPlaying: boolean;
  isShuffle: boolean;
  playSong: (song: Song, album: Album) => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
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

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledPlaylist, setShuffledPlaylist] = useState<Array<{ song: Song; album: Album; year: number }>>([]);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  
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

  // Initialize or reshuffle playlist when shuffle is toggled
  useEffect(() => {
    if (isShuffle) {
      const shuffled = shuffleArray(allSongs);
      setShuffledPlaylist(shuffled);
      // Find current song in shuffled playlist and set index
      if (currentSong) {
        const index = shuffled.findIndex(item => item.song.id === currentSong.id);
        setShuffleIndex(index >= 0 ? index : 0);
      } else {
        setShuffleIndex(0);
      }
    } else {
      // Clear shuffled playlist when shuffle is disabled
      setShuffledPlaylist([]);
    }
  }, [isShuffle, allSongs, currentSong]); // Include currentSong to update index when song changes

  // Update shuffle index when current song changes (if shuffle is enabled)
  useEffect(() => {
    if (isShuffle && currentSong && shuffledPlaylist.length > 0) {
      const index = shuffledPlaylist.findIndex(item => item.song.id === currentSong.id);
      if (index >= 0) {
        setShuffleIndex(index);
      }
    }
  }, [currentSong, isShuffle, shuffledPlaylist]);

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

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const newShuffle = !prev;
      if (newShuffle) {
        // Create new shuffled playlist
        const shuffled = shuffleArray(allSongs);
        setShuffledPlaylist(shuffled);
        // Find current song in shuffled playlist
        if (currentSong) {
          const index = shuffled.findIndex(item => item.song.id === currentSong.id);
          setShuffleIndex(index >= 0 ? index : 0);
        } else {
          setShuffleIndex(0);
        }
      }
      return newShuffle;
    });
  }, [allSongs, currentSong]);

  const nextSong = useCallback(() => {
    if (!currentSong) return;

    if (isShuffle && shuffledPlaylist.length > 0) {
      // Use shuffled playlist
      const nextIndex = (shuffleIndex + 1) % shuffledPlaylist.length;
      const nextItem = shuffledPlaylist[nextIndex];
      setShuffleIndex(nextIndex);
      setCurrentSong(nextItem.song);
      setCurrentAlbum(nextItem.album);
      setIsPlaying(true);
    } else {
      // Use chronological order
      const currentIndex = allSongs.findIndex(item => item.song.id === currentSong.id);
      if (currentIndex === -1) return;

      const nextIndex = (currentIndex + 1) % allSongs.length;
      const nextItem = allSongs[nextIndex];
      
      setCurrentSong(nextItem.song);
      setCurrentAlbum(nextItem.album);
      setIsPlaying(true);
    }
  }, [currentSong, allSongs, isShuffle, shuffledPlaylist, shuffleIndex]);

  const prevSong = useCallback(() => {
    if (!currentSong) return;

    if (isShuffle && shuffledPlaylist.length > 0) {
      // Use shuffled playlist
      const prevIndex = (shuffleIndex - 1 + shuffledPlaylist.length) % shuffledPlaylist.length;
      const prevItem = shuffledPlaylist[prevIndex];
      setShuffleIndex(prevIndex);
      setCurrentSong(prevItem.song);
      setCurrentAlbum(prevItem.album);
      setIsPlaying(true);
    } else {
      // Use chronological order
      const currentIndex = allSongs.findIndex(item => item.song.id === currentSong.id);
      if (currentIndex === -1) return;

      const prevIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
      const prevItem = allSongs[prevIndex];
      
      setCurrentSong(prevItem.song);
      setCurrentAlbum(prevItem.album);
      setIsPlaying(true);
    }
  }, [currentSong, allSongs, isShuffle, shuffledPlaylist, shuffleIndex]);

  return (
    <PlayerContext.Provider value={{
      currentSong,
      currentAlbum,
      isPlaying,
      isShuffle,
      playSong,
      togglePlay,
      toggleShuffle,
      nextSong,
      prevSong,
      setPlaying,
      audioLevel
    }}>
      {children}
    </PlayerContext.Provider>
  );
};
