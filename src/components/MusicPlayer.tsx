import React, { useEffect, useState } from 'react';
import { Song } from './types';
import { SongInfo } from './SongInfo';
import { Controls } from './Controls';
import { Vinyl } from './Vinyl';
import { PlaylistSidebar } from './PlaylistsSidebar';
import { LyricsSidebar } from './LyricsSidebar';
import { SearchModal } from './SearchModal';
import { AudioPlayer } from './AudioPlayer';
import { Slider } from './ui/slider';
import { toast } from '@/components/ui/sonner';

const sampleSongs: Song[] = [
  {
    id: "1",
    title: "Midnight Dreams", 
    artist: "Luna Eclipse",
    album: "Stellar Nights",
    duration: "3:42",
    poster: "https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=400&fit=crop",
    colors: { primary: "#1a1a2e", secondary: "#16213e", accent: "#533483" }
  },
  {
    id: "2",
    title: "Golden Hour",
    artist: "Solar Flare",
    album: "Sunrise Sessions",
    duration: "4:15",
    poster: "https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=400&fit=crop",
    colors: { primary: "#2c1810", secondary: "#3d2817", accent: "#8b4513" }
  },
  {
    id: "3",
    title: "Ocean Waves",
    artist: "Aqua Harmony",
    album: "Deep Blue",
    duration: "5:23",
    poster: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=400&fit=crop",
    colors: { primary: "#0f2027", secondary: "#203a43", accent: "#2c5364" }
  }
];

// Color extraction utility
const extractColorsFromImage = (imageUrl: string): Promise<{ primary: string; secondary: string; accent: string }> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      try {
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) throw new Error('Could not get image data');

        const pixels = imageData.data;
        const colorMap: { [key: string]: number } = {};

        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const alpha = pixels[i + 3];

          if (alpha > 128) {
            const key = `${Math.floor(r / 32) * 32},${Math.floor(g / 32) * 32},${Math.floor(b / 32) * 32}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
          }
        }

        const sortedColors = Object.entries(colorMap)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([color]) => color.split(',').map(Number));

        if (sortedColors.length >= 3) {
          const [r1, g1, b1] = sortedColors[0];
          const [r2, g2, b2] = sortedColors[1];
          const [r3, g3, b3] = sortedColors[2];

          const primary = `rgb(${Math.floor(r1 * 0.2)}, ${Math.floor(g1 * 0.2)}, ${Math.floor(b1 * 0.2)})`;
          const secondary = `rgb(${Math.floor(r2 * 0.3)}, ${Math.floor(g2 * 0.3)}, ${Math.floor(b2 * 0.3)})`;
          const accent = `rgb(${Math.floor(r3 * 0.4)}, ${Math.floor(g3 * 0.4)}, ${Math.floor(b3 * 0.4)})`;

          resolve({ primary, secondary, accent });
        } else {
          resolve({ primary: "#1a1a1a", secondary: "#2a2a2a", accent: "#3a3a3a" });
        }
      } catch {
        resolve({ primary: "#1a1a1a", secondary: "#2a2a2a", accent: "#3a3a3a" });
      }
    };

    img.onerror = () => {
      resolve({ primary: "#1a1a1a", secondary: "#2a2a2a", accent: "#3a3a3a" });
    };

    img.src = imageUrl;
  });
};

// BackgroundFlow component: Animated colored blobs background
const BackgroundFlow: React.FC<{ colors: { primary: string; secondary: string; accent: string }; isPlaying: boolean }> = ({ colors, isPlaying }) => {
  return (
    <div
      aria-hidden="true"
      className="background-flow"
      style={{
        '--color1': colors.primary,
        '--color2': colors.secondary,
        '--color3': colors.accent,
        animationPlayState: isPlaying ? 'running' : 'paused',
      } as React.CSSProperties}
    />
  );
};

export const MusicPlayer = () => {
  const [currentSong, setCurrentSong] = useState(sampleSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [extractedColors, setExtractedColors] = useState(currentSong.colors);
  const [playlist, setPlaylist] = useState<Song[]>(sampleSongs);

  useEffect(() => {
    extractColorsFromImage(currentSong.poster).then((colors) => {
      setExtractedColors(colors);
      document.documentElement.style.setProperty('--theme-primary', colors.primary);
      document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
      document.documentElement.style.setProperty('--theme-accent', colors.accent);
    });
  }, [currentSong]);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const nextSong = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
  };

  const prevSong = () => {
    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentSong(playlist[prevIndex]);
  };

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    // Add to playlist if not already there
    if (!playlist.find(s => s.id === song.id)) {
      setPlaylist(prev => [...prev, song]);
    }

    toast.success(`Now playing: ${song.title} by ${song.artist}`);
  };

  const handleTimeUpdate = (current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
  };

  const handleSeek = (value: number) => {
    // This would need to be implemented in the AudioPlayer component
    // For now, we'll just update the visual progress
    setCurrentTime((value / 100) * duration);
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioError = (error: string) => {
    toast.error(`Audio Error: ${error}`);
    setIsPlaying(false);
  };

  const handleAudioEnded = () => {
    nextSong();
  };

  return (
    <>
      {/* Audio Player Component */}
      <AudioPlayer
        audioUrl={currentSong.audioUrl}
        isPlaying={isPlaying}
        volume={volume}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
        onError={handleAudioError}
      />

      {/* Animated flowing colored background */}
      <BackgroundFlow colors={extractedColors} isPlaying={isPlaying} />

      {/* Glass pane blur overlay */}
      <div className="glass-pane" aria-hidden="true" />

      {/* Main player UI */}
      <div style={{ position: 'relative', zIndex: 2 }}>  
      
      {/* Vinyl + All Details  */}
      <div className="h-screen overflow-hidden p-4 md:p-8 relative z-10">

        
    <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
     <div className="flex flex-col md:flex-row items-center justify-center space-y-10 md:space-y-0 md:space-x-16 flex-1">

   

    {/* Details stack below on mobile, right on desktop */}
    <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-10 w-full max-w-xl mx-auto">
      {/* Volume + Info + Controls */}
      <div className="flex md:flex-row items-center md:items-start space-y-6 md:space-y-10 w-full max-w-full px-2">

        {/* Volume Slider (visible only on md and above or reposition for mobile) */}
        <div className="hidden sm:flex w-full px-3 mt-4">
          <div className="h-[300px] w-9 rounded-full bg-black/10 flex items-center justify-center p-2 mt-10">
            <Slider
              orientation="vertical"
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(v) => setVolume(v[0])}
              className="h-full"
            />
          </div>
        </div>

        {/* Song Info and Controls */}
        <div className="flex flex-col space-y-6 w-full">
          <SongInfo
            title={currentSong.title}
            artist={currentSong.artist}
            album={currentSong.album}
            onTogglePlaylist={() => setShowPlaylist((prev) => !prev)}
            onToggleLyrics={() => setShowLyrics((prev) => !prev)}
            onToggleSearch={() => setShowSearch((prev) => !prev)}
          />

          <Controls
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            duration={formatTime(duration)}
            onTimeChange={handleSeek}
            volume={volume}
            onVolumeChange={setVolume}
            onPrev={prevSong}
            onNext={nextSong}
            progress={(currentTime / duration) * 100 || 0}
          />
        </div>
      </div>
    </div>

 {/* Vinyl at top on mobile, left on desktop */}
    <div className="flex-shrink-0">
      <Vinyl poster={currentSong.poster} title={currentSong.title} isPlaying={isPlaying} />
    </div>


  </div>
</div>

</div>

        <PlaylistSidebar
          visible={showPlaylist}
          songs={playlist}
          currentSongId={currentSong.id}
          onClose={() => setShowPlaylist(false)}
          onSelectSong={handleSelectSong}
        />

        <LyricsSidebar
          visible={showLyrics}
          onClose={() => setShowLyrics(false)}
        />

        <SearchModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectSong={handleSelectSong}
        />

        {(showPlaylist || showLyrics) && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setShowPlaylist(false);
              setShowLyrics(false);
            }}
          />
        )}
      </div>
    </>
  );
};