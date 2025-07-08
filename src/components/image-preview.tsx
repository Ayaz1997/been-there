"use client";

import { useCallback, useEffect } from 'react';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Polaroid } from './polaroid';
import { type Image } from '@/types';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TWEEN_FACTOR = 1.2;

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
    const newRotation = originalRotation - slideProgress * 15 * TWEEN_FACTOR;
    const scale = 1 - Math.abs(slideProgress) * 0.3;
    const opacity = 1 - Math.abs(slideProgress) * 0.5;
    const zIndex = 100 - Math.abs(Math.round(slideProgress * 100));

    slideNode.style.transform = `scale(${scale}) rotate(${newRotation}deg)`;
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
    loop: images.length > 1,
    align: 'center',
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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
      <DialogContent className="bg-transparent border-none shadow-none max-w-4xl w-full p-0 h-full flex items-center justify-center">
        <div className="relative w-full h-[500px] flex items-center justify-center group">
          <div className="overflow-hidden h-full w-full" ref={emblaRef}>
            <div className="flex items-center h-full" style={{ backfaceVisibility: 'hidden' }}>
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative flex-[0_0_80%] sm:flex-[0_0_70%] md:flex-[0_0_55%] min-w-0 pl-4 flex items-center justify-center"
                  data-rotation={image.rotation}
                >
                  <Polaroid
                    src={image.src}
                    caption={image.caption}
                    dataAiHint={image.dataAiHint}
                    className="shadow-2xl"
                    loading={image.loading}
                  />
                </div>
              ))}
            </div>
          </div>
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollPrev}
                className="absolute left-0 sm:-left-4 top-1/2 -translate-y-1/2 z-[101] text-white bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollNext}
                className="absolute right-0 sm:-right-4 top-1/2 -translate-y-1/2 z-[101] text-white bg-black/30 hover:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
