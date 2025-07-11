'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Leaf, Award, Rocket, Copy, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Trip } from '@/types';
import NextImage from 'next/image';
import { EditableText } from '@/components/editable-text';

type TripCardData = {
  id: number;
  date: string;
  name: string;
  description: string;
};

const initialTripData: TripCardData = {
  id: Date.now(),
  date: 'Date',
  name: 'Your trip name',
  description: "Your trip's short story goes here",
};

export default function Home() {
  const { toast } = useToast();
  const [trips, setTrips] = useState<TripCardData[]>([initialTripData]);

  const handleUpdateTrip = (id: number, field: keyof Omit<TripCardData, 'id'>, value: string) => {
    setTrips(currentTrips =>
      currentTrips.map(trip =>
        trip.id === id ? { ...trip, [field]: value } : trip
      )
    );
  };

  const addNextTrip = () => {
    if (trips.length < 3) {
      setTrips(current => [...current, { ...initialTripData, id: Date.now() }]);
    } else {
      toast({
        title: "Maximum trips reached",
        description: "You can only create up to 3 trips for now.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    const link = 'https://beenthere.page/sourav';
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Your profile link is now on your clipboard.',
    });
  };

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

      <main className="flex flex-col items-center w-full max-w-4xl mx-auto mt-12 md:mt-20">
        <div className="bg-green-100/50 p-8 rounded-3xl shadow-sm w-full max-w-md">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Sourav" data-ai-hint="profile person" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <h1 className="font-headline text-5xl mt-4">Sourav</h1>
            <p className="text-muted-foreground mt-2 italic">"Riding to places, pausing for chai, and writing down the in-betweens."</p>
            <div className="mt-6 w-full flex items-center justify-between bg-white/70 rounded-lg p-2 pl-4 shadow-inner-sm">
              <span className="text-sm text-muted-foreground truncate">https://beenthere.page/sourav</span>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <section className="text-center mt-20">
          <h2 className="font-headline text-5xl md:text-6xl">Your Journey, Your Story</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Share your adventures, and relive every moment with photos, stories, and custom galleries
          </p>
        </section>

        <section className="mt-16 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onUpdate={handleUpdateTrip} />
            ))}
            {trips.length < 3 && (
               <div
                  onClick={addNextTrip}
                  className="flex flex-col items-center justify-center bg-green-100/50 p-8 rounded-3xl shadow-sm border-2 border-dashed border-primary/20 cursor-pointer hover:bg-green-100 transition-colors group"
                >
                  <PlusCircle className="h-12 w-12 text-primary/50 group-hover:text-primary transition-colors" />
                  <p className="mt-4 font-headline text-lg text-primary/80 group-hover:text-primary">Create Next Trip</p>
                </div>
            )}
          </div>
        </section>
      </main>
      
      <footer className="text-center py-16 text-muted-foreground mt-auto">
        <NextImage src="/footer-art.svg" alt="Travel illustration" width={200} height={100} className="mx-auto" />
        <p className="mt-4 italic">"We travel not to escape life, but for life not to escape us."</p>
        <p className="text-sm mt-2">Made with 💚 at runtime.works 🌍✈️</p>
      </footer>
    </div>
  );
}


function TripCard({ trip, onUpdate }: { trip: TripCardData; onUpdate: (id: number, field: keyof Omit<TripCardData, 'id'>, value: string) => void }) {
  return (
    <div className="bg-green-100/50 p-8 rounded-3xl shadow-sm flex flex-col items-center text-center cursor-pointer hover:ring-2 hover:ring-primary/50 transition-shadow duration-300">
      <div className="w-[200px] h-[200px] bg-white p-3 shadow-md rounded-sm border flex items-center justify-center">
        <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-sm flex items-center justify-center">
          <PlusCircle className="h-8 w-8 text-gray-300" />
        </div>
      </div>
      <div className="mt-6 w-full">
        <EditableText
          initialValue={trip.date}
          onSave={(value) => onUpdate(trip.id, 'date', value)}
          className="text-muted-foreground text-sm"
          inputClassName="text-sm"
        />
        <EditableText
          initialValue={trip.name}
          onSave={(value) => onUpdate(trip.id, 'name', value)}
          className="font-headline text-3xl mt-2"
          inputClassName="text-3xl"
        />
        <EditableText
          initialValue={trip.description}
          onSave={(value) => onUpdate(trip.id, 'description', value)}
          className="text-muted-foreground mt-1 italic"
          inputClassName="text-base italic"
        />
      </div>
    </div>
  );
}
