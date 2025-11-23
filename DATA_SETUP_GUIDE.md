# MuseMap Website - Multi-Artist Setup Guide

This website displays an interactive discography map for music artists. You can easily create separate sites for different artists by swapping the data file.

## Quick Start for New Artists

### Option 1: Edit the Existing File (Easiest)

1. Open `src/data/discography.ts`
2. Update the `artistConfig` at the top:
   ```typescript
   export const artistConfig = {
     name: "Your Artist Name",
     startYear: 2015,
     endYear: 2025,
   };
   ```
3. Replace the `discography` array with your artist's data (see structure below)

### Option 2: Create Separate Files for Each Artist

1. Copy `src/data/discography.template.ts` to a new file:
   - Example: `src/data/artist1-discography.ts`
   - Example: `src/data/artist2-discography.ts`

2. Update the new file with your artist's data

3. In `src/App.tsx`, change the import:
   ```typescript
   // Change from:
   import { discography } from './data/discography';
   
   // To:
   import { discography } from './data/artist1-discography';
   ```

## Data Structure

### Artist Configuration
```typescript
export const artistConfig = {
  name: "Artist Name",        // Displayed in center of map
  startYear: 2015,            // First year on map
  endYear: 2025,             // Last year on map
};
```

### Year Structure
```typescript
{
  year: 2020,
  description: "Year description (e.g., 'Breakthrough Year')",
  albums: [
    // Album objects go here
  ]
}
```

### Album Structure
```typescript
{
  id: '2020-album-1',              // Unique ID (use year-album-number format)
  title: "Album Name",
  coverUrl: "",                    // Optional: URL to album cover image
  songs: [
    // Song objects go here
  ]
}
```

### Song Structure
```typescript
{
  id: '2020-song-1',               // Unique ID (use year-song-number format)
  title: 'Song Title',
  youtubeId: 'dQw4w9WgXcQ'        // YouTube video ID (part after v= in URL)
}
```

## Complete Example

```typescript
{
  year: 2020,
  description: "The Lockdown Sessions",
  albums: [
    {
      id: '2020-album-1',
      title: "Quarantine Beats",
      coverUrl: "https://example.com/cover.jpg", // Optional
      songs: [
        { 
          id: '2020-song-1', 
          title: 'Isolation', 
          youtubeId: 'dQw4w9WgXcQ' 
        },
        { 
          id: '2020-song-2', 
          title: 'Home Studio', 
          youtubeId: 'ANOTHER_VIDEO_ID' 
        },
      ]
    },
    {
      id: '2020-album-2',
      title: "B-Sides Collection",
      songs: [
        { id: '2020-song-3', title: 'Unreleased Track', youtubeId: 'VIDEO_ID' },
      ]
    }
  ]
}
```

## Getting YouTube Video IDs

1. Go to your YouTube video
2. Copy the URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Extract the part after `v=` → `dQw4w9WgXcQ`
4. Paste that into the `youtubeId` field

## Tips

- **Empty Years**: Leave `albums: []` for years with no releases. The year will still appear on the map.
- **Multiple Albums**: Add multiple album objects to the `albums` array for years with multiple releases.
- **ID Naming**: Use descriptive IDs like `2020-album-1`, `2020-song-1` for easy tracking.
- **Album Art**: The `coverUrl` field is optional. Leave it as empty string `""` if you don't have artwork.

## File Organization for Multiple Artists

If creating sites for multiple artists, consider this structure:

```
src/
  data/
    discography.ts              # Default/current artist
    artist1-discography.ts      # Artist 1 data
    artist2-discography.ts      # Artist 2 data
    discography.template.ts     # Template for new artists
```

Then switch imports in `src/App.tsx` when building for different artists.

