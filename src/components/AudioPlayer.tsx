import React, { useRef, useEffect, useState } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  isPlaying: boolean;
  volume: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  isPlaying,
  volume,
  onTimeUpdate,
  onEnded,
  onLoadStart,
  onCanPlay,
  onError
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          onError?.('Failed to play audio');
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, audioUrl, onError]);

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  // Handle audio URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioUrl) {
      setIsLoading(true);
      audio.src = audioUrl;
      audio.load();
    }
  }, [audioUrl]);

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && onTimeUpdate) {
      onTimeUpdate(audio.currentTime, audio.duration || 0);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    onCanPlay?.();
  };

  const handleError = () => {
    setIsLoading(false);
    onError?.('Failed to load audio');
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onEnded={onEnded}
      onLoadStart={handleLoadStart}
      onCanPlay={handleCanPlay}
      onError={handleError}
      preload="metadata"
      crossOrigin="anonymous"
    />
  );
};