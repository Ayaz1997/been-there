'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ImageStack } from '@/components/image-stack';
import { ImagePreview } from '@/components/image-preview';
import { HashtagGenerator } from '@/components/hashtag-generator';
import { Camera, Upload } from 'lucide-react';
import { describeImage } from '@/ai/flows/describe-image';
import { useToast } from '@/hooks/use-toast';

export type Image = {
  id: number;
  src: string;
  caption: string;
  description: string;
  dataAiHint: string;
  rotation: number;
  loading?: boolean;
};

export default function Home() {
  const [images, setImages] = useState<Image[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && images.length < 5) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        if (!imageDataUrl) return;

        const imageId = Date.now();
        const newImage: Image = {
          id: imageId,
          src: imageDataUrl,
          caption: 'Analyzing...',
          description: 'AI is generating a description for your image.',
          dataAiHint: '',
          rotation: (Math.random() - 0.5) * 20,
          loading: true,
        };
        setImages((prevImages) => [...prevImages, newImage]);

        startTransition(async () => {
          try {
            const result = await describeImage({ photoDataUri: imageDataUrl });
            setImages((prevImages) =>
              prevImages.map((img) =>
                img.id === imageId
                  ? { ...img, ...result, loading: false }
                  : img
              )
            );
          } catch (error) {
            console.error('Failed to describe image:', error);
            setImages((prevImages) => prevImages.filter((img) => img.id !== imageId));
            toast({
              title: 'Error Analyzing Image',
              description:
                "We couldn't generate a description for your image. Please try a different one.",
              variant: 'destructive',
            });
          }
        });
      };
      reader.readAsDataURL(file);
      if (event.target) {
        event.target.value = '';
      }
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

          <Button onClick={handleAddImageClick} disabled={images.length >= 5 || isProcessing} size="lg">
            <Upload className="mr-2 h-5 w-5" />
            {isProcessing ? 'Processing Image...' : `Add Image (${images.length}/5)`}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        {images.length > 0 && (
          <div className="w-full max-w-3xl mt-16 border-t pt-12">
            <HashtagGenerator
              imageDescriptions={images.filter(img => !img.loading).map(img => img.description)}
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
