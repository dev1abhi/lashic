// src/utils/playlist.ts

import { Song } from '../components/types';

const STORAGE_KEY = 'likedSongs';

//set a default song
const defaultSong: Song = {
  id: "JkNTq6Kh",
  title: "I Wanna Be Yours (Violin)",
  artist: "Dramatic Violin",
  album: "I Wanna Be Yours (Violin)",
  duration: "2:01", // 121 seconds
  poster: "https://c.saavncdn.com/915/I-Wanna-Be-Yours-Violin-Unknown-2023-20250108075659-500x500.jpg",
  audioUrl: "https://aac.saavncdn.com/915/ac73938eb6ed3d2dffa1b88e7eacc34d_320.mp4",
  colors: {
    primary: "#1a1a1a",
    secondary: "#2d2d2d",
    accent: "#6a1b9a"
  }
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
  const songs = getLikedSongs().filter((s) => s.id !== songId);
  saveLikedSongs(songs);
}


