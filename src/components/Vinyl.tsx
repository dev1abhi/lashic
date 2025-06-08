// Vinyl.tsx
import React from 'react';

interface Props {
  poster: string;
  title: string;
  isPlaying: boolean;
}

export const Vinyl: React.FC<Props> = ({ poster, title, isPlaying }) => (
  <div className="relative flex-shrink-0">
    <div className={`w-96 h-96 md:w-[500px] md:h-[500px] rounded-full glass-strong flex items-center justify-center relative ${
      isPlaying ? 'vinyl-spin vinyl-depth' : 'vinyl-spin vinyl-spin-paused'
    }`}>
      <div className="absolute inset-4 rounded-full border-2 border-white/20"></div>
      <div className="absolute inset-8 rounded-full border border-white/10"></div>
      <div className="absolute inset-12 rounded-full border border-white/10"></div>
      <div className="absolute inset-16 rounded-full border border-white/10"></div>
      <div className="absolute inset-20 rounded-full border border-white/10"></div>
      <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden ring-4 ring-white/30">
        <img src={poster} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="absolute w-6 h-6 bg-white/80 rounded-full"></div>
    </div>
    <div className="absolute -right-12 top-1/2 transform -translate-y-1/2">
      <div className="w-32 h-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full origin-left transform rotate-12"></div>
      <div className="w-4 h-4 bg-gray-400 rounded-full -mt-1.5 ml-28"></div>
    </div>
  </div>
);