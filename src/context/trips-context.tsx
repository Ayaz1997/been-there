'use client';

import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { type Trip } from '@/types';

const initialTripData: Omit<Trip, 'id' | 'images'> = {
  date: 'Date',
  name: 'Your trip name',
  description: "Your trip's short story goes here",
  bestMoment: 'Click to start adding some of your best memories.',
  worstMoment: 'Click to start adding some of your worst memories.',
};

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

const isBrowser = typeof window !== 'undefined';
const TRIPS_STORAGE_KEY = 'beenthere-trips';

const getInitialTrips = (): Trip[] => {
  const newTrip: Trip = {
    ...initialTripData,
    id: Date.now(),
    images: [],
  };
  return [newTrip];
}


export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    if (!isBrowser) return getInitialTrips();
    try {
      const storedTrips = window.localStorage.getItem(TRIPS_STORAGE_KEY);
      // If nothing is in storage, start with a fresh trip. Otherwise, parse what's there.
      return storedTrips ? JSON.parse(storedTrips) : getInitialTrips();
    } catch (error) {
      console.error("Failed to parse trips from localStorage, starting fresh.", error);
      return getInitialTrips();
    }
  });

  useEffect(() => {
    if (isBrowser) {
        window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
    }
  }, [trips]);

  const addTrip = useCallback(() => {
    setTrips(current => {
      // Prevent adding more than 5 trips total
      if (current.length >= 5) return current;
      
      const hasBlankTrip = current.some(
        (trip) => !trip.name || trip.name === 'Your trip name'
      );
      if(hasBlankTrip) return current;

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

  const getTrip = useCallback((id: number): Trip | undefined => {
    return trips.find(trip => trip.id === id);
  },[trips]);

  return (
    <TripsContext.Provider value={{ trips, addTrip, deleteTrip, updateTrip, getTrip }}>
      {children}
    </TripsContext.Provider>
  );
};
