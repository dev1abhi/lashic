
import React, { useRef, useState, useEffect } from "react";

type WavySliderProps = {
  value: number; // 0–100
  onChange: (value: number) => void;
  isPlaying: boolean;
};

export const WavySlider: React.FC<WavySliderProps> = ({
  value,
  onChange,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  const height = 60;
  const amplitude = 20;
  const frequency = 0.05;

  const [phase, setPhase] = useState(0);
  const animationRef = useRef<number>();

  // Resize-aware width update
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth(); // initial
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(animationRef.current!);
      return;
    }

    const animate = () => {
      setPhase((prev) => prev + 0.03); // control speed
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [isPlaying]);

  // Generate the wave path
  const wavePath = Array.from({ length: width }, (_, x) => {
    const y = height / 2 + amplitude * Math.sin(x * frequency + phase);
    return `${x},${y}`;
  }).join(" L ");

  const posX = (value / 100) * width;
  const posY = height / 2 + amplitude * Math.sin(posX * frequency + phase);

  // Drag handling
  const handleMouseDown = () => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.min(Math.max(e.clientX - rect.left, 0), width);
      const newValue = (x / width) * 100;
      onChange(newValue);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(e.clientX - rect.left, 0), width);
    const newValue = (x / width) * 100;
    onChange(newValue);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[60px] select-none"
      style={{ minWidth: "200px", maxWidth: "100%" }}
    >
      <svg width={width} height={height} onClick={handleClick}>
        <path
          d={`M ${wavePath}`}
          fill="none"
          stroke="#aaa"
          strokeWidth="3"
          className="cursor-pointer"
        />
        <circle
          cx={posX}
          cy={posY}
          r={10}
          fill="#fff"
          stroke="#000"
          strokeWidth={2}
          onMouseDown={handleMouseDown}
          style={{ cursor: "grab" }}
        />
      </svg>
    </div>
  );
};

export default WavySlider;
