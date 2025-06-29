import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
  setIsPlaying: (playing: boolean | ((prev: boolean) => boolean)) => void;
  setVolume: (volume: number | ((prev: number) => number)) => void;
  currentTime: number;
  duration: number;
  onTimeChange: (value: number) => void;
  handleAudioEnded: () => void;
  prevSong: () => void;
  nextSong: () => void;
  handleAutoplayToggle: () => void;
  setShowSearch: (show: boolean) => void;
}

export const useKeyboardShortcuts = ({
  setIsPlaying,
  setVolume,
  currentTime,
  duration,
  onTimeChange,
  handleAudioEnded,
  prevSong,
  nextSong,
  handleAutoplayToggle,
  setShowSearch,
}: UseKeyboardShortcutsProps) => {
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
        setIsPlaying(prev => !prev);
        return;
      }

      // Arrow keys for volume control
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setVolume(prev => Math.min(100, prev + 5));
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setVolume(prev => Math.max(0, prev - 5));
        return;
      }

      // Left/Right arrow keys for seeking (±5 seconds)
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (duration > 0) {
          const newTime = Math.max(0, currentTime - 5);
          const newProgress = (newTime / duration) * 100;
          onTimeChange(newProgress);
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
          } else {
            const newProgress = (newTime / duration) * 100;
            onTimeChange(newProgress);
          }
        }
        return;
      }

      // Comma (,) for previous song
      if (e.key === ',') {
        e.preventDefault();
        prevSong();
        return;
      }

      // Period (.) for next song
      if (e.key === '.') {
        e.preventDefault();
        nextSong();
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
  }, [
    setIsPlaying,
    setVolume,
    currentTime,
    duration,
    onTimeChange,
    handleAudioEnded,
    prevSong,
    nextSong,
    handleAutoplayToggle,
    setShowSearch,
  ]);
};