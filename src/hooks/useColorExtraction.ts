import { useState, useEffect } from 'react';
import { Song } from '@/components/types';
import { extractColorsFromImage } from '@/utils/colorUtils';

export const useColorExtraction = (currentSong: Song) => {
  const [primaryColor, setPrimaryColor] = useState(currentSong.colors.primary);
  const [secondaryColor, setSecondaryColor] = useState(currentSong.colors.secondary);
  const [accentColor, setAccentColor] = useState(currentSong.colors.accent);

  useEffect(() => {
    if (currentSong) {
      extractColorsFromImage(currentSong.poster).then((colors) => {
        setPrimaryColor(colors[0]);
        setSecondaryColor(colors[1]);
        setAccentColor(colors[2]);
      });
    }
  }, [currentSong]);

  return {
    primaryColor,
    secondaryColor,
    accentColor,
  };
};