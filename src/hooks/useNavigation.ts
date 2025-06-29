import { useCallback } from 'react';
import { Song } from '@/components/types';
import { toast } from '@/components/ui/sonner';

interface UseNavigationProps {
  currentSong: Song;
  setCurrentSong: (song: Song) => void;
  playlist: Song[];
  isAutoplay: boolean;
  autoplayQueue: Song[];
  setAutoplayQueue: (queue: Song[] | ((prev: Song[]) => Song[])) => void;
  autoplayHistory: Song[];
  setAutoplayHistory: (history: Song[] | ((prev: Song[]) => Song[])) => void;
  setIsLoadingNext: (loading: boolean) => void;
  fetchAutoplayRecommendations: (song: Song) => Promise<Song[]>;
}

export const useNavigation = ({
  currentSong,
  setCurrentSong,
  playlist,
  isAutoplay,
  autoplayQueue,
  setAutoplayQueue,
  autoplayHistory,
  setAutoplayHistory,
  setIsLoadingNext,
  fetchAutoplayRecommendations,
}: UseNavigationProps) => {

  const nextSong = useCallback(async () => {
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
  }, [
    currentSong,
    isAutoplay,
    autoplayQueue,
    playlist,
    setCurrentSong,
    setAutoplayHistory,
    setAutoplayQueue,
    setIsLoadingNext,
    fetchAutoplayRecommendations,
  ]);

  const prevSong = useCallback(() => {
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
  }, [
    currentSong,
    isAutoplay,
    autoplayHistory,
    playlist,
    setCurrentSong,
    setAutoplayQueue,
    setAutoplayHistory,
  ]);

  const handleSelectSong = useCallback((song: Song) => {
    setCurrentSong(song);
    toast.success(`Now playing: ${song.title} by ${song.artist}`);
  }, [setCurrentSong]);

  return {
    nextSong,
    prevSong,
    handleSelectSong,
  };
};