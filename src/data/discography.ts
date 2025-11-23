/**
 * ARTIST CONFIGURATION
 * 
 * Change these values to customize for different artists
 */
export const artistConfig = {
  name: "mind.space", // Displayed in the center of the spider diagram
  startYear: 2015, // First year to display
  endYear: 2025, // Last year to display
};

/**
 * DISCOGRAPHY DATA
 * 
 * Structure your discography here. Each year can have multiple albums.
 * Each album can have multiple songs.
 * 
 * To get a YouTube video ID:
 * - Go to the YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
 * - Copy the part after "v=" (e.g., "dQw4w9WgXcQ")
 * 
 * TIP: You can leave albums array empty for years with no releases.
 *      The year will still appear on the map but show "No releases recorded".
 */

import type { DiscographyData } from '../types';

export const discography: DiscographyData[] = [
  // ============================================
  // 2015
  // ============================================
  {
    year: 2015,
    description: "The Beginning",
    albums: [
      {
        id: '2015-album-1',
        title: "Myriad Tractors EP",
        artist: "Jude Spliff",
        coverUrl: "", // Optional: URL to album cover image
        songs: [
          { 
            id: '2015-song-1', 
            title: 'Myriad Tractors', 
            youtubeId: 'r2TuIgsOdqg'
          },
          { 
            id: '2015-song-2', 
            title: 'Sweatcarn', 
            youtubeId: 'mRimhyOBpQ8'
          },
          { 
            id: '2015-song-3', 
            title: 'e1du', 
            youtubeId: '1KA9zX4Sv-I'
          },
          { 
            id: '2015-song-4', 
            title: 'fmeianstt', 
            youtubeId: 'D3P9vH2u6Mc'
          },
          { 
            id: '2015-song-5', 
            title: 'h1lom', 
            youtubeId: '2G26jmMfWaE'
          },
          { 
            id: '2015-song-6', 
            title: 'ludicrous', 
            youtubeId: 'Jde3tj2ugJw'
          },
        ]
      },
    ]
  },

  // ============================================
  // 2016
  // ============================================
  {
    year: 2016,
    description: "Finding My Sound",
    albums: [
      {
        id: '2016-album-1',
        title: "IBN Series",
        artist: "Voodoo Acid",
        coverUrl: "/resources/packard.jpg", // Cover art
        songs: [
          { id: '2016-song-1', title: '2043 N TIP', youtubeId: 'l63xOXuKfz8' },
          { id: '2016-song-2', title: 'alkali', youtubeId: 'KqaWUYpiNkQ' },
          { id: '2016-song-3', title: 'Cadbury Gorilla', youtubeId: 'Se1pex01T2s' },
          { id: '2016-song-4', title: 'dnone', youtubeId: 'z1DKvOzqNZQ' },
          { id: '2016-song-5', title: 'fluid', youtubeId: '11sCXykDT7o' },
          { id: '2016-song-6', title: 'IBN breaks', youtubeId: 'nCqizqcBGe0' },
          { id: '2016-song-7', title: 'luke vibert', youtubeId: 'REPgG6mOjYs' },
          { id: '2016-song-8', title: 'market pay breakbeat', youtubeId: 'aO1oQrn08cM' },
          { id: '2016-song-9', title: 'market pay', youtubeId: '0JvY8Rv-N1s' },
        ]
      },
      {
        id: '2016-album-2',
        title: "Ninth Life",
        artist: "Voodoo Acid",
        coverUrl: "/resources/ninthlife.jpg", // Cover art
        songs: [
          { id: '2016-song-10', title: 'scarlett', youtubeId: 'hS00a5m0fKc' },
          { id: '2016-song-11', title: 'check the hard line', youtubeId: '6ETSq_U4-0k' },
          { id: '2016-song-12', title: 'you can see', youtubeId: 'Nt6YYmzzb6o' },
          { id: '2016-song-13', title: 'aint got my life', youtubeId: 'r6QKa_isO7A' },
          { id: '2016-song-14', title: 'one more or one less', youtubeId: 'r8NaeogHcLw' },
          { id: '2016-song-15', title: 'bubblegum pop', youtubeId: 'bg3rTJeizlI' },
          { id: '2016-song-16', title: 'scraggy in space man', youtubeId: 'sEhcZ3OVBTA' },
          { id: '2016-song-17', title: 'looking at you', youtubeId: 'ArQKq-n30Sk' },
          { id: '2016-song-18', title: 'in the clearing green', youtubeId: '07xDyXZDIrA' },
          { id: '2016-song-19', title: 'they dont waonder who you are', youtubeId: 'kS-j_QEC1-0' },
          { id: '2016-song-20', title: 'paint me blackk', youtubeId: 'pQNnUZcrlvA' },
          { id: '2016-song-21', title: 'leaving', youtubeId: 'Gn9dLdvGbo0' },
          { id: '2016-song-22', title: 'dont you know', youtubeId: 'Gn9dLdvGbo0' },
        ]
      },
      {
        id: '2016-album-3',
        title: "Bath Ale Pints EP",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-23', title: '2043 32ct', youtubeId: 'Y-3sG1MBoyI' },
          { id: '2016-song-24', title: 'Fat Bug Master', youtubeId: 'baedoiebtY0' },
          { id: '2016-song-25', title: 'In the clearing green Down', youtubeId: '7cHJB77pHUM' },
          { id: '2016-song-26', title: 'noisette 40ct', youtubeId: '_ChcQPdMVk0' },
          { id: '2016-song-27', title: 'orange crabtree 32ct', youtubeId: 'Wyvx2lqz0p0' },
        ]
      },
      {
        id: '2016-album-4',
        title: "Dreary",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-28', title: 'Beautiful Girls', youtubeId: '_LJF8YNGp5c' },
          { id: '2016-song-29', title: 'Slinky (432)(-1)', youtubeId: 'Dh_RX8nEcAM' },
          { id: '2016-song-30', title: 'Dreary (432)(-1)', youtubeId: 'ZE_poXCo8N8' },
          { id: '2016-song-31', title: 'Clover Forest (-1) (432)', youtubeId: '-ZRIDpxH2aU' },
          { id: '2016-song-32', title: 'Camerons Lounge', youtubeId: '_PHrkct67-Q' },
          { id: '2016-song-33', title: 'Surfing On Long Day', youtubeId: '-uw3ZtuyAmY' },
        ]
      },
      {
        id: '2016-album-5',
        title: "Modern dust",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-34', title: 'Track 1', youtubeId: 'my2QtUwOXVU' },
          { id: '2016-song-35', title: 'Track 2', youtubeId: 'Rohwq4pdxJ8' },
          { id: '2016-song-36', title: 'Track 3', youtubeId: 'hvLJvyKQ5n8' },
          { id: '2016-song-37', title: 'Track 4', youtubeId: 'ZJv23BI75CU' },
          { id: '2016-song-38', title: 'Track 5', youtubeId: '8Ld4kzXt46o' },
          { id: '2016-song-39', title: 'Track 6', youtubeId: '1_ajHMPW-dw' },
          { id: '2016-song-40', title: 'Track 7', youtubeId: '1rh_jp08rlU' },
          { id: '2016-song-41', title: 'Track 8', youtubeId: 'bcQ4qD81VuM' },
          { id: '2016-song-42', title: 'Track 9', youtubeId: 'WtL0csJo2kQ' },
          { id: '2016-song-43', title: 'Track 10', youtubeId: 'sCXqbeqcEwk' },
        ]
      },
      {
        id: '2016-album-6',
        title: "Misses Vol 2",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-44', title: 'Track 1', youtubeId: 'NwS5hHGaKZc' },
          { id: '2016-song-45', title: 'Track 2', youtubeId: 'keBWvmw1S7k' },
          { id: '2016-song-46', title: 'Track 3', youtubeId: 'W3alvq7BM7Y' },
          { id: '2016-song-47', title: 'Track 4', youtubeId: 'eLy-biOqQ_g' },
          { id: '2016-song-48', title: 'Track 5', youtubeId: 'BQQ4Fmlad9A' },
          { id: '2016-song-49', title: 'Track 6', youtubeId: 'vkW1fXt1OvM' },
          { id: '2016-song-50', title: 'Track 7', youtubeId: '3TnshSjvU_U' },
          { id: '2016-song-51', title: 'Track 8', youtubeId: 'jDICGl_WvJM' },
          { id: '2016-song-52', title: 'Track 9', youtubeId: 'esQCSSyFqws' },
          { id: '2016-song-53', title: 'Track 10', youtubeId: 'q099I8nQOtE' },
        ]
      },
      {
        id: '2016-album-7',
        title: "Misses Vol 1",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-54', title: 'Track 1', youtubeId: 'ElcWUNKwXrQ' },
          { id: '2016-song-55', title: 'Track 2', youtubeId: 'oGch9fepTHo' },
          { id: '2016-song-56', title: 'Track 3', youtubeId: '-BPgdoQ5eXs' },
          { id: '2016-song-57', title: 'Track 4', youtubeId: 'whawFqfk_XY' },
          { id: '2016-song-58', title: 'Track 5', youtubeId: 'iG17ItaTKD8' },
          { id: '2016-song-59', title: 'Track 6', youtubeId: 'hhBZxHx1zyY' },
          { id: '2016-song-60', title: 'Track 7', youtubeId: 'kozQLlq-Vs4' },
          { id: '2016-song-61', title: 'Track 8', youtubeId: 'Y4zlzv9KY2A' },
          { id: '2016-song-62', title: 'Track 9', youtubeId: 'H9eY-Creu6I' },
        ]
      },
      {
        id: '2016-album-8',
        title: "random mp3s",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-63', title: 'prelapse', youtubeId: '67dA-npex7s' },
          { id: '2016-song-64', title: 'pordmond bay master version 1', youtubeId: 'E7EupQZUAyE' },
          { id: '2016-song-65', title: 'originak band stuff', youtubeId: 'l29toYNhcrY' },
          { id: '2016-song-66', title: 'not fexy', youtubeId: 'i1l_-IRIVhg' },
          { id: '2016-song-67', title: 'monkeys on the hill band mix', youtubeId: 'sh-C6aA9XhQ' },
          { id: '2016-song-68', title: 'Monkey Jungle Truth', youtubeId: 'CrlEfl8KZiQ' },
          { id: '2016-song-69', title: 'long days', youtubeId: '7-Eu_VXq44U' },
          { id: '2016-song-70', title: 'long days prope', youtubeId: '_ynNJEHeWIE' },
          { id: '2016-song-71', title: 'long days emps', youtubeId: 'apOjCWGJ4Xo' },
          { id: '2016-song-72', title: 'just say the words example', youtubeId: 'w1tv2-pbk_4' },
          { id: '2016-song-73', title: 'ivyh7j', youtubeId: '46qYgs4KEmM' },
          { id: '2016-song-74', title: 'Hypogognac Friend', youtubeId: 'TC0bNoiQ41Y' },
          { id: '2016-song-75', title: 'Hunters Bar', youtubeId: '8E90qWCqZtw' },
          { id: '2016-song-76', title: 'hard fund', youtubeId: 'c11VmKEk5C0' },
          { id: '2016-song-77', title: 'Had Product Proper', youtubeId: 'v5PzhLGoB-Q' },
          { id: '2016-song-78', title: 'prelapse', youtubeId: 'melKeGLydx4' },
          { id: '2016-song-79', title: 'propaganda', youtubeId: 'PemcQV0K3J0' },
          { id: '2016-song-80', title: 'resserected', youtubeId: 'Yn6-SeucXI0' },
          { id: '2016-song-81', title: 'Rost Major', youtubeId: 'tS5Exe3-Aok' },
          { id: '2016-song-82', title: 'signature', youtubeId: '2qXHjvsr7KY' },
          { id: '2016-song-83', title: 'spiral eyes demo', youtubeId: 'eaKgm4WHkhM' },
          { id: '2016-song-84', title: 'Surfing On Long Days', youtubeId: 'gBOQ6lHt-KI' },
          { id: '2016-song-85', title: 'tarz remix', youtubeId: 'ho5XycVus0g' },
          { id: '2016-song-86', title: 'trapped inside this body of mine', youtubeId: 'waGfJSROLEw' },
          { id: '2016-song-87', title: 'you can see', youtubeId: 'wCVrDCoVIWw' },
          { id: '2016-song-88', title: 'zalman herb', youtubeId: 'I49av0Yz7cA' },
          { id: '2016-song-89', title: 'comedown', youtubeId: 'j59qI1D8cm8' },
          { id: '2016-song-90', title: 'cr8ola', youtubeId: 'h73WyCr-XDA' },
        ]
      },
      {
        id: '2016-album-9',
        title: "Demos",
        artist: "Rewenge",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-91', title: 'Lost in the forest', youtubeId: 'qgc4BG_NK4Q' },
          { id: '2016-song-92', title: 'Falsehood', youtubeId: 'Ay1E07rc3oE' },
        ]
      }
    ]
  },

  // ============================================
  // 2017
  // ============================================
  {
    year: 2017,
    description: "Evolution",
    albums: [
      {
        id: '2017-album-1',
        title: "New Horizons",
        coverUrl: "", // Optional: URL to album cover image
        songs: [
          { id: '2017-song-1', title: 'New Horizons', youtubeId: 'dQw4w9WgXcQ' },
        ]
      }
    ]
  },

  // ============================================
  // 2018
  // ============================================
  {
    year: 2018,
    description: "Breaking Through",
    albums: [
      {
        id: '2018-album-1',
        title: "Top of the World",
        coverUrl: "", // Optional: URL to album cover image
        songs: [
          { id: '2018-song-1', title: 'Top of the World', youtubeId: 'dQw4w9WgXcQ' },
        ]
      }
    ]
  },

  // ============================================
  // 2019 - No releases (example of empty year)
  // ============================================
  {
    year: 2019,
    description: "New Heights",
    albums: []
  },

  // ============================================
  // 2020
  // ============================================
  {
    year: 2020,
    description: "The Lockdown Sessions",
    albums: []
  },

  // ============================================
  // 2021
  // ============================================
  {
    year: 2021,
    description: "Resurgence",
    albums: []
  },

  // ============================================
  // 2022
  // ============================================
  {
    year: 2022,
    description: "Exploration",
    albums: []
  },

  // ============================================
  // 2023
  // ============================================
  {
    year: 2023,
    description: "Refinement",
    albums: []
  },

  // ============================================
  // 2024
  // ============================================
  {
    year: 2024,
    description: "Current Era",
    albums: []
  },

  // ============================================
  // 2025
  // ============================================
  {
    year: 2025,
    description: "Future Sounds",
    albums: []
  }
];

/**
 * QUICK REFERENCE - COPY THIS TEMPLATE FOR NEW ENTRIES:
 * 
 * {
 *   year: 2026,
 *   description: "Your description here",
 *   albums: [
 *     {
 *       id: '2026-album-1',
 *       title: "Album Name",
 *       coverUrl: "", // Optional
 *       songs: [
 *         { id: '2026-song-1', title: 'Song Title', youtubeId: 'VIDEO_ID' },
 *         { id: '2026-song-2', title: 'Another Song', youtubeId: 'VIDEO_ID' },
 *       ]
 *     }
 *   ]
 * }
 */
