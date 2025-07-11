'use client';

import { useState, useRef, ChangeEvent, useContext, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Leaf, Award, Rocket, PlusCircle, Smile, Frown, Sparkles, ArrowLeft, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Trip, type Image as ImageType } from '@/types';
import NextImage from 'next/image';
import { EditableText } from '@/components/editable-text';
import { Polaroid } from '@/components/polaroid';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TripsContext, TripsProvider } from '@/context/trips-context';

function TripDetailsPageContent() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { getTrip, updateTrip } = useContext(TripsContext);

  const [trip, setTrip] = useState<Trip | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImage, setNewImage] = useState<{ src: string; caption: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.id) {
        const tripId = parseInt(params.id as string, 10);
        if (!isNaN(tripId)) {
        const foundTrip = getTrip(tripId);
        setTrip(foundTrip);
        }
    }
  }, [params.id, getTrip]);
  
  const handleUpdate = (field: keyof Omit<Trip, 'id' | 'images'>, value: string) => {
    if (trip) {
      const newTrip = { ...trip, [field]: value };
      setTrip(newTrip);
      updateTrip(trip.id, { [field]: value });
    }
  };

  const handleCaptionUpdate = (imageId: number, newCaption: string) => {
    if(trip) {
      const updatedImages = trip.images.map(img => 
        img.id === imageId ? { ...img, caption: newCaption } : img
      );
      const newTrip = {...trip, images: updatedImages};
      setTrip(newTrip);
      updateTrip(trip.id, { images: updatedImages });
    }
  };
  
  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setNewImage({ src: result, caption: "Your awesome caption goes here......" });
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptionSave = () => {
    if (trip && newImage && trip.images.length < 5) {
      const newImageWithId: ImageType = {
        id: Date.now(),
        src: newImage.src,
        caption: newImage.caption,
        rotation: Math.floor(Math.random() * 21) - 10, // -10 to 10
      };
      const updatedImages = [...trip.images, newImageWithId];
      setTrip({ ...trip, images: updatedImages });
      updateTrip(trip.id, { images: updatedImages });
    }
    setIsModalOpen(false);
    setNewImage(null);
  };
  
  if (!trip) {
    return <div>Loading trip...</div>;
  }

  const hasImages = trip.images.length > 0;

  return (
    <div className="bg-background min-h-screen font-body text-foreground flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <Leaf className="text-primary h-6 w-6" />
          <span className="font-headline text-2xl font-semibold">Been there!</span>
        </div>
        <nav className="hidden md:flex items-center gap-4">
          <Button variant="ghost">Travel Stories</Button>
          <Button variant="outline"><Rocket className="mr-2" /> Get Premium</Button>
          <Button><Award className="mr-2" /> Publish</Button>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </nav>
      </header>

      <main className="w-full max-w-4xl mx-auto mt-12 md:mt-20 flex flex-col items-center">
        <EditableText
            initialValue={trip.date}
            onSave={(value) => handleUpdate('date', value)}
            className="text-muted-foreground text-lg"
            inputClassName="text-lg"
        />
        <EditableText
            initialValue={trip.name}
            onSave={(value) => handleUpdate('name', value)}
            className="font-headline text-6xl mt-2 text-center"
            inputClassName="text-6xl"
        />
        <EditableText
            initialValue={trip.description}
            onSave={(value) => handleUpdate('description', value)}
            className="text-muted-foreground mt-4 italic text-center max-w-2xl"
            inputClassName="text-base italic"
        />
        
        <div className="grid md:grid-cols-2 gap-8 w-full mt-12">
            <div className="bg-best-moment text-best-moment-foreground p-6 rounded-2xl">
                <h3 className="font-headline text-2xl flex items-center gap-2"><Smile /> Best moment</h3>
                <EditableText 
                    initialValue={trip.bestMoment}
                    onSave={(value) => handleUpdate('bestMoment', value)}
                    className="mt-2 text-sm"
                    inputClassName="text-sm"
                />
                <p className="text-xs text-best-moment-foreground/70 mt-4 flex items-center gap-1.5"><Users size={14}/> Use "@" to tag your trip buddies to collaborate.</p>
            </div>
            <div className="bg-worst-moment text-worst-moment-foreground p-6 rounded-2xl">
                <h3 className="font-headline text-2xl flex items-center gap-2"><Frown /> Worst moment</h3>
                <EditableText 
                    initialValue={trip.worstMoment}
                    onSave={(value) => handleUpdate('worstMoment', value)}
                    className="mt-2 text-sm"
                    inputClassName="text-sm"
                />
                <p className="text-xs text-worst-moment-foreground/70 mt-4 flex items-center gap-1.5"><Users size={14}/> Use "@" to tag your trip buddies to collaborate.</p>
            </div>
        </div>

        <section className="w-full mt-20 text-center">
            <h2 className="font-headline text-5xl">Moments</h2>
            <p className="text-muted-foreground mt-2">"Some of our best memories at {trip.name}"</p>
            
            <div className="mt-8 relative min-h-[400px] w-full flex flex-row flex-wrap justify-center items-center gap-8 p-4">
                {trip.images.map((image) => (
                    <Polaroid
                        key={image.id}
                        src={image.src}
                        caption={image.caption}
                        style={{ transform: `rotate(${image.rotation}deg)` }}
                        isEditable={true}
                        onCaptionSave={(newCaption) => handleCaptionUpdate(image.id, newCaption)}
                    />
                ))}

                {trip.images.length < 5 && (
                    <div onClick={handleImageUploadClick} className="cursor-pointer">
                        <Polaroid src="" caption='"Your awesome caption goes here......"'>
                            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center bg-gray-50/50 p-4 text-center">
                                <PlusCircle className="h-8 w-8 text-gray-400" />
                                <p className="text-sm text-gray-500 mt-2 font-caption text-lg">"Click to add a photo"</p>
                            </div>
                        </Polaroid>
                    </div>
                )}
            </div>
            
            {hasImages && trip.images.length < 5 && (
                  <p className="text-xs text-muted-foreground mt-4">You can add {5 - trip.images.length} more photos.</p>
             )}
        </section>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add your image</DialogTitle>
                </DialogHeader>
                {newImage && (
                    <div className="flex flex-col items-center">
                        <NextImage
                            src={newImage.src}
                            alt="Preview"
                            width={248}
                            height={248}
                            className="w-full h-auto object-cover aspect-square rounded-sm"
                        />
                        <p className="mt-4 font-caption text-xl text-accent">"{newImage.caption}"</p>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => setIsModalOpen(false)} variant="ghost">Cancel</Button>
                    <Button onClick={handleCaptionSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <footer className="text-center py-16 text-muted-foreground mt-auto w-full">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent my-8"></div>
            <Button variant="link" onClick={() => router.push('/')} className="text-muted-foreground">
                <ArrowLeft size={16} className="mr-2" /> Back to Trips
            </Button>
            <NextImage src="/footer-art.svg" alt="Travel illustration" width={200} height={100} className="mx-auto mt-8" />
            <p className="mt-4 italic">"We travel not to escape life, but for life not to escape us."</p>
            <p className="text-sm mt-2">Made with 💚 at runtime.works 🌍✈️</p>
      </footer>
      </main>
    </div>
  );
}


export default function TripDetailsPage() {
  return (
    <TripsProvider>
      <TripDetailsPageContent />
    </TripsProvider>
  )
}
