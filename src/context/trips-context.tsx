'use client';

import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { type Trip, type Image as ImageType } from '@/types';

const initialImages: ImageType[] = [
    { id: 1, src: 'https://placehold.co/600x400.png', caption: '@somebody trying to do a headstand here, seconds before chaos', rotation: -3, dataAiHint: "people nature" },
    { id: 2, src: 'https://placehold.co/600x400.png', caption: 'A beautiful landscape', rotation: 5, dataAiHint: "landscape mountains" },
    { id: 3, src: 'https://placehold.co/600x400.png', caption: 'Chai stop', rotation: -2, dataAiHint: "tea cup" },
];

const initialTripData: Omit<Trip, 'id' | 'images'> = {
  date: 'Date',
  name: 'Your trip name',
  description: "Your trip's short story goes here",
  images: [],
  bestMoment: 'Click to start adding some of your best memories.',
  worstMoment: 'Click to start adding some of your worst memories.',
};

const populatedTrip: Trip = {
    id: 1,
    date: 'May 2022',
    name: 'Let\'s head to Himachal and explore the stunning Spiti...',
    description: '"A week of dusty roads, chai, and snowfall mornings. A week of dusty roads, chai, and snowfall mornings."',
    images: initialImages,
    bestMoment: 'Waking up to a blanket of fresh snow outside our window.',
    worstMoment: 'Getting a flat tire in the middle of nowhere.',
}

type TripsContextType = {
  trips: Trip[];
  addTrip: () => void;
  deleteTrip: (id: number) => void;
  updateTrip: (id: number, updates: Partial<Omit<Trip, 'id'>>) => void;
  getTrip: (id: number) => Trip | undefined;
};

export const TripsContext = createContext<TripsContextType>({
  trips: [],
  addTrip: () => {},
  deleteTrip: () => {},
  updateTrip: () => {},
  getTrip: () => undefined,
});

export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>([populatedTrip]);

  const addTrip = useCallback(() => {
    setTrips(current => {
      const newTrip: Trip = {
        ...initialTripData,
        id: Date.now(),
        images: [],
      };
      return [...current, newTrip];
    });
  }, []);

  const deleteTrip = useCallback((id: number) => {
    setTrips(currentTrips => currentTrips.filter(trip => trip.id !== id));
  }, []);

  const updateTrip = useCallback((id: number, updates: Partial<Omit<Trip, 'id'>>) => {
    setTrips(currentTrips =>
      currentTrips.map(trip =>
        trip.id === id ? { ...trip, ...updates } : trip
      )
    );
  }, []);

  const getTrip = useCallback((id: number) => {
    return trips.find(trip => trip.id === id);
  },[trips]);

  return (
    <TripsContext.Provider value={{ trips, addTrip, deleteTrip, updateTrip, getTrip }}>
      {children}
    </TripsContext.Provider>
  );
};