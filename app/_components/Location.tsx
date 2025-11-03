"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, Loader } from "lucide-react";
import Input from "./reusable/Input";
import Button from "./reusable/Button";
import { errorToast } from "../_utils/utils";
import { CardSpecificIcons } from "../_utils/icons";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

interface LocationProps {
  onCloseModal?: () => void;
  onLocationSelect: (location: string) => void;
  currentLocation: string;
}

export default function Location({
  onCloseModal,
  onLocationSelect,
  currentLocation,
}: LocationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const formatLocationString = (result: LocationResult): string => {
    const { address, display_name } = result;

    if (!address) {
      // Fallback to display_name if no address object
      return display_name;
    }

    const parts: string[] = [];

    // Add street address (house number + road)
    if (address.house_number && address.road) {
      parts.push(`${address.house_number} ${address.road}`);
    } else if (address.road) {
      parts.push(address.road);
    }

    // Add city (prefer city, then town, then village, then municipality)
    const cityName =
      address.city || address.town || address.village || address.municipality;
    if (cityName) {
      parts.push(cityName);
    }

    // Add country
    if (address.country) {
      parts.push(address.country);
    }

    return parts.length > 0 ? parts.join(", ") : display_name;
  };

  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    // Abort previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    setIsSearching(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`,
        {
          signal: abortControllerRef.current.signal,
          headers: {
            "User-Agent": "TaskFlow App (https://taskflow.app)",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to search locations");
      }

      const data: LocationResult[] = await response.json();
      console.log("Nominatim search results:", data);

      // Filter out duplicates based on multiple criteria
      const uniqueResults = data.filter((result, index, array) => {
        const currentFormatted = formatLocationString(result)
          .toLowerCase()
          .trim();
        const currentDisplayName = result.display_name.toLowerCase().trim();

        return (
          array.findIndex((r) => {
            const otherFormatted = formatLocationString(r).toLowerCase().trim();
            const otherDisplayName = r.display_name.toLowerCase().trim();

            // Consider duplicates if:
            // 1. Formatted strings are identical
            // 2. Display names are identical
            // 3. Same place_id (exact same location)
            return (
              otherFormatted === currentFormatted ||
              otherDisplayName === currentDisplayName ||
              r.place_id === result.place_id
            );
          }) === index
        );
      });

      setSearchResults(uniqueResults);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Location search error:", error);
        errorToast("Failed to search locations. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchLocations]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleLocationSelect = (location: LocationResult) => {
    const formattedLocation = formatLocationString(location);
    onLocationSelect(formattedLocation);
    onCloseModal?.();
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      errorToast("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                "User-Agent": "TaskFlow App (https://taskflow.app)",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to get location details");
          }

          const data = await response.json();
          console.log("Reverse geocoding result:", data);
          const formattedLocation = formatLocationString(data);
          onLocationSelect(formattedLocation);
          onCloseModal?.();
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          errorToast("Failed to get location details. Please try again.");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorToast(
              "Location access denied. Please enable location permissions."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            errorToast("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            errorToast("Location request timed out.");
            break;
          default:
            errorToast("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  return (
    <div className="w-[22rem] sm:w-[26rem] bg-background-700 rounded-2xl py-2 px-4 shadow h-[75vh] overflow-y-auto overflow-x-hidden ">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Select Location</h2>
        <Button
          variant="secondary"
          onClick={onCloseModal}
          className="text-text-gray hover:text-white"
        >
          ×
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="relative">
          <Input
            type="text"
            name="location-search"
            placeholder="Search for an address or place..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <Loader size={16} className="text-text-gray animate-spin" />
            ) : (
              <Search size={16} className="text-text-gray" />
            )}
          </div>
        </div>
      </div>

      {/* Get Current Location Button */}
      <Button
        variant="secondary"
        onClick={getCurrentPosition}
        disabled={isGettingLocation}
        className="w-full mb-1 flex items-center justify-center gap-2"
      >
        {isGettingLocation ? (
          <Loader size={16} className="animate-spin" />
        ) : (
          <MapPin size={16} />
        )}
        {isGettingLocation ? "Getting location..." : "Get my position"}
      </Button>

      {currentLocation && (
        <Button
          variant="secondary"
          type="button"
          onClick={() => onLocationSelect("")}
          className="mb-4 w-full text-center flex items-center justify-center text-text-gray hover:text-white hover:bg-background-500 rounded-full"
        >
          <CardSpecificIcons.ResetLocation
            size={16}
            className="justify-self-end"
          />
          Reset location
        </Button>
      )}

      {/* Current Location Display */}
      {currentLocation && (
        <div className="mb-4 p-3 bg-background-600 rounded-lg">
          <p className="text-sm text-text-gray mb-1">Current location:</p>
          <p className="text-white text-sm break-words">{currentLocation}</p>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto">
          <p className="text-sm text-text-gray mb-2">Search results:</p>
          <div className="space-y-2">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => handleLocationSelect(result)}
                className="w-full p-3 text-left bg-background-600 hover:bg-background-500 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-text-gray mt-0.5 flex-shrink-0"
                  />
                  <p className="text-white text-sm break-words">
                    {formatLocationString(result)}
                  </p>
                </div>
              </button>
            ))}

            {/* Custom location option when there are results */}
            {searchQuery.trim() &&
              !searchResults.some(
                (result) =>
                  formatLocationString(result).toLowerCase().trim() ===
                  searchQuery.toLowerCase().trim()
              ) && (
                <button
                  onClick={() => {
                    onLocationSelect(searchQuery.trim());
                    onCloseModal?.();
                  }}
                  className="w-full p-3 text-left bg-background-600 hover:bg-background-500 rounded-lg transition-colors border border-background-400"
                >
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="text-text-gray mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-white text-sm break-words font-medium">
                        Use &quot;{searchQuery.trim()}&quot;
                      </p>
                      <p className="text-text-gray text-xs mt-1">
                        Use this as a custom location
                      </p>
                    </div>
                  </div>
                </button>
              )}
          </div>
        </div>
      )}

      {/* No Results - Allow Manual Entry */}
      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <p className="text-text-gray mb-3">
              No locations found for &quot;{searchQuery}&quot;
            </p>
          </div>
          <button
            onClick={() => {
              onLocationSelect(searchQuery.trim());
              onCloseModal?.();
            }}
            className="w-full p-3 text-left bg-background-600 hover:bg-background-500 rounded-lg transition-colors border border-background-400"
          >
            <div className="flex items-start gap-2">
              <MapPin
                size={16}
                className="text-text-gray mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-white text-sm break-words font-medium">
                  Use &quot;{searchQuery.trim()}&quot;
                </p>
                <p className="text-text-gray text-xs mt-1">
                  Use this as a custom location
                </p>
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
