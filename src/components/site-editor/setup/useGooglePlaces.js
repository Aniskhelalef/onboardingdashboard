'use client';

import { useRef, useState, useCallback } from "react";

export function useGooglePlaces() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const mapsLoaded = useRef(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const placesDiv = useRef(null);
  const searchTimeout = useRef(null);

  const loadMaps = useCallback(() => {
    return new Promise((resolve) => {
      if (window.google?.maps?.places) { resolve(); return; }
      if (mapsLoaded.current) {
        const check = setInterval(() => { if (window.google?.maps?.places) { clearInterval(check); resolve(); } }, 100);
        return;
      }
      mapsLoaded.current = true;
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places&language=fr`;
      script.async = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    try {
      await loadMaps();
      if (!autocompleteService.current) autocompleteService.current = new window.google.maps.places.AutocompleteService();
      if (!placesDiv.current) placesDiv.current = document.createElement("div");
      if (!placesService.current) placesService.current = new window.google.maps.places.PlacesService(placesDiv.current);

      const predictions = await new Promise((resolve) => {
        autocompleteService.current.getPlacePredictions(
          { input: q, types: ["establishment"], componentRestrictions: { country: "fr" } },
          (r) => resolve(r || [])
        );
      });

      const details = await Promise.all(
        predictions.slice(0, 5).map((pred) =>
          new Promise((resolve) => {
            placesService.current.getDetails(
              { placeId: pred.place_id, fields: ["name", "formatted_address", "rating", "user_ratings_total", "place_id"] },
              (place) => resolve(place ? { placeId: place.place_id, name: place.name, address: place.formatted_address, rating: place.rating || null, reviewCount: place.user_ratings_total || 0 } : null)
            );
          })
        )
      );
      setResults(details.filter(Boolean));
    } catch {
      setResults([]);
    }
    setSearching(false);
  }, [loadMaps]);

  const handleQueryChange = useCallback((value) => {
    setQuery(value);
    setSelectedResult(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => search(value), 400);
  }, [search]);

  return { query, results, searching, selectedResult, setSelectedResult, handleQueryChange };
}
