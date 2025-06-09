import React from 'react';
import { Button } from '@/components/ui/button';
import { List, FileText, Search, Heart } from 'lucide-react';
import { cn } from '@/lib/utils'; // optional utility for conditional classes

interface Props {
  title: string;
  artist: string;
  album: string;
  isLiked: boolean;
  onTogglePlaylist: () => void;
  onToggleLyrics: () => void;
  onToggleSearch: () => void;
  onToggleLike: () => void;

}

export const SongInfo: React.FC<Props> = ({ 
  title, 
  artist, 
  album, 
  isLiked,
  onTogglePlaylist, 
  onToggleLyrics, 
  onToggleSearch, 
  onToggleLike 
}) => (
<div className="flex flex-col justify-center space-y-0 text-left min-w-0 flex-shrink-0 md:pl-7">
    
<div  className="overflow-hidden relative w-full  h-8 md:h-12 transition-all duration-300" 
 style={{
    minWidth: title.length > 28 ? `${Math.min(title.length * 25, 600)}px` : '500px',
    maxWidth: '100%',
  }}
>
  {/* Marquee effect for long titles */}
  <div
    className={`${
      title.length > 28 ? "absolute animate-marquee" : "relative"
    } whitespace-nowrap text-white font-bold leading-tight text-2xl md:text-4xl transition-all duration-300`}
    style={
      title.length > 28
        ? { animationDuration: `${title.length / 4}s` }
        : undefined
    }
  >
    {title}
  </div>
</div>


    <p className="text-1xl md:text-1xl text-gray-300">{artist}</p>
    {/* <p className="text-xl text-gray-400">{album}</p> */}

    <div className="flex space-x-4 mt-8">
      <Button variant="ghost" onClick={onToggleSearch} className="pl-0 text-white hover:bg-white/10 flex items-center space-x-2">
        <Search className="w-5 h-5" />
        <span>Search</span>
      </Button>
      <Button variant="ghost" onClick={onTogglePlaylist} className="pl-0 text-white hover:bg-white/10 flex items-center space-x-2">
        <List className="w-5 h-5" />
        <span>Playlist</span>
      </Button>
      <Button variant="ghost" onClick={onToggleLyrics} className="hidden sm:flex text-white hover:bg-white/10 items-center space-x-2">
        <FileText className="w-5 h-5" />
        <span>Lyrics</span>
      </Button>
      



       {/* ❤️ Like button */}
      <Button
        variant="ghost"
        onClick={onToggleLike}
        className={cn(
          'text-white flex items-center space-x-2 hover:bg-white/10',
          isLiked ? 'text-pink-400' : 'text-white'
        )}
      >
        <Heart className="w-5 h-5 fill-current" fill={isLiked ? 'currentColor' : 'none'} />
        <span>{isLiked ? 'Liked' : 'Like'}</span>
      </Button>

    </div>
  </div>
);