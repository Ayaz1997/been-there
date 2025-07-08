"use client";

import { useCallback, useEffect } from 'react';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Polaroid } from './polaroid';
import { type Image } from '@/types';

const TWEEN_FACTOR = 1.8;

const setTween = (emblaApi: EmblaCarouselType) => {
  const scrollProgress = emblaApi.scrollProgress();

  emblaApi.slideNodes().forEach((slideNode, index) => {
    const slideProgress = emblaApi.scrollSnapList()[index] - scrollProgress;
    
    if (Math.abs(slideProgress) > 2) {
      slideNode.style.opacity = '0';
      slideNode.style.zIndex = '0';
      return;
    }

    const originalRotation = parseFloat(slideNode.dataset.rotation || '0');
    const newRotation = originalRotation + (slideProgress * -1 * 25 * TWEEN_FACTOR);
    const scale = 1 - Math.abs(slideProgress) * 0.4;
    const opacity = 1 - Math.abs(slideProgress) * 0.8;
    const y = Math.abs(slideProgress) * -50;
    const zIndex = 100 - Math.abs(Math.round(slideProgress * 100));

    slideNode.style.transform = `translateY(${y}px) scale(${scale}) rotate(${newRotation}deg)`;
    slideNode.style.opacity = `${opacity}`;
    slideNode.style.zIndex = `${zIndex}`;
  });
};

type ImagePreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Image[];
};

export function ImagePreview({ open, onOpenChange, images }: ImagePreviewProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 2,
    align: 'center',
  });

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setTween(emblaApi);
  }, []);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    setTween(emblaApi);
  }, []);

  useEffect(() => {
    if (!emblaApi || !open) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', onSelect);
    
    emblaApi.slideNodes().forEach((node, i) => {
      if (images[i]) {
        node.dataset.rotation = String(images[i].rotation);
      }
    });

    return () => {
        emblaApi.off('select', onSelect);
        emblaApi.off('scroll', onScroll);
        emblaApi.off('reInit', onSelect);
    }
  }, [emblaApi, open, onSelect, onScroll, images]);

  useEffect(() => {
    if (open) {
      emblaApi?.reInit();
    }
  }, [open, emblaApi])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none max-w-none w-full h-full p-0 flex items-center justify-center">
        <div className="overflow-hidden h-full w-full" ref={emblaRef}>
            <div className="flex items-center h-full" style={{ backfaceVisibility: 'hidden' }}>
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative flex-[0_0_100%] min-w-0 flex items-center justify-center"
                  data-rotation={image.rotation}
                >
                   <div className="w-[300px] h-[380px] flex items-center justify-center">
                    <Polaroid
                        src={image.src}
                        caption={image.caption}
                        dataAiHint={image.dataAiHint}
                        className="shadow-2xl"
                        loading={image.loading}
                    />
                  </div>
                </div>
              ))}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
