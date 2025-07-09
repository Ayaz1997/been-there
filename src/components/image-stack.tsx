"use client";

import { Polaroid } from './polaroid';
import { type Image } from '@/types';

type ImageStackProps = {
  images: Image[];
  onStackClick: () => void;
};

export function ImageStack({ images, onStackClick }: ImageStackProps) {
  return (
    <div
      className="relative w-[320px] h-[400px] mx-auto cursor-pointer group"
      onClick={onStackClick}
      role="button"
      aria-label="Image stack, click to view in gallery"
    >
      {images.map((image, index) => (
        <div
          key={image.id}
          className="absolute top-1/2 left-1/2 transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-2xl"
          style={{
            transform: `translate(-50%, -50%) rotate(${image.rotation}deg)`,
            zIndex: index,
          }}
        >
          <Polaroid
            src={image.src}
            caption={image.caption}
          />
        </div>
      ))}
    </div>
  );
}
