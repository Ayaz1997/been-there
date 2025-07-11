"use client";

import { Polaroid } from './polaroid';
import { type Image } from '@/types';

type ImageStackProps = {
  images: Image[];
};

export function ImageStack({ images }: ImageStackProps) {
  // Show a maximum of 5 images in the stack
  const visibleImages = images.slice(0, 5);

  return (
    <div
      className="relative w-[320px] h-[320px] flex items-center justify-center group"
      role="button"
      aria-label="Image stack, click to view in gallery"
    >
      {visibleImages.map((image, index) => (
        <div
          key={image.id}
          className="absolute transition-transform duration-300 ease-out group-hover:scale-105"
          style={{
            transform: `translate(-50%, -50%) rotate(${image.rotation}deg) `,
            zIndex: index,
            top: '50%',
            left: '50%',
          }}
        >
          <Polaroid
            src={image.src}
            caption={image.caption}
            dataAiHint={image.dataAiHint}
          />
        </div>
      ))}
    </div>
  );
}
