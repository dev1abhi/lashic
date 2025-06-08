import React, { useRef, useEffect, useState } from 'react';

interface AudioPlayerProps {
  audioUrl?: string;
  isPlaying: boolean;
  volume: number;
  currentTime?: number; // in seconds
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
  currentTime,
  onTimeUpdate,
  onEnded,
  onLoadStart,
  onCanPlay,
  onError
}) => {


  const audioRef = useRef<HTMLAudioElement>(null);
  const [isReady, setIsReady] = useState(false);

// Update currentTime in audio element when it changes
    useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentTime === undefined || isNaN(currentTime)) return;

    if (Math.abs(audio.currentTime - currentTime) > 0.5) {
      audio.currentTime = currentTime;
    }
  }, [currentTime]);

  // Load new audio URL
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audioUrl) {
      setIsReady(false);
      audio.src = audioUrl;
      audio.load();
      onLoadStart?.();
    } else {
      audio.pause();
      setIsReady(false);
    }
  }, [audioUrl, onLoadStart]);


  useEffect(() => {
  const audio = audioRef.current;
  if (!audio) return;

  if (!isReady) return; // let handleCanPlay do the play()

  if (isPlaying) {
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Only log non-Abort errors
        if (error.name !== 'AbortError') {
          console.error('Error playing audio:', error);
          onError?.('Failed to play audio');
        }
      });
    }
  } else {
    audio.pause();
  }
}, [isPlaying, isReady, onError]);

  // Update volume
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
    }
  }, [volume]);

  // When audio can play, mark ready and call onCanPlay
  const handleCanPlay = () => {
  setIsReady(true);
  //console.log(isPlaying, audioRef.current?.currentTime);

  if (isPlaying) {
    audioRef.current?.play().catch((error) => {
      if (error.name !== 'AbortError') {
        console.error("Error playing audio:", error);
        onError?.("Failed to play audio");
      }
    });
  }

  onCanPlay?.();
};

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && onTimeUpdate) {
      if (!isFinite(audio.currentTime) || !isFinite(audio.duration)) return;
      onTimeUpdate(audio.currentTime, audio.duration || 0);
    }
  };


  const handleEnded = () => {
    onEnded?.();
  };

  const handleError = () => {
    setIsReady(false);
    onError?.('Failed to load audio');
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleEnded}
      onCanPlay={handleCanPlay}
      onError={handleError}
      preload="metadata"
      crossOrigin="anonymous"
    />
  );
};
