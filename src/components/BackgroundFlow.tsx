import React, { useEffect, useState } from 'react';

type BackgroundFlowProps = {
  colors: { primary: string; secondary: string; accent: string };
  isPlaying: boolean;
};

export const BackgroundFlow: React.FC<BackgroundFlowProps> = ({ colors, isPlaying }) => {
  // We'll animate only when isPlaying is true
  // Use CSS animations with keyframes to move blobs around

  return (
    <div
      aria-hidden="true"
      className="background-flow"
      style={{
        '--color1': colors.primary,
        '--color2': colors.secondary,
        '--color3': colors.accent,
        animationPlayState: isPlaying ? 'running' : 'paused',
        zIndex: 0,
      } as React.CSSProperties}
    />
  );
};
