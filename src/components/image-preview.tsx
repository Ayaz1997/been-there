"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Polaroid } from './polaroid';
import { type Image } from '@/types';

type ImagePreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Image[];
};

export function ImagePreview({ open, onOpenChange, images }: ImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const topCardRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef({
    startX: 0,
    isDragging: false,
  });

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
    }
  }, [open]);

  const handleSwipe = useCallback(() => {
    if (currentIndex < images.length) {
       setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 300);
    }
  }, [currentIndex, images.length]);
  
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (currentIndex >= images.length) return;

    dragInfo.current.startX = e.clientX;
    dragInfo.current.isDragging = true;
    if (topCardRef.current) {
      topCardRef.current.style.transition = 'none';
    }
    // Set pointer capture to ensure events are handled by this element
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [currentIndex, images.length]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current.isDragging || !topCardRef.current) return;
    
    const deltaX = e.clientX - dragInfo.current.startX;
    const rotation = deltaX / 20;
    topCardRef.current.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragInfo.current.isDragging || !topCardRef.current) return;

    dragInfo.current.isDragging = false;
    topCardRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
    
    const deltaX = e.clientX - dragInfo.current.startX;
    const screenWidth = window.innerWidth;

    if (Math.abs(deltaX) > screenWidth / 4) {
      const flyOutX = Math.sign(deltaX) * (screenWidth * 1.2);
      const flyOutRotation = deltaX / 10;
      topCardRef.current.style.transform = `translateX(${flyOutX}px) rotate(${flyOutRotation}deg)`;
      handleSwipe();
    } else {
      topCardRef.current.style.transform = 'translateX(0) rotate(0)';
    }

    // Release pointer capture
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, [handleSwipe]);


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="bg-transparent border-none shadow-none max-w-none w-full h-full p-0 flex items-center justify-center overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        
        <div className="relative w-[300px] h-[380px] flex items-center justify-center">
            {currentIndex >= images.length && (
              <p className="text-white text-2xl font-headline bg-black/50 p-4 rounded-lg">No more photos</p>
            )}
            {images.slice(currentIndex).reverse().slice(0, 5).map((image, index, arr) => {
                const isTopCard = index === arr.length - 1;
                const cardStackIndex = arr.length - 1 - index;

                return (
                <div
                    key={image.id}
                    ref={isTopCard ? topCardRef : null}
                    className="absolute transition-transform duration-300 ease-out"
                    style={{
                        zIndex: images.length - cardStackIndex,
                        transform: isTopCard 
                            ? 'translateX(0) rotate(0)' 
                            : `translateY(${cardStackIndex * -12}px) scale(${1 - cardStackIndex * 0.04}) rotate(${cardStackIndex * (cardStackIndex % 2 === 0 ? 2 : -2)}deg)`,
                        transformOrigin: 'center',
                    }}
                >
                    <div className="w-[300px] h-[380px] flex items-center justify-center">
                        <Polaroid
                            src={image.src}
                            caption={image.caption}
                            className="shadow-2xl"
                        />
                    </div>
                </div>
                );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
