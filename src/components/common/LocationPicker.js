import React, { useState, useRef, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';
import Input from './Input';

const LocationPicker = ({ label, value, onChange, required = false, error }) => {
  const [location, setLocation] = useState({
    latitude: value?.latitude || '',
    longitude: value?.longitude || '',
    address: value?.address || '',
  });
  const [showMap, setShowMap] = useState(false);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteInstanceRef = useRef(null);

  useEffect(() => {
    // Load Google Maps API script
    if (!window.google && !document.querySelector('script[src*="maps.googleapis.com"]')) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        if (autocompleteRef.current) {
          initAutocomplete();
        }
      };
    } else if (window.google && autocompleteRef.current) {
      initAutocomplete();
    }
  }, []);

  const initAutocomplete = () => {
    if (!window.google || !autocompleteRef.current) return;

    // Clean up existing instance
    if (autocompleteInstanceRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current);
    }

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      { types: ['geocode'] }
    );

    autocompleteInstanceRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const newLocation = {
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          address: place.formatted_address || place.name,
        };
        setLocation(newLocation);
        onChange(newLocation);
      }
    });
  };

  const handleInputChange = (field, value) => {
    const newLocation = { ...location, [field]: value };
    setLocation(newLocation);
    onChange(newLocation);
  };

  const handleMapClick = (e) => {
    if (!mapRef.current || !e.latLng) return;
    
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    
    // Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const newLocation = {
          latitude: lat,
          longitude: lng,
          address: results[0].formatted_address,
        };
        setLocation(newLocation);
        onChange(newLocation);
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition({ lat, lng });
          mapRef.current.setCenter({ lat, lng });
        }
      }
    });
  };

  const openMapPicker = () => {
    if (!window.google) {
      alert('Google Maps API is not loaded. Please check your API key configuration.');
      return;
    }

    setShowMap(true);
    
    // Initialize map after a short delay to ensure DOM is ready
    setTimeout(() => {
      if (!mapRef.current) return;

      const map = new window.google.maps.Map(mapRef.current, {
        center: location.latitude && location.longitude
          ? { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }
          : { lat: 24.7136, lng: 46.6753 }, // Default to Riyadh
        zoom: location.latitude && location.longitude ? 15 : 10,
      });

      // Add click listener
      map.addListener('click', handleMapClick);

      // Add marker if location exists
      if (location.latitude && location.longitude) {
        markerRef.current = new window.google.maps.Marker({
          position: { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) },
          map: map,
          draggable: true,
        });

        markerRef.current.addListener('dragend', (e) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const newLocation = {
                latitude: lat,
                longitude: lng,
                address: results[0].formatted_address,
              };
              setLocation(newLocation);
              onChange(newLocation);
            }
          });
        });
      }

      mapRef.current = map;
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        {/* Address Autocomplete */}
        <div className="relative">
          <input
            ref={autocompleteRef}
            type="text"
            value={location.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Search for a location or click 'Pick on Map'"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required={required}
          />
          <button
            type="button"
            onClick={openMapPicker}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors"
          >
            <MapPinIcon className="w-4 h-4" />
            Pick on Map
          </button>
        </div>

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Input
            label="Latitude"
            type="number"
            step="any"
            value={location.latitude}
            onChange={(e) => handleInputChange('latitude', e.target.value)}
            placeholder="e.g., 24.7136"
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            value={location.longitude}
            onChange={(e) => handleInputChange('longitude', e.target.value)}
            placeholder="e.g., 46.6753"
          />
        </div>

        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Location on Map</h3>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 relative">
              <div ref={mapRef} className="w-full h-full" />
            </div>
            <div className="p-4 border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
