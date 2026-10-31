import React, { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatioClass?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeLabel = 'Prima (Rilievo grezzo)',
  afterLabel = 'Dopo (Vision AI)',
  aspectRatioClass = 'aspect-16/10 sm:aspect-16/9',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      handleMove(e.clientX);
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={`relative w-full ${aspectRatioClass} rounded-3xl overflow-hidden select-none cursor-ew-resize border border-[#E5DFD5] shadow-lg bg-[#26343B] touch-none`}
    >
      {/* Background (After / Rendered Image) */}
      <img
        src={afterImage}
        alt="Dopo - Rendering Vision AI"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Foreground (Before / Original Photo clipped by slider position) */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Prima - Foto originale"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      {/* Divider Bar & Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none flex items-center justify-center -ml-0.5"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="w-9 h-9 rounded-full bg-white text-[#26343B] shadow-xl border border-[#E5DFD5] flex items-center justify-center -ml-4 pointer-events-none transform active:scale-95 transition-transform">
          <SlidersHorizontal className="w-4 h-4 text-[#8F7451]" />
        </div>
      </div>

      {/* Before Label Badge */}
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold tracking-wide pointer-events-none shadow-xs">
        {beforeLabel}
      </div>

      {/* After Label Badge */}
      <div className="absolute top-4 right-4 bg-[#26343B]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold tracking-wide flex items-center gap-1.5 pointer-events-none shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#B79B76]" />
        <span>{afterLabel}</span>
      </div>

      {/* Interactive Helper Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white/90 text-[11px] font-medium pointer-events-none">
        Trascina per confrontare
      </div>
    </div>
  );
};
