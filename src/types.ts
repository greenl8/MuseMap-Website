export interface Song {
  id: string;
  title: string;
  youtubeId: string;
}

export interface Album {
  id: string;
  title: string;
  artist?: string; // Artist name for this album (may vary by year)
  coverUrl?: string; // Optional: for album art
  songs: Song[];
}

export interface DiscographyData {
  year: number;
  description: string;
  albums: Album[];
  // Legacy support for direct songs if needed, or we migrate fully to albums
  singles?: Song[]; 
}
