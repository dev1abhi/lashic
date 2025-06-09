import React from 'react';
import { Button } from '@/components/ui/button';
import { X , MinusCircle } from 'lucide-react';
import { Song } from './types';

interface Props {
  visible: boolean;
  songs: Song[];
  currentSongId: string;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
}

export const PlaylistSidebar: React.FC<Props> = ({ visible, songs, currentSongId, onClose, onSelectSong, onDeleteSong }) => (
  <div className={`fixed top-0 left-0 h-full w-80 glass-strong z-50 transform transition-transform duration-300 ${
    visible ? 'translate-x-0' : '-translate-x-full'
  }`}>
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Playlist</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="space-y-3">
  {songs.length === 0 ? (
    <div className="text-white/70 text-sm text-center mt-10">
      No songs yet. Like a song to add it here!
    </div>
  ) : (
    songs.map((song) => (
      <div
        key={song.id}
        onClick={() => onSelectSong(song)}
        className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 ${
          currentSongId === song.id ? 'bg-white/20 ring-2 ring-white/30' : ''
        }`}
      >
        <div className="flex items-center space-x-3">
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
          </div>
          <span className="text-gray-400 text-xs">{song.duration}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteSong(song.id);
            }}
          >
            <MinusCircle className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </div>
    ))
  )}
</div>

    </div>
  </div>
);