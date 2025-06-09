import React, { useEffect, useRef, useState } from 'react';
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
import { extractColorsFromImage } from '../utils/colorUtils';


import {
  getLikedSongs,
  isSongLiked,
  addLikedSong,
  removeLikedSong,
} from '../utils/playlist';


const sampleSongs: Song[] = [
   {
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
},

];



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
  //const [playlist, setPlaylist] = useState<Song[]>(sampleSongs);
  const [progress, setProgress] = useState(0);

  const [playlist, setPlaylist] = useState<Song[]>(getLikedSongs());


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
    
    // automatically adds songs which are played to the playlist
    // Add to playlist if not already there
    // if (!playlist.find(s => s.id === song.id)) {
    //   setPlaylist(prev => [...prev, song]);
    // }

    toast.success(`Now playing: ${song.title} by ${song.artist}`);
  };

 //changes current time and duration when updated in AudioPlayer. this recieves values from AudioPlayer when a new song is played.
  const handleTimeUpdate = (current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
    setProgress((currentTime / total) * 100);
  };

//recieves value from Controls and sets progress and current time, when the user interacts with the progress bar
  const onTimeChange = (value: number) => {
  setProgress(value);
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

  //when song ends
  const handleAudioEnded = () => {
    nextSong();
  };

// Function to check if a song is liked
  const handleLikeToggle = () => {
  if (!currentSong) return;
  const liked = isSongLiked(currentSong);
  if (liked) {
    removeLikedSong(currentSong.id);
    setPlaylist((prev) => prev.filter((s) => s.id !== currentSong.id));
  } else {
    addLikedSong(currentSong);
    setPlaylist((prev) => [...prev, currentSong]);
  }
};

  return (
    <>
      {/* Audio Player Component */}
      <AudioPlayer
        audioUrl={currentSong.audioUrl}
        isPlaying={isPlaying}
        volume={volume}
        currentTime={currentTime}
        //sets current time and duration
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
      {/* <div className="h-screen overflow-hidden p-4 md:p-8 relative z-10"> */}
      <div className="overflow-hidden p-4 md:p-8 relative z-10" style={{ height: '100dvh' }}>

        
    <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">

      {/* md re different margin --> y-0 */}
     <div className="flex flex-col md:flex-row items-center justify-center space-y-0 md:space-y-0 md:space-x-16 flex-1">


   <div className="flex-shrink-0 md:hidden">
      <Vinyl poster={currentSong.poster} title={currentSong.title} isPlaying={isPlaying} />
    </div>
   

    {/* Details stack below on mobile, right on desktop */}
    <div className="flex flex-col md:flex-row  md:space-y-0 md:space-x-10 w-full max-w-xl mx-auto">

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
            onToggleLike ={handleLikeToggle}
            isLiked={playlist.some(s => s.id === currentSong.id)}
          />

          <Controls
            isPlaying={isPlaying}
            onPlayToggle={() => setIsPlaying(!isPlaying)}
            currentTime={currentTime}
            duration={formatTime(duration)}
            onTimeChange={onTimeChange} // This will update the progress bar
            volume={volume}
            onVolumeChange={setVolume}
            onPrev={prevSong}
            onNext={nextSong}
            progress={progress || 0}
          />
        </div>
      </div>
    </div>

 {/* Vinyl at top on mobile, left on desktop */}
    <div className="flex-shrink-0 hidden md:block">
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
          onDeleteSong={(id) => {
            removeLikedSong(id);
            setPlaylist((prev) => prev.filter((s) => s.id !== id));
              }}
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