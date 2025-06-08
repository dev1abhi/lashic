// src/types.ts

export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  poster: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
