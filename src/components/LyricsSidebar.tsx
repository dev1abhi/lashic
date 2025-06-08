// LyricsSidebar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const LyricsSidebar: React.FC<Props> = ({ visible, onClose }) => (
  <div className={`fixed top-0 right-0 h-full w-80 glass-strong z-50 transform transition-transform duration-300 ${
    visible ? 'translate-x-0' : 'translate-x-full'
  }`}>
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Lyrics</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p className="text-white font-medium">Verse 1:</p>
        <p>In the silence of the night<br />Stars are dancing out of sight<br />Dreams are calling from afar<br />Like a bright and shining star</p>

        <p className="text-white font-medium">Chorus:</p>
        <p>We're chasing midnight dreams<br />Nothing's quite the way it seems<br />In this world of endless streams<br />We're chasing midnight dreams</p>

        <p className="text-white font-medium">Verse 2:</p>
        <p>Through the shadows we will find<br />Peace of heart and peace of mind<br />Every step leads us home<br />Never have to walk alone</p>

        <p className="text-white font-medium">Bridge:</p>
        <p>Time keeps flowing like a river<br />Every moment makes us shiver<br />In the beauty of the night<br />Everything will be alright</p>
      </div>
    </div>
  </div>
);
