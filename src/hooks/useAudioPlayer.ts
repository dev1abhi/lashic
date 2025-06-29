import { useState, useRef, useCallback } from 'react';
import { Song } from '@/components/types';
import { toast } from '@/components/ui/sonner';

export const useAudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [progress, setProgress] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);

  const handleTimeUpdate = useCallback((current: number, total: number) => {
    setCurrentTime(current);
    setDuration(total);
    setProgress((current / total) * 100);
  }, []);

  const onTimeChange = useCallback((value: number) => {
    setProgress(value);
    setCurrentTime((value / 100) * duration);
  }, [duration]);

  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleAudioError = useCallback((error: string) => {
    toast.error(`Audio Error: ${error}`);
    setIsPlaying(false);
  }, []);

  return {
    // State
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    volume,
    setVolume,
    progress,
    setProgress,
    isRepeat,
    setIsRepeat,
    
    // Handlers
    handleTimeUpdate,
    onTimeChange,
    formatTime,
    handleAudioError,
  };
};