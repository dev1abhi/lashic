// src/utils/playlist.ts

import { Song } from '../components/types';

const STORAGE_KEY = 'likedSongs';


const defaultSong: Song = {
  id: 'default-1',
  title: 'Default Song',
  artist: 'Unknown Artist',
  album: 'Unknown Album',
  duration: '3:30',
  poster: 'https://via.placeholder.com/150',
  audioUrl: '', // optional: a real working audio URL
  colors: {
    primary: '#000000',
    secondary: '#444444',
    accent: '#ffffff',
  },
};

export function getLikedSongs(): Song[] {
  const data = localStorage.getItem(STORAGE_KEY);
  try {
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLikedSongs(songs: Song[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export function isSongLiked(song: Song): boolean {
  return getLikedSongs().some((s) => s.id === song.id);
}

export function addLikedSong(song: Song) {
  const songs = getLikedSongs();
  if (!songs.find((s) => s.id === song.id)) {
    songs.push(song);
    saveLikedSongs(songs);
  }
}

export function removeLikedSong(songId: string) {
   const filtered = getLikedSongs().filter((s) => s.id !== songId);
  // Ensure there's at least one song left
  if (filtered.length === 0) {
    saveLikedSongs([defaultSong]);
  } else {
    saveLikedSongs(filtered);
  }
}
