// PlaylistSidebar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Song } from './types';

interface Props {
  visible: boolean;
  songs: Song[];
  currentSongId: number;
  onClose: () => void;
  onSelectSong: (song: Song) => void;
}

export const PlaylistSidebar: React.FC<Props> = ({ visible, songs, currentSongId, onClose, onSelectSong }) => (
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
        {songs.map((song) => (
          <div
            key={song.id}
            onClick={() => onSelectSong(song)}
            className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover:bg-white/10 ${
              currentSongId === song.id ? 'bg-white/20 ring-2 ring-white/30' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <img src={song.poster} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{song.title}</p>
                <p className="text-gray-300 text-sm truncate">{song.artist}</p>
              </div>
              <span className="text-gray-400 text-xs">{song.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
