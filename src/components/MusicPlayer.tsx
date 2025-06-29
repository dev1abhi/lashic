import React, { useEffect, useState } from 'react';
import { Song } from './types';
import { SongInfo } from './SongInfo';
import { Controls } from './Controls';
import { Vinyl } from './Vinyl';
import { PlaylistSidebar } from './PlaylistsSidebar';
import { LyricsSidebar } from './LyricsSidebar';
import { SearchModal } from './SearchModal';
import { AudioPlayer } from './AudioPlayer';
import { BackgroundFlow } from './BackgroundFlow';
import { Slider } from './ui/slider';
import { toast } from '@/components/ui/sonner';

// Custom hooks
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useAutoplay } from '@/hooks/useAutoplay';
import { usePlaylist } from '@/hooks/usePlaylist';
import { useNavigation } from '@/hooks/useNavigation';
import { useColorExtraction } from '@/hooks/useColorExtraction';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const sampleSongs: Song[] = [
  {
    id: "JkNTq6Kh",
    title: "I Wanna Be Yours (Violin)",
    artist: "Dramatic Violin",
    album: "I Wanna Be Yours (Violin)",
    duration: "2:01",
    poster: "https://c.saavncdn.com/915/I-Wanna-Be-Yours-Violin-Unknown-2023-20250108075659-500x500.jpg",
    audioUrl: "https://aac.saavncdn.com/915/ac73938eb6ed3d2dffa1b88e7eacc34d_320.mp4",
    colors: {
      primary: "#1a1a1a",
      secondary: "#2d2d2d",
      accent: "#6a1b9a"
    }
  },
];

export const MusicPlayer = () => {
  // UI State
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [currentSong, setCurrentSong] = useState(sampleSongs[0]);
  const defaultSong = sampleSongs[0];

  // Custom hooks
  const audioPlayer = useAudioPlayer();
  const autoplay = useAutoplay();
  const playlist = usePlaylist();
  const colors = useColorExtraction(currentSong);

  // Navigation hook
  const navigation = useNavigation({
    currentSong,
    setCurrentSong,
    playlist: playlist.playlist,
    isAutoplay: autoplay.isAutoplay,
    autoplayQueue: autoplay.autoplayQueue,
    setAutoplayQueue: autoplay.setAutoplayQueue,
    autoplayHistory: autoplay.autoplayHistory,
    setAutoplayHistory: autoplay.setAutoplayHistory,
    setIsLoadingNext: autoplay.setIsLoadingNext,
    fetchAutoplayRecommendations: autoplay.fetchAutoplayRecommendations,
  });

  // Handle audio ended
  const handleAudioEnded = async () => {
      if (autoplay.isLoadingNext) return;

  autoplay.setPlayedSongs(prev => new Set([...prev, currentSong.id]));
  if (autoplay.isAutoplay) {
    autoplay.setAutoplayHistory(prev => [...prev, currentSong]);
  }

  // Priority 1: repeat
  if (audioPlayer.isRepeat) {
    audioPlayer.setCurrentTime(0);
    audioPlayer.setIsPlaying(true);
    return;
  }

  // Priority 2: autoplay
  if (autoplay.isAutoplay) {
    autoplay.setIsLoadingNext(true);
    try {
      if (autoplay.autoplayQueue.length > 0) {
        const nextSong = autoplay.autoplayQueue[0];
        setCurrentSong(nextSong);
        autoplay.setAutoplayQueue(prev => prev.slice(1));
        toast.info(`Autoplay: ${nextSong.title} by ${nextSong.artist}`);
        return;
      }

      const recommendations = await autoplay.fetchAutoplayRecommendations(currentSong);
      if (recommendations.length > 0) {
        const nextSong = recommendations[0];
        setCurrentSong(nextSong);
        autoplay.setAutoplayQueue(recommendations.slice(1));
        toast.info(`Autoplay: ${nextSong.title} by ${nextSong.artist}`);
        return;
      }
    } catch (error) {
      console.error('Error in autoplay:', error);
    } finally {
      autoplay.setIsLoadingNext(false);
    }
  }

  // Priority 3: playlist
  if (playlist.playlist.length > 1) {
    const currentIndex = playlist.playlist.findIndex(song => song.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.playlist.length;
    setCurrentSong(playlist.playlist[nextIndex]);
    return;
  }

  // Fallback: stop playback
  audioPlayer.setCurrentTime(0);
  audioPlayer.setIsPlaying(false);
  toast.info('Playback ended');
  };

  // Set first song from playlist if current song is default
  useEffect(() => {
    if (currentSong === defaultSong && playlist.playlist.length > 0) {
      setCurrentSong(playlist.playlist[0]);
    }
  }, [playlist.playlist, currentSong, defaultSong]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    setIsPlaying: audioPlayer.setIsPlaying,
    setVolume: audioPlayer.setVolume,
    currentTime: audioPlayer.currentTime,
    duration: audioPlayer.duration,
    onTimeChange: audioPlayer.onTimeChange,
    handleAudioEnded,
    prevSong: navigation.prevSong,
    nextSong: navigation.nextSong,
    handleAutoplayToggle: autoplay.handleAutoplayToggle,
    setShowSearch,
  });

  return (
    <>
      {/* Audio Player Component */}
      <AudioPlayer
        audioUrl={currentSong.audioUrl}
        isPlaying={audioPlayer.isPlaying}
        volume={audioPlayer.volume}
        currentTime={audioPlayer.currentTime}
        onTimeUpdate={audioPlayer.handleTimeUpdate}
        onEnded={handleAudioEnded}
        onError={audioPlayer.handleAudioError}
      />

      {/* Animated flowing colored background */}
      <BackgroundFlow
        colors={{
          primary: colors.primaryColor,
          secondary: colors.secondaryColor,
          accent: colors.accentColor,
        }}
        isPlaying={audioPlayer.isPlaying}
      />

      {/* Glass pane blur overlay */}
      <div className="glass-pane" aria-hidden="true" />

      {/* Main player UI */}
      <div style={{ position: 'relative', zIndex: 2 }}>  
        <div className="overflow-hidden p-4 md:p-8 relative z-10" style={{ height: '100dvh' }}>
          <div className="max-w-7xl mx-auto h-full flex flex-col justify-center">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-0 md:space-y-0 md:space-x-16 flex-1">
              
              {/* Mobile vinyl */}
              <div className="flex-shrink-0 md:hidden">
                <Vinyl poster={currentSong.poster} title={currentSong.title} isPlaying={audioPlayer.isPlaying} />
              </div>
              
              {/* Details stack below on mobile, right on desktop */}
              <div className="flex flex-col md:flex-row md:space-y-0 md:space-x-10 w-full max-w-xl mx-auto">
                
                {/* Volume + Info + Controls */}
                <div className="flex md:flex-row items-center md:items-start space-y-6 md:space-y-10 w-full max-w-full px-2">
                  
                  {/* Volume Slider (visible only on md and above) */}
                  <div className="hidden sm:flex w-full px-3 mt-1">
                    <div className="h-[300px] w-9 rounded-full bg-black/10 flex items-center justify-center p-2 mt-10">
                      <Slider
                        orientation="vertical"
                        value={[audioPlayer.volume]}
                        max={100}
                        step={1}
                        onValueChange={(v) => audioPlayer.setVolume(v[0])}
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
                      onToggleLike={() => playlist.handleLikeToggle(currentSong)}
                      isLiked={playlist.playlist.some(s => s.id === currentSong.id)}
                    />

                    <Controls
                      isPlaying={audioPlayer.isPlaying}
                      onPlayToggle={() => audioPlayer.setIsPlaying(!audioPlayer.isPlaying)}
                      currentTime={audioPlayer.currentTime}
                      duration={audioPlayer.formatTime(audioPlayer.duration)}
                      onTimeChange={audioPlayer.onTimeChange}
                      volume={audioPlayer.volume}
                      onVolumeChange={audioPlayer.setVolume}
                      onPrev={navigation.prevSong}
                      onNext={navigation.nextSong}
                      progress={audioPlayer.progress || 0}
                      isRepeat={audioPlayer.isRepeat}
                      onToggleRepeat={() => audioPlayer.setIsRepeat(prev => !prev)}
                      isAutoplay={autoplay.isAutoplay}
                      onToggleAutoplay={autoplay.handleAutoplayToggle}
                    />
                  </div>
                </div>
              </div>

              {/* Desktop vinyl */}
              <div className="flex-shrink-0 hidden md:block">
                <Vinyl poster={currentSong.poster} title={currentSong.title} isPlaying={audioPlayer.isPlaying} />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebars and Modals */}
        <PlaylistSidebar
          visible={showPlaylist}
          songs={playlist.playlist}
          currentSongId={currentSong.id}
          onClose={() => setShowPlaylist(false)}
          onSelectSong={navigation.handleSelectSong}
          onDeleteSong={playlist.handleDeleteSong}
        />

        <LyricsSidebar
          visible={showLyrics}
          onClose={() => setShowLyrics(false)}
        />

        <SearchModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          onSelectSong={navigation.handleSelectSong}
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