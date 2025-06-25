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
import { SaavnApiService } from '../services/saavnApi';


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
// const BackgroundFlow: React.FC<{ colors: { primary: string; secondary: string; accent: string }; isPlaying: boolean }> = ({ colors, isPlaying }) => {
//   return (
//     <div
//       aria-hidden="true"
//       className="background-flow"
//       style={{
//         '--color1': colors.primary,
//         '--color2': colors.secondary,
//         '--color3': colors.accent,
//         animationPlayState: isPlaying ? 'running' : 'paused',
//       } as React.CSSProperties}
//     />
//   );
// };

// const BackgroundFlow: React.FC<{ colors: string[]; isPlaying: boolean }> = ({
//   colors,
//   isPlaying,
// }) => {
//   return (
//     <div
//       className="background-flow"
//       aria-hidden="true"
//       style={
//         {
//           '--color-list': colors.join(','),
//           animationPlayState: isPlaying ? 'running' : 'paused',
//         } as React.CSSProperties
//       }
//     />
//   );
// };

const BackgroundFlow: React.FC<{ colors: { primary: string; secondary: string; accent: string }; isPlaying: boolean }> = ({
  colors,
  isPlaying,
}) => {
  return (
    <div className="background-flow" aria-hidden="true">
      <div
        className="blob blob1"
        style={{
          backgroundColor: colors.primary,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      />
      <div
        className="blob blob2"
        style={{
          backgroundColor: colors.secondary,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      />
      <div
        className="blob blob3"
        style={{
          backgroundColor: colors.accent,
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      />
    </div>
  );
};

export const MusicPlayer = () => {
 
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayQueue, setAutoplayQueue] = useState<Song[]>([]);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [autoplayHistory, setAutoplayHistory] = useState<Song[]>([]);

  //called the getLikedSongs function to get the liked songs from local storage
  const [playlist, setPlaylist] = useState<Song[]>(getLikedSongs());

  // const [extractedColors, setExtractedColors] = useState(
  //   sampleSongs[0].colors // fallback to sample song colors
  // );

// const [extractedColors, setExtractedColors] = useState<string[]>([
//   sampleSongs[0].colors.primary,
//   sampleSongs[0].colors.secondary,
//   sampleSongs[0].colors.accent,
// ]);


const [primaryColor, setPrimaryColor] = useState(sampleSongs[0].colors.primary);
const [secondaryColor, setSecondaryColor] = useState(sampleSongs[0].colors.secondary);
const [accentColor, setAccentColor] = useState(sampleSongs[0].colors.accent);


  const [progress, setProgress] = useState(0);
  const [currentSong, setCurrentSong] = useState(sampleSongs[0]);
  const defaultSong = sampleSongs[0];


//if currentSong is null/defaultSong and playlist has songs, set the first song as currentSong
// this is working becoz current song object not equal to default song object after first fetch
useEffect(() => {
  if (currentSong===defaultSong && playlist.length > 0) {
    setCurrentSong(playlist[0]);
  }
}, [playlist , currentSong, defaultSong]);




//extract colors from the current song's poster when it changes
//receiving colors from colorsUtils
//   useEffect(() => {
//   if (currentSong) {
//     extractColorsFromImage(currentSong.poster).then((colors) => {
//       setExtractedColors(colors);
//       document.documentElement.style.setProperty('--theme-primary', colors.primary);
//       document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
//       document.documentElement.style.setProperty('--theme-accent', colors.accent);
//     });
//   }
// }, [currentSong]);


// useEffect(() => {
//   if (currentSong) {
//     extractColorsFromImage(currentSong.poster).then((colors) => {
//       setExtractedColors(colors);
//       const root = document.documentElement;
//       colors.forEach((c, i) => {
//         root.style.setProperty(`--color${i + 1}`, c);
//       });
//     });
//   }
// }, [currentSong]);


useEffect(() => {
  if (currentSong) {
    extractColorsFromImage(currentSong.poster).then((colors) => {
      // Optional: use `setTimeout` to stagger if you want
      setPrimaryColor(colors[0]);
      setSecondaryColor(colors[1]);
      setAccentColor(colors[2]);
    });
  }
}, [currentSong]);



 const nextSong = async () => {
  if (!currentSong) return;

  // If autoplay is enabled, use autoplay navigation
  if (isAutoplay) {
    // Add current song to autoplay history
    setAutoplayHistory(prev => [...prev, currentSong]);
    
    // Check if we have songs in autoplay queue
    if (autoplayQueue.length > 0) {
      const nextSong = autoplayQueue[0];
      setCurrentSong(nextSong);
      setAutoplayQueue(prev => prev.slice(1));
      toast.info(`Next: ${nextSong.title} by ${nextSong.artist}`);
      return;
    }

    // If no autoplay queue, fetch recommendations
    setIsLoadingNext(true);
    try {
      const recommendations = await fetchAutoplayRecommendations(currentSong);
      if (recommendations.length > 0) {
        const nextSong = recommendations[0];
        setCurrentSong(nextSong);
        setAutoplayQueue(recommendations.slice(1));
        toast.info(`Next: ${nextSong.title} by ${nextSong.artist}`);
      } else {
        toast.info('No more recommendations available');
      }
    } catch (error) {
      console.error('Error fetching next song:', error);
      toast.error('Failed to load next song');
    } finally {
      setIsLoadingNext(false);
    }
  } else {
    // Default behavior: navigate through liked songs playlist
    if (!playlist.length) {
      toast.info('No songs in playlist');
      return;
    }

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    setCurrentSong(playlist[nextIndex]);
    toast.info(`Next: ${playlist[nextIndex].title}`);
  }
};

const prevSong = () => {
  if (!currentSong) return;

  // If autoplay is enabled, use autoplay history navigation
  if (isAutoplay) {
    if (autoplayHistory.length > 0) {
      // Get the last song from history
      const previousSong = autoplayHistory[autoplayHistory.length - 1];
      
      // Add current song to the front of autoplay queue for potential forward navigation
      setAutoplayQueue(prev => [currentSong, ...prev]);
      
      // Remove the song we're going back to from history
      setAutoplayHistory(prev => prev.slice(0, -1));
      
      setCurrentSong(previousSong);
      toast.info(`Previous: ${previousSong.title} by ${previousSong.artist}`);
    } else {
      toast.info('No previous songs in autoplay history');
    }
  } else {
    // Default behavior: navigate through liked songs playlist
    if (!playlist.length) {
      toast.info('No songs in playlist');
      return;
    }

    const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentSong(playlist[prevIndex]);
    toast.info(`Previous: ${playlist[prevIndex].title}`);
  }
};

  const handleSelectSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    

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

  // Function to fetch autoplay recommendations
  const fetchAutoplayRecommendations = async (currentSong: Song): Promise<Song[]> => {
    try {
      let allRecommendations: Song[] = [];
      
      // Try to get song recommendations first
      let recommendations = await SaavnApiService.getSongRecommendations(currentSong.id);
      allRecommendations = allRecommendations.concat(recommendations);
      
      // Also try artist songs for variety
      const artistSongs = await SaavnApiService.getArtistSongs(currentSong.artist);
      allRecommendations = allRecommendations.concat(artistSongs);
      
      // If still not enough, get trending songs
      if (allRecommendations.length < 10) {
        const trendingSongs = await SaavnApiService.getTrendingSongs();
        allRecommendations = allRecommendations.concat(trendingSongs);
      }
      
      // Remove duplicates by ID
      const uniqueRecommendations = allRecommendations.filter((song, index, self) => 
        index === self.findIndex(s => s.id === song.id)
      );
      
      // Filter out the current song, playlist songs, and already played songs
      const filteredRecommendations = uniqueRecommendations.filter(song => 
        song.id !== currentSong.id && 
        !playlist.some(p => p.id === song.id) &&
        !playedSongs.has(song.id)
      );
      
      // If we don't have enough fresh recommendations, clear some played history
      if (filteredRecommendations.length < 3 && playedSongs.size > 20) {
        console.log('Clearing some played songs history for variety');
        const playedArray = Array.from(playedSongs);
        const keepRecent = playedArray.slice(-10); // Keep last 10 played songs
        setPlayedSongs(new Set(keepRecent));
        
        // Re-filter with reduced history
        return uniqueRecommendations.filter(song => 
          song.id !== currentSong.id && 
          !playlist.some(p => p.id === song.id) &&
          !keepRecent.includes(song.id)
        ).slice(0, 8);
      }
      
      return filteredRecommendations.slice(0, 8);
    } catch (error) {
      console.error('Error fetching autoplay recommendations:', error);
      return [];
    }
  };

  const handleAudioEnded = async () => {
    // Prevent multiple simultaneous calls
    if (isLoadingNext) {
      return;
    }

    // Mark current song as played and add to autoplay history if autoplay is enabled
    setPlayedSongs(prev => new Set([...prev, currentSong.id]));
    if (isAutoplay) {
      setAutoplayHistory(prev => [...prev, currentSong]);
    }

    if (isRepeat) {
      setCurrentTime(0); // Go back to beginning
      setIsPlaying(true); // Restart the song
      return;
    }

    // Check if there are more songs in the user's playlist
    if (playlist.length > 1) {
      const currentIndex = playlist.findIndex(song => song.id === currentSong.id);
      const nextIndex = (currentIndex + 1) % playlist.length;
      setCurrentSong(playlist[nextIndex]);
      return;
    }

    // If autoplay is enabled and we're at the end of user's playlist
    if (isAutoplay) {
      setIsLoadingNext(true);
      
      try {
        // Check if we have songs in autoplay queue
        if (autoplayQueue.length > 0) {
          const nextSong = autoplayQueue[0];
          setCurrentSong(nextSong);
          setAutoplayQueue(prev => prev.slice(1)); // Remove the song we're about to play
          toast.info(`Autoplay: ${nextSong.title} by ${nextSong.artist}`);
          setIsLoadingNext(false);
          return;
        }

        // Fetch new recommendations if autoplay queue is empty
        const recommendations = await fetchAutoplayRecommendations(currentSong);
        if (recommendations.length > 0) {
          const nextSong = recommendations[0];
          setCurrentSong(nextSong);
          setAutoplayQueue(recommendations.slice(1)); // Store remaining songs for later
          toast.info(`Autoplay: ${nextSong.title} by ${nextSong.artist}`);
          setIsLoadingNext(false);
          return;
        }
      } catch (error) {
        console.error('Error in autoplay:', error);
      } finally {
        setIsLoadingNext(false);
      }
    }

    // If no autoplay or no recommendations found, stop playing
    setCurrentTime(0);
    setIsPlaying(false);
    toast.info('Playback ended');
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

// Function to toggle autoplay
const handleAutoplayToggle = () => {
  setIsAutoplay(prev => {
    const newAutoplayState = !prev;
    toast.info(newAutoplayState ? 'Autoplay enabled' : 'Autoplay disabled');
    return newAutoplayState;
  });
};

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent keyboard shortcuts when user is typing in input fields
      const isInputFocused = 
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.contentEditable === 'true';

      if (isInputFocused) return;

      // Search shortcut (Ctrl/Cmd + K)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      // Spacebar for play/pause
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => {
          const newPlayState = !prev;
          toast.info(newPlayState ? 'Playing' : 'Paused');
          return newPlayState;
        });
        return;
      }

      // Arrow keys for volume control
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => {
          const newVolume = Math.min(100, prev + 5);
          toast.info(`Volume: ${newVolume}%`);
          return newVolume;
        });
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => {
          const newVolume = Math.max(0, prev - 5);
          toast.info(`Volume: ${newVolume}%`);
          return newVolume;
        });
        return;
      }

      // Left/Right arrow keys for seeking (±5 seconds)
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (duration > 0) {
          const newTime = Math.max(0, currentTime - 5);
          const newProgress = (newTime / duration) * 100;
          onTimeChange(newProgress);
          toast.info(`Seek: -5s`);
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (duration > 0) {
          const newTime = currentTime + 5;
          // If seeking would go beyond the end, trigger next song
          if (newTime >= duration) {
            handleAudioEnded();
            toast.info('End of song - Next track');
          } else {
            const newProgress = (newTime / duration) * 100;
            onTimeChange(newProgress);
            toast.info(`Seek: +5s`);
          }
        }
        return;
      }

      // Comma (,) for previous song
      if (e.key === ',') {
        e.preventDefault();
        prevSong();
        toast.info('Previous song');
        return;
      }

      // Period (.) for next song
      if (e.key === '.') {
        e.preventDefault();
        nextSong();
        toast.info('Next song');
        return;
      }

      // 'A' key for autoplay toggle
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleAutoplayToggle();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTime, duration, onTimeChange, handleAutoplayToggle, prevSong, nextSong, handleAudioEnded]);

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
      {/* <BackgroundFlow colors={extractedColors} isPlaying={isPlaying} /> */}

      <BackgroundFlow
  colors={{
    primary: primaryColor,
    secondary: secondaryColor,
    accent: accentColor,
  }}
  isPlaying={isPlaying}
/>

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
        <div className="hidden sm:flex w-full px-3 mt-1">
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
            isRepeat={isRepeat}
            onToggleRepeat={() => setIsRepeat(prev => !prev)}
            isAutoplay={isAutoplay}
            onToggleAutoplay={handleAutoplayToggle}
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