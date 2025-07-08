'use client';

import { useState, useRef, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ImageStack } from '@/components/image-stack';
import { ImagePreview } from '@/components/image-preview';
import { HashtagGenerator } from '@/components/hashtag-generator';
import { Camera, Upload, PlusCircle } from 'lucide-react';
import { describeImage } from '@/ai/flows/describe-image';
import { useToast } from '@/hooks/use-toast';
import { type Image, type Trip } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [previewedTrip, setPreviewedTrip] = useState<Trip | null>(null);
  const [isCreateTripOpen, setCreateTripOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  const handleAddImageClick = (tripId: number) => {
    const trip = trips.find(t => t.id === tripId);
    if (trip && trip.images.length >= 5) {
      toast({
        title: "Trip Full",
        description: "You can only add 5 images per trip.",
        variant: "destructive",
      });
      return;
    }
    setCurrentTripId(tripId);
    fileInputRef.current?.click();
  };
  
  const handleCreateTrip = () => {
    if (newTripName.trim() && trips.length < 3) {
      const newTrip: Trip = {
        id: Date.now(),
        name: newTripName,
        images: [],
      };
      setTrips(prevTrips => [...prevTrips, newTrip]);
      setNewTripName('');
      setCreateTripOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentTripId !== null) {
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
        
        setTrips(prevTrips => prevTrips.map(t => 
          t.id === currentTripId ? { ...t, images: [...t.images, newImage] } : t
        ));

        startTransition(async () => {
          try {
            const result = await describeImage({ photoDataUri: imageDataUrl });
            setTrips(prevTrips => prevTrips.map(t => {
              if (t.id === currentTripId) {
                return {
                  ...t,
                  images: t.images.map(img => 
                    img.id === imageId ? { ...img, ...result, loading: false } : img
                  )
                }
              }
              return t;
            }));
          } catch (error) {
            console.error('Failed to describe image:', error);
            setTrips(prevTrips => prevTrips.map(t => {
              if (t.id === currentTripId) {
                return { ...t, images: t.images.filter(img => img.id !== imageId) }
              }
              return t;
            }));
            toast({
              title: 'Error Analyzing Image',
              description: "We couldn't generate a description for your image. Please try a different one.",
              variant: 'destructive',
            });
          }
        });
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
      event.target.value = '';
    }
    setCurrentTripId(null);
  };
  
  const allImageDescriptions = trips.flatMap(trip => trip.images.filter(img => !img.loading).map(img => img.description));

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

        <div className="w-full max-w-5xl">
          {trips.length === 0 && (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-headline text-2xl mb-2">Your story awaits</h2>
              <p className="text-muted-foreground mb-4">
                Click below to create your first trip.
              </p>
              <Button onClick={() => setCreateTripOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create First Trip
              </Button>
            </div>
          )}

          {trips.length > 0 && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
               {trips.map(trip => (
                  <Card key={trip.id} className="flex flex-col">
                    <CardHeader>
                      <CardTitle className="font-headline text-3xl text-primary truncate">{trip.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center flex-grow">
                      <div className="flex-grow flex items-center min-h-[400px]">
                        {trip.images.length > 0 ? (
                           <ImageStack images={trip.images} onStackClick={() => setPreviewedTrip(trip)} />
                        ) : (
                          <div className="text-center text-muted-foreground p-4">
                            <p>This trip has no photos yet.</p>
                             <p className="text-sm">Click below to add one!</p>
                          </div>
                        )}
                      </div>
                      <Button onClick={() => handleAddImageClick(trip.id)} disabled={isProcessing} size="sm" className="mt-4 w-full">
                         <Upload className="mr-2 h-4 w-4" />
                         {isProcessing && currentTripId === trip.id ? 'Processing...' : `Add Image (${trip.images.length}/5)`}
                      </Button>
                    </CardContent>
                  </Card>
               ))}
                {trips.length < 3 && (
                  <button
                    onClick={() => setCreateTripOpen(true)}
                    className="border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-accent/50 hover:border-primary/50 transition-colors min-h-[400px]"
                  >
                    <PlusCircle className="w-12 h-12 mb-2" />
                    <span className="font-headline text-xl">Create New Trip</span>
                  </button>
                )}
             </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {allImageDescriptions.length > 0 && (
          <div className="w-full max-w-3xl mt-16 border-t pt-12">
            <HashtagGenerator
              imageDescriptions={allImageDescriptions}
            />
          </div>
        )}
      </main>
      
      <ImagePreview
        open={!!previewedTrip}
        onOpenChange={(isOpen) => { if (!isOpen) setPreviewedTrip(null); }}
        images={previewedTrip?.images || []}
      />
      
      <Dialog open={isCreateTripOpen} onOpenChange={setCreateTripOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your New Trip</DialogTitle>
            <DialogDescription>
              Give your new collection of photos a name. Max 3 trips allowed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input 
              placeholder="e.g., Summer in Italy"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTrip()}
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateTrip} disabled={!newTripName.trim() || trips.length >= 3}>Create Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
