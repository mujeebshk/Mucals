import { useEffect, useState } from "react";

type LocationState = {
  loading: boolean;
  message: string;
  latitude?: number;
  longitude?: number;
};

type AddressData = {
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

type WeatherData = {
  current_weather: {
    temperature: number;
  };
};

type Props = {
  location: LocationState;
};

function LocationCard({ location }: Props) {
  const [address, setAddress] = useState<AddressData | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;

    const fetchAddress = async () => {
      setAddressLoading(true);
      setAddressError(null);

      try {
        // Using Nominatim API (OpenStreetMap) for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address");
        }

        const data: AddressData = await response.json();
        setAddress(data);
      } catch (err) {
        setAddressError("Unable to fetch location details");
        console.error("Address fetch error:", err);
      } finally {
        setAddressLoading(false);
      }
    };

    // Add a small delay to avoid overwhelming the API
    const timeoutId = setTimeout(fetchAddress, 1000);

    return () => clearTimeout(timeoutId);
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (!location.latitude || !location.longitude) return;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current_weather=true&temperature_unit=celsius`,
        );

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `Failed to fetch weather (${response.status}): ${body}`,
          );
        }

        const data: WeatherData = await response.json();
        if (!data.current_weather) {
          throw new Error("Weather response missing current weather data");
        }

        setWeather(data);
      } catch (err) {
        console.error("Weather fetch error:", err);
        setWeatherError("Unable to fetch weather.");
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeather();
  }, [location.latitude, location.longitude]);

  const getLocationDisplay = () => {
    if (!address) return null;

    const addr = address.address;

    // Priority order for location display: suburb -> city -> town -> village -> county
    const area =
      addr?.suburb || addr?.city || addr?.town || addr?.village || addr?.county;
    const city = addr?.city || addr?.town || addr?.village;
    const state = addr?.state;

    // Create a clean location string
    const locationParts = [];
    if (area && area !== city) locationParts.push(area);
    if (city) locationParts.push(city);
    if (state) locationParts.push(state);

    const displayLocation =
      locationParts.length > 0
        ? locationParts.join(", ")
        : address.display_name.split(",")[0]?.trim() || "Unknown location";

    const areaOnly =
      area || address.display_name.split(",")[0]?.trim() || "Unknown location";

    return {
      displayLocation,
      areaOnly,
      fullAddress: address.display_name,
    };
  };

  const locationDisplay = getLocationDisplay();

  const openInGoogleMaps = () => {
    if (location.latitude && location.longitude) {
      const url = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="location-card">
      {location.latitude !== undefined && location.longitude !== undefined ? (
        <div className="location-card-top">
          {addressLoading ? (
            <span className="location-loading">Loading location...</span>
          ) : addressError ? (
            <span className="location-error">{addressError}</span>
          ) : (
            locationDisplay && (
              <button
                type="button"
                className="location-pill"
                onClick={openInGoogleMaps}
                title={`Open ${locationDisplay.displayLocation} in Google Maps`}
              >
                <span className="location-full">
                  📍 {locationDisplay.displayLocation}
                </span>
                <span className="location-area">
                  📍 {locationDisplay.areaOnly}
                </span>
              </button>
            )
          )}

          <div className="weather-pill-container">
            {weatherLoading && (
              <span className="weather-pill loading">Loading...</span>
            )}
            {weatherError && <span className="weather-pill error">N/A</span>}
            {weather && !weatherError && (
              <span className="weather-pill">
                {Math.round(weather.current_weather.temperature)}°C
              </span>
            )}
          </div>
        </div>
      ) : null}

      {/* <p className="location-status">{location.message}</p> */}
    </div>
  );
}

export default LocationCard;
