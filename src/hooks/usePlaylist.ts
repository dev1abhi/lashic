import { useState, useCallback } from 'react';
import { Song } from '@/components/types';
import { 
  getLikedSongs, 
  isSongLiked, 
  addLikedSong, 
  removeLikedSong 
} from '@/utils/playlist';
import { toast } from '@/components/ui/sonner';

export const usePlaylist = () => {
  const [playlist, setPlaylist] = useState<Song[]>(getLikedSongs());

  const handleLikeToggle = useCallback((currentSong: Song) => {
    if (!currentSong) return;
    
    const liked = isSongLiked(currentSong);
    if (liked) {
      removeLikedSong(currentSong.id);
      setPlaylist((prev) => prev.filter((s) => s.id !== currentSong.id));
    } else {
      addLikedSong(currentSong);
      setPlaylist((prev) => [...prev, currentSong]);
    }
  }, []);

  const handleDeleteSong = useCallback((id: string) => {
    removeLikedSong(id);
    setPlaylist((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return {
    playlist,
    setPlaylist,
    handleLikeToggle,
    handleDeleteSong,
  };
};