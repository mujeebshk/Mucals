import { useEffect, useState } from "react";

export type LocationState = {
  loading: boolean;
  message: string;
  latitude?: number;
  longitude?: number;
};

const DEFAULT_LOCATION_STATE: LocationState = {
  loading: true,
  message: "Detecting location...",
};

export function useLocation() {
  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION_STATE);

  useEffect(() => {
    const fallbackToIpLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) {
          throw new Error("No IP location available");
        }

        const data = await response.json();
        setLocation({
          loading: false,
          message: "Approximate location detected from IP.",
          latitude: data.latitude,
          longitude: data.longitude,
        });
      } catch {
        setLocation({
          loading: false,
          message: "Unable to fetch location at this time.",
        });
      }
    };

    if (!navigator.geolocation) {
      setLocation({
        loading: false,
        message: "Geolocation is not supported by this browser.",
      });
      void fallbackToIpLocation();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          loading: false,
          message: "Location detected.",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("GPS location failed:", error.message);
        void fallbackToIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }, []);

  return location;
}
