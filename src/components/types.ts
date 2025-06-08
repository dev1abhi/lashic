// src/types.ts

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  poster: string;
  audioUrl?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// Saavn API types
export interface SaavnImage {
  quality: string;
  url: string;
}

export interface SaavnDownloadUrl {
  quality: string;
  url: string;
}

export interface SaavnArtist {
  id: string;
  name: string;
  role: string;
  type: string;
  image: SaavnImage[];
  url: string;
}

export interface SaavnAlbum {
  id: string | null;
  name: string | null;
  url: string | null;
}

export interface SaavnSong {
  id: string;
  name: string;
  type: string;
  year: number | null;
  releaseDate: string | null;
  duration: number | null;
  label: string | null;
  explicitContent: boolean;
  playCount: number | null;
  language: string;
  hasLyrics: boolean;
  lyricsId: string | null;
  url: string;
  copyright: string | null;
  album: SaavnAlbum;
  artists: {
    primary: SaavnArtist[];
    featured: SaavnArtist[];
    all: SaavnArtist[];
  };
  image: SaavnImage[];
  downloadUrl: SaavnDownloadUrl[];
}

export interface SaavnSearchResponse {
  success: boolean;
  data: {
    total: number;
    start: number;
    results: SaavnSong[];
  };
}