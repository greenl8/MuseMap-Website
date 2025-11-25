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

export interface MediaImage {
  id: string;
  title: string;
  url: string;
  description?: string;
}

export interface MediaVideo {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
}

export interface MediaWriting {
  id: string;
  title: string;
  content: string;
  description?: string;
}

export interface MediaLibrary {
  images?: MediaImage[];
  videos?: MediaVideo[];
  writing?: MediaWriting[];
}

export interface DiscographyData {
  year: number;
  description: string;
  albums: Album[];
  media?: MediaLibrary; // Optional media library for each year
  // Legacy support for direct songs if needed, or we migrate fully to albums
  singles?: Song[]; 
}
