'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageStack } from '@/components/image-stack';
import { ImagePreview } from '@/components/image-preview';
import { HashtagGenerator } from '@/components/hashtag-generator';
import { Camera, Upload } from 'lucide-react';

export type Image = {
  id: number;
  src: string;
  caption: string;
  description: string;
  dataAiHint: string;
  rotation: number;
};

const placeholderImages: Omit<Image, 'rotation'>[] = [
  {
    id: 1,
    src: 'https://placehold.co/400x400.png',
    caption: 'Sunrise Mountains',
    description:
      'breathtaking sunrise over a mountain range with misty valleys',
    dataAiHint: 'sunrise mountains',
  },
  {
    id: 2,
    src: 'https://placehold.co/400x400.png',
    caption: 'Ancient Ruins',
    description:
      'exploring ancient stone ruins under a clear blue sky in Greece',
    dataAiHint: 'ancient ruins',
  },
  {
    id: 3,
    src: 'https://placehold.co/400x400.png',
    caption: 'Beach Sunset',
    description: 'a vibrant sunset over a calm tropical beach with palm trees',
    dataAiHint: 'beach sunset',
  },
  {
    id: 4,
    src: 'https://placehold.co/400x400.png',
    caption: 'City Nights',
    description: 'bustling city street at night with neon lights and traffic trails',
    dataAiHint: 'city lights',
  },
  {
    id: 5,
    src: 'https://placehold.co/400x400.png',
    caption: 'Forest Hike',
    description:
      'hiking through a dense, green forest with sunlight filtering through the trees',
    dataAiHint: 'forest hike',
  },
];

export default function Home() {
  const [images, setImages] = useState<Image[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const addImage = () => {
    if (images.length < 5) {
      const newImage = placeholderImages[images.length];
      setImages([
        ...images,
        {
          ...newImage,
          rotation: (Math.random() - 0.5) * 20,
        },
      ]);
    }
  };

  return (
    <div className="bg-background min-h-screen font-body text-foreground/90">
      <main className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="font-headline text-5xl md:text-7xl text-primary">
            Been There, Snapped That
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your visual travel diary.
          </p>
        </header>

        <div className="flex flex-col items-center gap-8 w-full min-h-[400px]">
          {images.length > 0 ? (
            <ImageStack images={images} onStackClick={() => setPreviewOpen(true)} />
          ) : (
            <div className="flex flex-col justify-center items-center text-center p-8 border-2 border-dashed rounded-lg h-64 w-full max-w-md">
              <Camera className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="font-headline text-2xl mb-2">Your story awaits</h2>
              <p className="text-muted-foreground mb-4">
                Click below to add your first memory.
              </p>
            </div>
          )}

          <Button onClick={addImage} disabled={images.length >= 5} size="lg">
            <Upload className="mr-2 h-5 w-5" />
            Add Image ({images.length}/5)
          </Button>
        </div>

        {images.length > 0 && (
          <div className="w-full max-w-3xl mt-16 border-t pt-12">
            <HashtagGenerator
              imageDescriptions={images.map(img => img.description)}
            />
          </div>
        )}
      </main>
      <ImagePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        images={images}
      />
    </div>
  );
}
