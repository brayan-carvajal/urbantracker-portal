"use client";

import React, { createContext, useContext, useState } from 'react';
import { GeocodingFeature } from '@/lib/mapbox-api';

interface SearchContextType {
  selectedPlace: GeocodingFeature | null;
  setSelectedPlace: React.Dispatch<React.SetStateAction<GeocodingFeature | null>>;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [selectedPlace, setSelectedPlace] = useState<GeocodingFeature | null>(null);

  return (
    <SearchContext.Provider value={{ selectedPlace, setSelectedPlace }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearchContext debe usarse dentro de SearchProvider');
  return ctx;
}