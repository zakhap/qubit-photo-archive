'use client';

import { useState, useEffect, useRef } from 'react';

interface ImageGridProps {
  images: {
    thumbnailUrl: string;
    fullUrl: string;
    title: string;
  }[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imageRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage !== null) {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;

          if (entry.isIntersecting) {
            // Element is entering viewport
            target.classList.remove('exiting-top');
            target.classList.add('visible');
          } else {
            // Element is leaving viewport
            const rect = entry.boundingClientRect;
            if (rect.top < 0) {
              // Exiting from top
              target.classList.add('exiting-top');
              target.classList.remove('visible');
            } else {
              // Exiting from bottom
              target.classList.remove('visible', 'exiting-top');
            }
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible (fade out starts earlier)
        rootMargin: '-100px 0px 0px 0px' // Start fading 100px before top of viewport
      }
    );

    imageRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [images]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {images.map((image, index) => (
          <button
            key={index}
            ref={(el) => { imageRefs.current[index] = el; }}
            onClick={() => setSelectedImage(index)}
            onMouseEnter={() => setHoveredImage(index)}
            onMouseLeave={() => setHoveredImage(null)}
            onMouseMove={handleMouseMove}
            className="image-item relative aspect-square overflow-hidden bg-gray-900 hover:opacity-90 cursor-pointer"
          >
            <img
              src={image.thumbnailUrl}
              alt={image.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {hoveredImage !== null && (
        <div
          className="fixed pointer-events-none z-40 bg-white px-3 py-2 rounded shadow-lg text-sm font-bold uppercase text-black"
          style={{
            left: `${cursorPosition.x + 15}px`,
            top: `${cursorPosition.y + 15}px`,
          }}
        >
          {images[hoveredImage].title}
        </div>
      )}

      {selectedImage !== null && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-light hover:opacity-70 transition-opacity z-10"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 fade-in duration-300">
            <img
              src={images[selectedImage].fullUrl}
              alt={images[selectedImage].title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-white py-4 px-6 border-t border-gray-200 z-10 animate-in slide-in-from-bottom duration-300">
            <p className="text-sm font-bold text-center text-black">{images[selectedImage].title}</p>
          </div>
        </div>
      )}
    </>
  );
}
