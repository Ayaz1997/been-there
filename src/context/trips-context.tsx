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

// This function now correctly defines what a "fresh start" is: a single, blank trip.
const getInitialTrips = (): Trip[] => {
  const newTrip: Trip = {
    ...initialTripData,
    id: Date.now(),
    images: [],
  };
  return [newTrip];
}


export const TripsProvider = ({ children }: { children: ReactNode }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Effect to set the initial state from localStorage or create a fresh one.
  useEffect(() => {
    if (isBrowser) {
      try {
        const storedTrips = window.localStorage.getItem(TRIPS_STORAGE_KEY);
        if (storedTrips) {
          const parsedTrips = JSON.parse(storedTrips);
          // Restore trips but with empty images array
           const tripsWithEmptyImages = parsedTrips.map((trip: Omit<Trip, 'images'>) => ({
            ...trip,
            images: [],
          }));
          if (tripsWithEmptyImages.length > 0) {
            setTrips(tripsWithEmptyImages);
          } else {
            setTrips(getInitialTrips());
          }
        } else {
          // If nothing is in storage, this is a true fresh start.
          setTrips(getInitialTrips());
        }
      } catch (error) {
        console.error("Failed to parse trips from localStorage, starting fresh.", error);
        setTrips(getInitialTrips());
      }
      setIsInitialized(true);
    }
  }, []);

  // Effect to save any changes back to localStorage
  useEffect(() => {
    // Only save to localStorage if trips have been initialized
    if (isBrowser && isInitialized) {
        // Create a version of the trips without the image data to avoid storage quota issues.
        const tripsToStore = trips.map(({ images, ...trip }) => trip);
        try {
            window.localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(tripsToStore));
        } catch (error) {
            console.error("Failed to save trips to localStorage.", error);
        }
    }
  }, [trips, isInitialized]);

  const addTrip = useCallback(() => {
    setTrips(current => {
      if (current.length >= 5) {
        return current;
      }
      
      const hasBlankTrip = current.some(
        (trip) => trip.name === 'Your trip name'
      );

      if (hasBlankTrip) {
        return current;
      }

      const newTrip: Trip = {
        ...initialTripData,
        id: Date.now(),
        images: [],
      };
      return [...current, newTrip];
    });
  }, []);

  const deleteTrip = useCallback((id: number) => {
    setTrips(currentTrips => {
      const remainingTrips = currentTrips.filter(trip => trip.id !== id);
      if (remainingTrips.length === 0) {
        return getInitialTrips();
      }
      return remainingTrips;
    });
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

  // To prevent rendering children before trips are loaded from localStorage
  if (!isInitialized) {
    return null; // Or a loading spinner
  }

  return (
    <TripsContext.Provider value={{ trips, addTrip, deleteTrip, updateTrip, getTrip }}>
      {children}
    </TripsContext.Provider>
  );
};
