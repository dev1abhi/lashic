// Controls.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { ProgressSlider } from './ui/progressSlider';
import WavySlider from './ui/wavyslider';

interface Props {
  isPlaying: boolean;
  currentTime: number;
  duration: string;
  volume: number;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTimeChange: (val: number) => void;
  onVolumeChange: (val: number) => void;
}

export const Controls: React.FC<Props> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayToggle,
  onPrev,
  onNext,
  onTimeChange,
  onVolumeChange,
}) => {

    
const [progress, setProgress] = React.useState<number>(0);

  return (
    <div className="relative flex items-center justify-center w-full">
      {/* Main Controls */}
      <div className="flex flex-col items-center justify-center space-y-6 w-full">
        <div className="flex items-center justify-center space-x-6">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Shuffle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onPrev}>
            <SkipBack className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-16 h-16 text-white hover:bg-white/10 pulse-glow"
            onClick={onPlayToggle}
          >
            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onNext}>
            <SkipForward className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Repeat className="w-5 h-5" />
          </Button>
        </div>

        {/* Timeline Slider */}
        <div className="w-full max-w-md mx-auto">
          <WavySlider value={progress} onChange={setProgress} isPlaying={isPlaying}/>
          <div className="flex justify-between text-sm text-gray-400">
            <span>0:00</span>
            <span>{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
