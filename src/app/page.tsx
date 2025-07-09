'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageStack } from '@/components/image-stack';
import { ImagePreview } from '@/components/image-preview';
import { HashtagGenerator } from '@/components/hashtag-generator';
import { Camera, Upload, PlusCircle, Smile, Frown, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Image as ImageType, type Trip } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import NextImage from 'next/image';

const initialNewTripData = {
  name: '',
  date: '',
  description: '',
  bestMoment: '',
  worstMoment: '',
};

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [previewedTrip, setPreviewedTrip] = useState<Trip | null>(null);
  const [isCreateTripOpen, setCreateTripOpen] = useState(false);
  const [newTripData, setNewTripData] = useState(initialNewTripData);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [currentTripId, setCurrentTripId] = useState<number | null>(null);

  const [isCaptionModalOpen, setCaptionModalOpen] = useState(false);
  const [imageToCaption, setImageToCaption] = useState<{ dataUrl: string; tripId: number | null }>({ dataUrl: '', tripId: null });
  const [newCaption, setNewCaption] = useState('');

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
  
  const handleNewTripChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewTripData(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateTrip = () => {
    if (newTripData.name.trim() && trips.length < 3) {
      const newTrip: Trip = {
        id: Date.now(),
        ...newTripData,
        images: [],
      };
      setTrips(prevTrips => [...prevTrips, newTrip]);
      setNewTripData(initialNewTripData);
      setCreateTripOpen(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const capturedTripId = currentTripId;

    if (event.target) {
      event.target.value = '';
    }

    if (!file || capturedTripId === null) {
      setCurrentTripId(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string;
      if (!imageDataUrl) return;
      
      setImageToCaption({ dataUrl: imageDataUrl, tripId: capturedTripId });
      setCaptionModalOpen(true);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSaveImageWithCaption = () => {
    if (!imageToCaption.dataUrl || !newCaption.trim() || imageToCaption.tripId === null) {
      toast({
        title: "Cannot Save",
        description: "Please ensure you have an image and a caption.",
        variant: "destructive",
      });
      return;
    }

    const newImage: ImageType = {
      id: Date.now(),
      src: imageToCaption.dataUrl,
      caption: newCaption,
      rotation: (Math.random() - 0.5) * 20,
    };

    setTrips(prevTrips => prevTrips.map(t => 
      t.id === imageToCaption.tripId ? { ...t, images: [...t.images, newImage] } : t
    ));

    setCaptionModalOpen(false);
    setNewCaption('');
    setImageToCaption({ dataUrl: '', tripId: null });
    setCurrentTripId(null);
  };

  const allImageCaptions = trips.flatMap(trip => trip.images.map(img => img.caption));

  return (
    <div className="bg-background min-h-screen font-body text-foreground/90">
      <main className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center">
        <header className="text-center mb-8 md:mb-16">
          <h1 className="font-headline text-5xl md:text-7xl text-primary">
            Been There, Snapped That
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Your visual travel diary.
          </p>
        </header>

        <div className="w-full max-w-5xl">
          {trips.length === 0 && (
            <div className="text-center p-8">
              <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-headline text-2xl mb-2">Your story awaits</h2>
              <p className="text-muted-foreground mb-4">
                Click below to create your first trip and start your story.
              </p>
              <Button onClick={() => setCreateTripOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Create First Trip
              </Button>
            </div>
          )}

          {trips.length > 0 && (
            <div className="space-y-24">
              {trips.map(trip => (
                <section key={trip.id} className="flex flex-col items-center w-full">
                  <div className="text-center">
                    <p className="text-muted-foreground">{trip.date}</p>
                    <h2 className="font-headline text-5xl md:text-6xl text-primary mt-2">{trip.name}</h2>
                    <p className="text-muted-foreground mt-4 text-lg italic">"{trip.description}"</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 w-full mt-12 text-left">
                    <div className="bg-[hsl(var(--best-moment))] p-6 rounded-2xl text-[hsl(var(--best-moment-foreground))]">
                      <h3 className="font-headline text-2xl flex items-center gap-2">
                        <Smile className="w-7 h-7" />
                        Best moment
                      </h3>
                      <p className="mt-4 opacity-90 whitespace-pre-wrap">{trip.bestMoment}</p>
                    </div>
                    <div className="bg-[hsl(var(--worst-moment))] p-6 rounded-2xl text-[hsl(var(--worst-moment-foreground))]">
                      <h3 className="font-headline text-2xl flex items-center gap-2">
                        <Frown className="w-7 h-7" />
                        Worst moment
                      </h3>
                      <p className="mt-4 opacity-90 whitespace-pre-wrap">{trip.worstMoment}</p>
                    </div>
                  </div>

                  <div className="mt-20 text-center w-full">
                    <h3 className="font-headline text-5xl text-primary">Moments</h3>
                    <p className="text-muted-foreground mt-2 text-lg italic">"Some of our best memories at Himachal"</p>
                    <div className="mt-8 relative flex items-center justify-center min-h-[450px]">
                      {trip.images.length > 0 ? (
                        <ImageStack images={trip.images} onStackClick={() => setPreviewedTrip(trip)} />
                      ) : (
                        <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                          <p>This trip has no photos yet.</p>
                          <p className="text-sm mt-1">Click the button below to add one!</p>
                        </div>
                      )}
                    </div>
                    <Button onClick={() => handleAddImageClick(trip.id)} className="mt-8">
                      <Upload className="mr-2 h-4 w-4" />
                      {`Add Image (${trip.images.length}/5)`}
                    </Button>
                  </div>
                  
                  <div className="mt-16 flex items-center gap-2 text-muted-foreground">
                    <Users className="w-5 h-5" />
                    <p>With @sambit and @ayaz</p>
                  </div>
                </section>
              ))}
            </div>
          )}

          {trips.length > 0 && trips.length < 3 && (
            <div className="text-center mt-24 border-t w-full pt-12">
               <Button onClick={() => setCreateTripOpen(true)} size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Another Trip
              </Button>
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

        {allImageCaptions.length > 0 && (
          <div className="w-full max-w-3xl mt-24 border-t pt-12">
            <HashtagGenerator imageDescriptions={allImageCaptions} />
          </div>
        )}
      </main>
      
      <ImagePreview
        open={!!previewedTrip}
        onOpenChange={(isOpen) => { if (!isOpen) setPreviewedTrip(null); }}
        images={previewedTrip?.images || []}
      />
      
      <Dialog open={isCreateTripOpen} onOpenChange={setCreateTripOpen}>
        <DialogContent className="sm:max-w-[425px] md:sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Create a New Trip</DialogTitle>
            <DialogDescription>
              Tell us about your adventure. Give it a name, a date, and share your favorite memories.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Trip Name</Label>
              <Input id="name" value={newTripData.name} onChange={handleNewTripChange} placeholder="e.g., Spiti, Himachal Pradesh" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" value={newTripData.date} onChange={handleNewTripChange} placeholder="e.g., May 2022" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={newTripData.description} onChange={handleNewTripChange} placeholder="A short, catchy description of your trip." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bestMoment">Best Moment</Label>
              <Textarea id="bestMoment" value={newTripData.bestMoment} onChange={handleNewTripChange} placeholder="What was the highlight of your trip?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="worstMoment">Worst Moment</Label>
              <Textarea id="worstMoment" value={newTripData.worstMoment} onChange={handleNewTripChange} placeholder="Any funny mishaps or challenges?" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCreateTrip} disabled={!newTripData.name.trim() || trips.length >= 3}>Create Trip</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCaptionModalOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setCaptionModalOpen(false);
          setNewCaption('');
          setImageToCaption({ dataUrl: '', tripId: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Caption</DialogTitle>
            <DialogDescription>
              Give your new photo a memorable caption.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              {imageToCaption.dataUrl && (
                  <div className="relative w-full aspect-square rounded-md overflow-hidden">
                      <NextImage src={imageToCaption.dataUrl} alt="Image preview" layout="fill" objectFit="cover" />
                  </div>
              )}
              <Input 
                  placeholder="e.g., A beautiful sunset in paradise..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveImageWithCaption()}
              />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveImageWithCaption} disabled={!newCaption.trim()}>Save Photo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
