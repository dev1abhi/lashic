import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Search, Loader2 } from 'lucide-react';
import { Song } from './types';
import { SaavnApiService } from '@/services/saavnApi';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
}

export const SearchModal: React.FC<Props> = ({ visible, onClose, onSelectSong }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Reset search and selection when modal opens
  useEffect(() => {
    if (visible) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(0);
      setIsLoading(false);
      // Focus input after a brief delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  // Update selected index when filtered results change
  useEffect(() => {
    if (selectedIndex >= searchResults.length) {
      setSelectedIndex(Math.max(0, searchResults.length - 1));
    }
  }, [searchResults.length, selectedIndex]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await SaavnApiService.searchSongs(searchQuery.trim());
        setSearchResults(results);
        setSelectedIndex(0);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            onSelectSong(searchResults[selectedIndex]);
            onClose();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, selectedIndex, searchResults, onSelectSong, onClose]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4">
        <div className="glass-strong rounded-2xl p-3 max-h-[80vh] flex flex-col">
          {/* Header */}
          {/* <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Search Songs</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div> */}

          {/* Search Input */}
          {/* mb-1 resposible for margin below search box */}
          <div className="relative mb-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40 focus:ring-white/20"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery.trim().length < 2 ? (
              <div className="text-center py-0 text-gray-400">
                {/* Start typing to search for songs... */}
              </div>
            ) : isLoading ? (
              <div className="text-center py-8 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No songs found for "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      onSelectSong(song);
                      onClose();
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      index === selectedIndex 
                        ? 'bg-white/20 ring-2 ring-white/30' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <img 
                        src={song.poster} 
                        alt={song.title} 
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{song.title}</p>
                        <p className="text-gray-300 text-sm truncate">{song.artist}</p>
                        <p className="text-gray-400 text-xs truncate">{song.album}</p>
                      </div>
                      <span className="text-gray-400 text-sm">{song.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {searchResults.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{searchResults.length} song{searchResults.length !== 1 ? 's' : ''} found</span>
                <div className="flex items-center space-x-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};