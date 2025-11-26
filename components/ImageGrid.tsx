'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface ImageGridProps {
  images: {
    id: number;
    thumbnailUrl: string;
    fullUrl: string;
    title: string;
  }[];
}

export default function ImageGrid({ images }: ImageGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imageRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Find the selected image by ID
  const selectedImage = selectedImageId !== null
    ? images.find(img => img.id === selectedImageId)
    : null;

  // Initialize from URL parameter on mount
  useEffect(() => {
    const imageParam = searchParams.get('image');
    if (imageParam !== null) {
      const id = parseInt(imageParam, 10);
      if (!isNaN(id) && images.some(img => img.id === id)) {
        setSelectedImageId(id);
      }
    }
  }, [searchParams, images]);

  // Update URL when image selection changes
  const handleSelectImage = (id: number | null) => {
    setSelectedImageId(id);
    if (id !== null) {
      router.replace(`?image=${id}`, { scroll: false });
    } else {
      router.replace(window.location.pathname, { scroll: false });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImageId !== null) {
        handleSelectImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageId]);

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
            onClick={() => handleSelectImage(image.id)}
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

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => handleSelectImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-light hover:opacity-70 transition-opacity z-10"
            onClick={() => handleSelectImage(null)}
          >
            ×
          </button>
          <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 fade-in duration-300">
            <img
              src={selectedImage.fullUrl}
              alt={selectedImage.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-white py-4 px-6 border-t border-gray-200 z-10 animate-in slide-in-from-bottom duration-300">
            <p className="text-sm font-bold text-center text-black">{selectedImage.title}</p>
          </div>
        </div>
      )}
    </>
  );
}
