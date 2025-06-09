// src/utils/playlist.ts

import { Song } from '../components/types';

const STORAGE_KEY = 'likedSongs';

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
  const songs = getLikedSongs().filter((s) => s.id !== songId);
  saveLikedSongs(songs);
}
