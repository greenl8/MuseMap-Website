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
      },
      {
        id: '2016-album-10',
        title: "Abstract Selection Vol 1",
        artist: "Purple Calx",
        coverUrl: "", // Cover art - add if available
        songs: [
          { id: '2016-song-93', title: '4th gen #', youtubeId: 'B1iUowtokQ4' },
          { id: '2016-song-94', title: '5th density', youtubeId: 'owpVQXKdc1A' },
          { id: '2016-song-95', title: 'feedbaccy', youtubeId: 'Umd49OWar-8' },
          { id: '2016-song-96', title: 'first on wheels', youtubeId: 'u9bUbHCW8Fk' },
          { id: '2016-song-97', title: 'head radio', youtubeId: 'RnKdHzk9KWc' },
          { id: '2016-song-98', title: 'green mint tins pitch shifted', youtubeId: 'AGmSlM_h4pE' },
          { id: '2016-song-99', title: 'like me alone bedrrom ensemble', youtubeId: 'qkD7Bga7MM0' },
          { id: '2016-song-100', title: 'new moon new skool', youtubeId: '_aTR0Sa-e1c' },
          { id: '2016-song-101', title: 'sanskit', youtubeId: 'cYHmxnh7ltM' },
          { id: '2016-song-102', title: 'solfeggio', youtubeId: 'nl8-SzRA3vA' },
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
        title: "Development",
        artist: "Human",
        coverUrl: "",
        songs: [
          { id: '2017-dev-1', title: 'Superego2', youtubeId: 'lkWSiSvmcRI' },
          { id: '2017-dev-2', title: 'rackwidth medicene', youtubeId: 'sW5IaG_M5As' },
          { id: '2017-dev-3', title: 'Pocket Jazz', youtubeId: '8TCZW22OSpU' },
          { id: '2017-dev-4', title: 'ego master', youtubeId: 'KitFtmj5q24' },
          { id: '2017-dev-5', title: '1320 regression# master', youtubeId: 'iBaCOhhJ2qI' },
          { id: '2017-dev-6', title: '46y nrgn Re master', youtubeId: 'nYVCBA7oZWU' },
          { id: '2017-dev-7', title: '46y nrgn Drop Mix', youtubeId: 'q6XKWXYVQWQ' },
          { id: '2017-dev-8', title: 'teth', youtubeId: 'X8ymddt8RqI' },
          { id: '2017-dev-9', title: 'tehtered', youtubeId: 'xd43_KEtCk0' },
        ]
      },
      {
        id: '2017-album-2',
        title: "Me and My Sanity",
        artist: "Human",
        coverUrl: "",
        songs: [
          { id: '2017-sanity-1', title: 'My Word Master', youtubeId: 'M67TQZjaag0' },
          { id: '2017-sanity-2', title: 'ruin#eg', youtubeId: 'w7wWYO6W5E8' },
          { id: '2017-sanity-3', title: 'VENUA AND MARR master', youtubeId: 'IufTrvJe5o8' },
          { id: '2017-sanity-4', title: 'dipping sTrun spikes', youtubeId: 'v1qhamHRUWY' },
          { id: '2017-sanity-5', title: 'Rushing omar Master', youtubeId: 'ftIsM7rqeos' },
          { id: '2017-sanity-6', title: 'dipping pipes 63', youtubeId: 'CoshFrP3D4I' },
          { id: '2017-sanity-7', title: 'Sipping SpikesMaster', youtubeId: 'yIFrk0nMpL4' },
          { id: '2017-sanity-8', title: 'taken from my soul', youtubeId: 'xQcMdZMMcls' },
          { id: '2017-sanity-9', title: 'Elsethia', youtubeId: 'mvQb7Vf_6GU' },
          { id: '2017-sanity-10', title: 'crystal teardrop', youtubeId: 'lxznnyY1JfA' },
          { id: '2017-sanity-11', title: 'me and the guy', youtubeId: 'AQQAu5mW080' },
          { id: '2017-sanity-12', title: 'Childlike mind', youtubeId: 'Un1ojWY9atc' },
          { id: '2017-sanity-13', title: '愛', youtubeId: 'v1DeLyczaOs' },
        ]
      },
      {
        id: '2017-album-3',
        title: "Originals",
        artist: "Human",
        coverUrl: "",
        songs: [
          { id: '2017-orig-1', title: 'Dear Me master', youtubeId: 's4hhHZvQli4' },
          { id: '2017-orig-2', title: 'My Word Master', youtubeId: 'pSy4AEiq9VA' },
          { id: '2017-orig-3', title: 'pheanl cubix rl master', youtubeId: 'Au9G6R0L-qU' },
          { id: '2017-orig-4', title: 'Phase1 building master', youtubeId: 'y7pQjgqpP6c' },
          { id: '2017-orig-5', title: 'Patent Morse master', youtubeId: 'WKevMZT_PNQ' },
          { id: '2017-orig-6', title: 'Rushing omar Master', youtubeId: 'oVHb3mT8g6g' },
          { id: '2017-orig-7', title: 'Sipping SpikesMaster', youtubeId: 'ogBBlmqtimE' },
          { id: '2017-orig-8', title: 'Song of the dead master', youtubeId: '7XAdEo43Ank' },
          { id: '2017-orig-9', title: 'Transhuman master', youtubeId: 'M4AUkZdEUmU' },
          { id: '2017-orig-10', title: 'Transhuman2 master', youtubeId: 'upzAk652SNQ' },
          { id: '2017-orig-11', title: 'VENUA AND MARR master', youtubeId: 'e_sDP-biFdc' },
          { id: '2017-orig-12', title: 'Velocive RE master', youtubeId: 'I4rJiR4wEdI' },
        ]
      },
      {
        id: '2017-album-4',
        title: "Second Gen",
        artist: "Human",
        coverUrl: "",
        songs: [
          { id: '2017-sec-1', title: 'Donald Marshall', youtubeId: 'm-c6XcTBUQ4' },
          { id: '2017-sec-2', title: 'Heaven Forgiven', youtubeId: 'oxzZ3tzTM9U' },
          { id: '2017-sec-3', title: 'Jarred', youtubeId: 'XoRfA-ipNwM' },
          { id: '2017-sec-4', title: 'Low Vibrational Friend mastered', youtubeId: 'MzRei_fFPYo' },
          { id: '2017-sec-5', title: 'Routine Mastered', youtubeId: 'RYrjFhR4gTw' },
          { id: '2017-sec-6', title: 'Thought Motion', youtubeId: 'r8eoVTYxNtg' },
          { id: '2017-sec-7', title: 'Terms#', youtubeId: 'W0COT0M0TvI' },
          { id: '2017-sec-8', title: 'TownScales mastered', youtubeId: 'PLopi2DI02E' },
        ]
      },
      {
        id: '2017-album-5',
        title: "Demos",
        artist: "Purple Calx",
        coverUrl: "",
        songs: [
          { id: '2017-demos-1', title: 'setters pt4', youtubeId: 'Njh1KVGFE4E' },
          { id: '2017-demos-2', title: 'jaded line', youtubeId: 'r6PhsoCngj0' },
        ]
      },
      {
        id: '2017-album-6',
        title: "Et Seriene",
        artist: "Purple Calx",
        coverUrl: "",
        songs: [
          { id: '2017-et-1', title: 'Et Seriene', youtubeId: 'MARE64z6IQI' },
          { id: '2017-et-2', title: 'setters pt5', youtubeId: 'p6tcbrRV-lU' },
          { id: '2017-et-3', title: '1307 regulate', youtubeId: 'U17TP8un76Q' },
          { id: '2017-et-4', title: 'dn1', youtubeId: '0w41f44P3AU' },
          { id: '2017-et-5', title: 'FGZC', youtubeId: '4bjEqcqubpo' },
          { id: '2017-et-6', title: 'pr 8079', youtubeId: 'WOTwmicdnlY' },
          { id: '2017-et-7', title: 'jaded line', youtubeId: 'mSOZ2LacqHI' },
          { id: '2017-et-8', title: '46y nrgn', youtubeId: '6WK2OG4aJdY' },
          { id: '2017-et-9', title: 'pentagon wave', youtubeId: 'VgtiAa5xN64' },
          { id: '2017-et-10', title: 'yausi lounge arrragement', youtubeId: 'YT-bn4-NPnE' },
        ]
      },
      {
        id: '2017-album-7',
        title: "Rewenge 432 EP",
        artist: "Rewenge",
        coverUrl: "",
        songs: [
          { id: '2017-rew-1', title: 'Falsehood', youtubeId: 'iPyOi5ufzlk' },
          { id: '2017-rew-2', title: 'Spiral Eyes', youtubeId: 'pV5vrX98p4A' },
          { id: '2017-rew-3', title: 'Monkeys on The HIll', youtubeId: 'w2ElaY8ObFI' },
          { id: '2017-rew-4', title: 'Lost In The Forest', youtubeId: 'PxDP_gLjHQ8' },
          { id: '2017-rew-5', title: 'Rewenge 432', youtubeId: '9yoo8qQXPwQ' },
          { id: '2017-rew-6', title: 'Remove Your Feet', youtubeId: '_SDDs3CL-S0' },
          { id: '2017-rew-7', title: 'Lost In The weird music', youtubeId: 'CxalHQrsVUU' },
        ]
      },
      {
        id: '2017-album-8',
        title: "misc recording",
        coverUrl: "",
        songs: [
          { id: '2017-misc-1', title: '1996', youtubeId: 'uzAeW_gbY0k' },
          { id: '2017-misc-2', title: 'Hypogognac Friend 432', youtubeId: 'T947-t-NIVw' },
          { id: '2017-misc-3', title: 'Its just the truth', youtubeId: 'JA0rIOtnhco' },
          { id: '2017-misc-4', title: 'made a stand', youtubeId: 'vQ90EZa6CMw' },
          { id: '2017-misc-5', title: 'monkeys on the hill band mix', youtubeId: '4ZPgNhRI85s' },
          { id: '2017-misc-6', title: 'my ps3', youtubeId: 'bqFno1FQxH8' },
          { id: '2017-misc-7', title: 'Recently Wired sober mix', youtubeId: 'f25n_oN8qSk' },
          { id: '2017-misc-8', title: 'reanalyse the avenues 432', youtubeId: 'PmVW5U8EhuA' },
          { id: '2017-misc-9', title: 'rzorblade to your hed', youtubeId: 'NoeOZH0W1a4' },
          { id: '2017-misc-10', title: 'x3ug#', youtubeId: 'jzIVoDzSdwk' },
        ]
      },
      {
        id: '2017-album-9',
        title: "music for djing",
        coverUrl: "",
        songs: [
          { id: '2017-dj-1', title: '6 Lies 127bpm Electronica', youtubeId: 'y4p1y4OWfxY' },
          { id: '2017-dj-2', title: 'Brickwall 147bpm Electronica', youtubeId: 'SpqbSqJhRkw' },
          { id: '2017-dj-3', title: 'camerons lounge 112bpm Electornica', youtubeId: 'ILd-pa6D4Xw' },
          { id: '2017-dj-4', title: 'Choppy Feminine V2 115bpm Nu House', youtubeId: 'cAeUVh3_sAA' },
          { id: '2017-dj-5', title: 'Doggy Shuffle 111bpm Electronica', youtubeId: 'bEeKQQBo7ZI' },
          { id: '2017-dj-6', title: 'Iron Man 123bpm Prog House', youtubeId: 'BdhC2XrBv6w' },
          { id: '2017-dj-7', title: 'noisette 123bpm Electronica', youtubeId: '6Z3n2E8Ee6k' },
          { id: '2017-dj-8', title: 'My Satanic Universe 144bpm Electronica', youtubeId: 'RYOIHwjxSeQ' },
          { id: '2017-dj-9', title: 'Militia 117bpm Electronica', youtubeId: 'VIgVi-XWT1U' },
          { id: '2017-dj-10', title: 'me and the guy 108bpm Prog House', youtubeId: 'GkZta7uU8iI' },
          { id: '2017-dj-11', title: 'Pentagon Wave 138bpm Dubstep', youtubeId: 'zyz1gC-Hn1Q' },
          { id: '2017-dj-12', title: 'Roundbeck Turnwazble 108bpm Prog House', youtubeId: 'B67hYQbQRnc' },
          { id: '2017-dj-13', title: 'routines 141bpm Electronica', youtubeId: 'T4heSzYbU6Q' },
        ]
      }
    ]
  },

  // ============================================
  // 2018
  // ============================================
  {
    year: 2018,
    description: "Flow State",
    albums: [
      {
        id: '2018-album-1',
        title: "Blaze",
        artist: "Flow State",
        coverUrl: "",
        songs: [
          { id: '2018-blaze-1', title: 'beyond it', youtubeId: 'OBoB7FuGMJ8' },
          { id: '2018-blaze-2', title: 'fractal', youtubeId: 'xCjFes1ZAmA' },
          { id: '2018-blaze-3', title: 'lil j', youtubeId: 'OWlOm2-YXmk' },
          { id: '2018-blaze-4', title: 'superego id lyrical', youtubeId: 'A8dPinlX4i4' },
          { id: '2018-blaze-5', title: 'sweaty soulmates take 2', youtubeId: 'HfHfWijzftM' },
          { id: '2018-blaze-6', title: 'wandos 39', youtubeId: 'bE7XBWMFelc' },
          { id: '2018-blaze-7', title: 'what is her name gemini', youtubeId: '0cVGcmF8Evg' },
        ]
      },
      {
        id: '2018-album-2',
        title: "expo.long.tracks-cuts",
        artist: "Flow State",
        coverUrl: "/resources/true.purgatory.jpg",
        songs: [
          { id: '2018-expo-1', title: '84bpm', youtubeId: 'va6ai-oCb5U' },
          { id: '2018-expo-2', title: 'cohoons', youtubeId: 'TzPApFqM5HM' },
          { id: '2018-expo-3', title: 'disgussting psychotic mess me', youtubeId: 'eXVL_9k2SqI' },
          { id: '2018-expo-4', title: 'festivus', youtubeId: 'zELiBrPBwU8' },
          { id: '2018-expo-5', title: 'grapefruits', youtubeId: 'fsc30gwrqpU' },
          { id: '2018-expo-6', title: 'grapeshine', youtubeId: 'z4PwjgqZ38c' },
          { id: '2018-expo-7', title: 'pearsome', youtubeId: 'SlJ8werANKM' },
          { id: '2018-expo-8', title: 'pointed ears and long', youtubeId: 'JzXG5iIPM3o' },
          { id: '2018-expo-9', title: 'purpose', youtubeId: 'AVoC7AH9Bng' },
          { id: '2018-expo-10', title: 'snoberry in my family', youtubeId: 'qi-w0ieqZv0' },
          { id: '2018-expo-11', title: 'sweaty soulmates', youtubeId: 's6N2MefnL60' },
          { id: '2018-expo-12', title: 'The breaking of th human heart', youtubeId: 'BJvcGTMKgHo' },
        ]
      },
      {
        id: '2018-album-3',
        title: "More Open",
        artist: "Flow State",
        coverUrl: "/resources/more open.jpg",
        songs: [
          { id: '2018-moreopen-1', title: 'The source', youtubeId: 'QirKKYrC6oA' },
          { id: '2018-moreopen-2', title: '4ug', youtubeId: '0bLm_-EZI2o' },
          { id: '2018-moreopen-3', title: 'photographic', youtubeId: 'jc0VUG3QUrU' },
          { id: '2018-moreopen-4', title: 'Disheartened', youtubeId: 'rS82bvZs14Q' },
          { id: '2018-moreopen-5', title: 'Self ity', youtubeId: 'GOiCCuxldZo' },
          { id: '2018-moreopen-6', title: 'lets make our own r...', youtubeId: 'mTqu9tQLHHQ' },
          { id: '2018-moreopen-7', title: 'Sunday', youtubeId: 'f2V5_h7Rt5A' },
        ]
      },
      {
        id: '2018-album-4',
        title: "One",
        artist: "MHE",
        coverUrl: "",
        songs: [
          { id: '2018-mhe-1', title: 'my human is on a lead thats tidy master', youtubeId: '1RNPYJ7VO6o' },
          { id: '2018-mhe-2', title: 'oprg2 master', youtubeId: 'iKT_D09lXYo' },
          { id: '2018-mhe-3', title: 'Ring Finer Master', youtubeId: 'TK6VsydgeHs' },
          { id: '2018-mhe-4', title: 'Spark Objectivity master', youtubeId: '6mebkfO4NPA' },
          { id: '2018-mhe-5', title: 'Taking it lightly journey master', youtubeId: 'ByIFITDsRmo' },
        ]
      },
      {
        id: '2018-album-5',
        title: "Stockholm Downsyndrome",
        coverUrl: "",
        songs: [
          { id: '2018-stockholm-1', title: 'Stockholm Downsyndrome', youtubeId: '4-SYFOMwS9Y' },
        ]
      },
      {
        id: '2018-album-6',
        title: "misc tracks",
        artist: "truegod.space",
        coverUrl: "",
        songs: [
          { id: '2018-truegod-misc-1', title: 'il j demo', youtubeId: 'TutMfo5owmA' },
          { id: '2018-truegod-misc-2', title: 'computer music assessment 02 jude', youtubeId: 'Gpakcm7qkxg' },
          { id: '2018-truegod-misc-3', title: 'full moon you', youtubeId: 'aCkyqks4kZc' },
          { id: '2018-truegod-misc-4', title: 'fx trading', youtubeId: 'dAnf7IFO3WE' },
          { id: '2018-truegod-misc-5', title: 'Human superego idm', youtubeId: 'lTwhxAG2ZDQ' },
          { id: '2018-truegod-misc-6', title: 'numb month', youtubeId: 'q4yp8L6yazE' },
          { id: '2018-truegod-misc-7', title: 'Sages', youtubeId: 'n1U58DE3MjQ' },
          { id: '2018-truegod-misc-8', title: 'truegod space my pla', youtubeId: 'WJ15WQMv0vs' },
          { id: '2018-truegod-misc-9', title: 'T drop phase test', youtubeId: 't1TpQUf2t_0' },
          { id: '2018-truegod-misc-10', title: 'truegod space rico s always rong', youtubeId: '-HpYGxm-c7A' },
          { id: '2018-truegod-misc-11', title: 'truegod space she s not on my mind', youtubeId: 'aLPF35rcMN0' },
          { id: '2018-truegod-misc-12', title: 'truegod space shifts and sans scales', youtubeId: 'JXje_DX2z0M' },
        ]
      },
      {
        id: '2018-album-7',
        title: "Ceste Que Vie Act 1666",
        artist: "I",
        coverUrl: "",
        songs: [
          { id: '2018-ceste-1', title: 'I blood on my ive master', youtubeId: 'jY2Ga6ajtzg' },
          { id: '2018-ceste-2', title: 'I idea crazy master', youtubeId: 'KkrZtekvM_g' },
          { id: '2018-ceste-3', title: 'I its sweet master', youtubeId: 'DJqHwmNTC9w' },
          { id: '2018-ceste-4', title: 'I mini breaks master', youtubeId: 'aZsnB6-gA-0' },
          { id: '2018-ceste-5', title: 'I no pants master', youtubeId: 'pm8xTVboKa8' },
          { id: '2018-ceste-6', title: 'I numb month rode vox', youtubeId: 'jSzyw1xHZmo' },
          { id: '2018-ceste-7', title: 'I rico s always rong rode vox master', youtubeId: 'JNjxpD1xXio' },
          { id: '2018-ceste-8', title: 'I so un scared master', youtubeId: 'jQUTOUTemqQ' },
          { id: '2018-ceste-9', title: 'I so scared master', youtubeId: 'wLBswKERc3o' },
          { id: '2018-ceste-10', title: 'I subconscious genius master', youtubeId: 'cgRDhqXwnBQ' },
          { id: '2018-ceste-11', title: 'I truth awareness #master', youtubeId: 'aB5vyPBsKRA' },
        ]
      },
      {
        id: '2018-album-8',
        title: "bedroom music (peartree) EP",
        artist: "truegod.space",
        coverUrl: "/resources/bedroom music (peartree) EP.jpg",
        songs: [
          { id: '2018-peartree-1', title: 'truegod space bedroom music peartree', youtubeId: 'AMYc-0s6tOg' },
          { id: '2018-peartree-2', title: 'truegod space hostage V2', youtubeId: 'HnFikCbcAck' },
          { id: '2018-peartree-3', title: 'truegod space 1345', youtubeId: 'gYZe7J8gJj0' },
          { id: '2018-peartree-4', title: 'truegod space frazzled up', youtubeId: 'jTmQVgaepFY' },
          { id: '2018-peartree-5', title: 'truegod space mass etter', youtubeId: 'ECCXcIowMII' },
          { id: '2018-peartree-6', title: 'truegod space HS ly', youtubeId: 'Ui92cp8TDzo' },
          { id: '2018-peartree-7', title: 'truegod space sipping2', youtubeId: 'HTGpToL3VCo' },
        ]
      }
    ],
    media: {
      images: [
        { id: '2018-img-01', title: 'truegod.space-01', url: '/resources/truegod.space-01.jpg' },
        { id: '2018-img-02', title: 'truegod.space-02', url: '/resources/truegod.space-02.jpg' },
        { id: '2018-img-03', title: 'truegod.space-03', url: '/resources/truegod.space-03.jpg' },
        { id: '2018-img-04', title: 'truegod.space-04', url: '/resources/truegod.space-04.jpg' },
        { id: '2018-img-05', title: 'truegod.space-05', url: '/resources/truegod.space-05.jpg' },
        { id: '2018-img-06', title: 'truegod.space-06', url: '/resources/truegod.space-06.jpg' },
        { id: '2018-img-07', title: 'truegod.space-07', url: '/resources/truegod.space-07.jpg' },
        { id: '2018-img-08', title: 'truegod.space-08', url: '/resources/truegod.space-08.jpg' },
        { id: '2018-img-12', title: 'truegod.space-12', url: '/resources/truegod.space-12.jpg' },
        { id: '2018-img-13', title: 'truegod.space-13', url: '/resources/truegod.space-13.jpg' },
        { id: '2018-img-14', title: 'truegod.space-14', url: '/resources/truegod.space-14.jpg' },
        { id: '2018-img-15', title: 'truegod.space-15', url: '/resources/truegod.space-15.jpg' },
        { id: '2018-img-16', title: 'truegod.space-16', url: '/resources/truegod.space-16.jpg' },
        { id: '2018-img-16b', title: 'truegod.space-16-b', url: '/resources/truegod.space-16-b-lowres.jpg' },
      ],
      videos: [],
      writing: []
    }
  },

  // ============================================
  // 2019
  // ============================================
  {
    year: 2019,
    description: "New Heights",
    albums: [
      {
        id: '2019-album-1',
        title: "misc tracks",
        coverUrl: "",
        songs: [
          { id: '2019-misc-1', title: 'saturns computers', youtubeId: 'j4frSIiGFjM' },
          { id: '2019-misc-2', title: 'new gear', youtubeId: 'nLD0BSBbHko' },
          { id: '2019-misc-3', title: 'my potential', youtubeId: '6PqOixx6E1I' },
          { id: '2019-misc-4', title: 'mind space mercury speed master', youtubeId: 'zMrh07af9ts' },
          { id: '2019-misc-5', title: 'mind space il j master', youtubeId: 'pv9MnDi9At4' },
          { id: '2019-misc-6', title: 'jaybo', youtubeId: 'T8gjKm8ur8s' },
        ]
      }
    ]
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
