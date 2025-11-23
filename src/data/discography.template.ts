/**
 * ARTIST CONFIGURATION TEMPLATE
 * 
 * Copy this file to create a new artist's discography.
 * Rename it to something like: artistName-discography.ts
 * 
 * Then update the artistConfig and discography data below.
 */

/**
 * ARTIST CONFIGURATION
 */
export const artistConfig = {
  name: "Artist Name", // Change this to the artist's name
  startYear: 2015, // First year to display on the map
  endYear: 2025, // Last year to display on the map
};

/**
 * DISCOGRAPHY DATA
 * 
 * Structure your discography here. Each year can have multiple albums.
 * Each album can have multiple songs.
 * 
 * HOW TO GET YOUTUBE VIDEO ID:
 * - Go to the YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
 * - Copy the part after "v=" (e.g., "dQw4w9WgXcQ")
 * 
 * TIPS:
 * - You can leave albums array empty [] for years with no releases
 * - The year will still appear on the map but show "No releases recorded"
 * - Use descriptive IDs like '2020-album-1', '2020-song-1' for easy tracking
 * - coverUrl is optional - leave empty string "" if you don't have album art
 */

import type { DiscographyData } from '../types';

export const discography: DiscographyData[] = [
  {
    year: 2015,
    description: "Year description here",
    albums: [
      {
        id: '2015-album-1',
        title: "Album Name",
        coverUrl: "", // Optional: URL to album cover image
        songs: [
          { 
            id: '2015-song-1', 
            title: 'Song Title', 
            youtubeId: 'YOUR_YOUTUBE_VIDEO_ID_HERE'
          },
          // Add more songs:
          // { id: '2015-song-2', title: 'Another Song', youtubeId: 'VIDEO_ID' },
        ]
      },
      // Add more albums for this year:
      // {
      //   id: '2015-album-2',
      //   title: "Another Album",
      //   songs: [...]
      // },
    ]
  },
  // Copy this block for each year:
  // {
  //   year: 2016,
  //   description: "Year description",
  //   albums: [...]
  // },
];

