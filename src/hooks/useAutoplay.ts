import { useState, useCallback } from 'react';
import { Song } from '@/components/types';
import { SaavnApiService } from '@/services/saavnApi';
import { toast } from '@/components/ui/sonner';

export const useAutoplay = () => {
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [autoplayQueue, setAutoplayQueue] = useState<Song[]>([]);
  const [playedSongs, setPlayedSongs] = useState<Set<string>>(new Set());
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [autoplayHistory, setAutoplayHistory] = useState<Song[]>([]);

  const fetchAutoplayRecommendations = useCallback(async (currentSong: Song): Promise<Song[]> => {
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
          !keepRecent.includes(song.id)
        ).slice(0, 8);
      }
      
      return filteredRecommendations.slice(0, 8);
    } catch (error) {
      console.error('Error fetching autoplay recommendations:', error);
      return [];
    }
  }, [playedSongs]);

  const handleAutoplayToggle = useCallback(() => {
    setIsAutoplay(prev => {
      const newAutoplayState = !prev;
      toast.info(newAutoplayState ? 'Autoplay enabled' : 'Autoplay disabled');
      return newAutoplayState;
    });
  }, []);

  return {
    // State
    isAutoplay,
    setIsAutoplay,
    autoplayQueue,
    setAutoplayQueue,
    playedSongs,
    setPlayedSongs,
    isLoadingNext,
    setIsLoadingNext,
    autoplayHistory,
    setAutoplayHistory,
    
    // Functions
    fetchAutoplayRecommendations,
    handleAutoplayToggle,
  };
};