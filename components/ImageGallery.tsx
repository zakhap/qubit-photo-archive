import Image from 'next/image';

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {images.map((image, index) => (
        <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}
