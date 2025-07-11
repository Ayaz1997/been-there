'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
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

// Mock data - in a real app, this would be fetched based on the [id]
const mockTrips: Trip[] = [
    {
        id: 1,
        date: 'May 2022',
        name: 'Spiti, Himachal',
        description: '"A week of dusty roads, chai, and snowfall mornings."',
        images: [],
        bestMoment: 'Click to start adding some of your best memories.',
        worstMoment: 'Click to start adding some of your worst memories.',
    },
];


export default function TripDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | undefined>(mockTrips.find(t => t.id.toString() === params.id));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newImage, setNewImage] = useState<{ src: string; caption: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleUpdate = (field: keyof Omit<Trip, 'id' | 'images'>, value: string) => {
    if (trip) {
      setTrip({ ...trip, [field]: value });
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
      setTrip({ ...trip, images: [...trip.images, newImageWithId] });
    }
    setIsModalOpen(false);
    setNewImage(null);
  };
  
  if (!trip) {
    return <div>Trip not found</div>;
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
            
            <div className="mt-8 relative min-h-[400px] w-full flex flex-wrap justify-center items-center gap-8 p-4">
                {trip.images.map((image) => (
                    <Polaroid
                        key={image.id}
                        src={image.src}
                        caption={image.caption}
                        style={{ transform: `rotate(${image.rotation}deg)` }}
                    />
                ))}

                {trip.images.length < 5 && (
                    <div onClick={handleImageUploadClick} className="cursor-pointer">
                        <Polaroid src="" caption="">
                            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-sm flex flex-col items-center justify-center bg-gray-50/50 p-4 text-center">
                                <PlusCircle className="h-8 w-8 text-gray-400" />
                                <p className="text-sm text-gray-500 mt-2 font-caption text-lg">"Your awesome caption goes here......"</p>
                            </div>
                        </Polaroid>
                    </div>
                )}
            </div>
            
            {!hasImages && (
                 <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                    <Sparkles size={16} />
                    Click to upload your photos and add caption. You can add up to 5 images here.
                </div>
            )}
             
             {hasImages && trip.images.length < 5 && (
                  <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5 justify-center"><Users size={14}/> Use "@" to tag your trip buddies to collaborate.</p>
             )}
        </section>

        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Add your caption</DialogTitle>
                </DialogHeader>
                {newImage && (
                    <div className="flex flex-col items-center">
                        <Polaroid
                            src={newImage.src}
                            caption={newImage.caption}
                        >
                            <div className="absolute bottom-5 left-0 right-0 px-4">
                                <EditableText 
                                    initialValue={newImage.caption}
                                    onSave={(value) => setNewImage({...newImage, caption: value})}
                                    className="font-caption text-center text-xl text-accent truncate"
                                    inputClassName="font-caption text-xl"
                                />
                            </div>
                        </Polaroid>
                    </div>
                )}
                <DialogFooter>
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
