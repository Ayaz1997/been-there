"use client";

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Polaroid } from './polaroid';
import { type Image } from '@/app/page';

type ImagePreviewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Image[];
};

export function ImagePreview({ open, onOpenChange, images }: ImagePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-none shadow-none max-w-4xl w-full p-0 h-full flex items-center justify-center">
        <Carousel className="w-full max-w-xs sm:max-w-sm"
          opts={{
            loop: images.length > 1,
          }}
        >
          <CarouselContent>
            {images.map((image) => (
              <CarouselItem key={image.id}>
                <div className="p-1 flex justify-center">
                    <Polaroid
                      src={image.src}
                      caption={image.caption}
                      dataAiHint={image.dataAiHint}
                      className="shadow-2xl"
                      loading={image.loading}
                    />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {images.length > 1 && <>
            <CarouselPrevious className="left-[-50px] text-white bg-black/30 hover:bg-black/50 border-none" />
            <CarouselNext className="right-[-50px] text-white bg-black/30 hover:bg-black/50 border-none" />
          </>}
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}
