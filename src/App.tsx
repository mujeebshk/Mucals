import { useEffect, useMemo, useState } from "react";
import AudioList from "./components/AudioList";
import AudioSubmissionForm from "./components/AudioSubmissionForm";
import HijriCalendar from "./components/HijriCalendar";
import LocationCard from "./components/LocationCard";
import NotesPanel from "./components/NotesPanel";
import "./App.css";
import audioData from "./data/sampleAudios";
import type { AudioItem, SavedAudioLink } from "./data/sampleAudios";
import {
  loadSavedAudioLinks,
  saveSavedAudioLinks,
} from "./utils/audioSources";

type LocationState = {
  loading: boolean;
  message: string;
  latitude?: number;
  longitude?: number;
};

function App() {
  const today = useMemo(() => new Date(), []);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    return (
      (window.localStorage.getItem("mucals-theme") as "light" | "dark") ??
      "light"
    );
  });

  const [location, setLocation] = useState<LocationState>({
    loading: true,
    message: "Detecting location...",
  });

  const [showCalendarView, setShowCalendarView] = useState(false);

  const [audios, setAudios] = useState<AudioItem[]>(audioData);
  const [savedAudios, setSavedAudios] = useState<SavedAudioLink[]>(() =>
    loadSavedAudioLinks(),
  );

  const allAudios = useMemo(
    () => [...savedAudios, ...audios],
    [audios, savedAudios],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mucals-theme", theme);
  }, [theme]);

  useEffect(() => {
    saveSavedAudioLinks(savedAudios);
  }, [savedAudios]);

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
      } catch (err) {
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
      fallbackToIpLocation();
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
        fallbackToIpLocation();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  }, []);

  const toggleTheme = () =>
    setTheme((current) => (current === "light" ? "dark" : "light"));

  const addSavedAudio = (audio: SavedAudioLink) => {
    setSavedAudios((current) => [audio, ...current]);
  };

  const removeSavedAudio = (id: string) => {
    setSavedAudios((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-header">
          <div>
            <p className="eyebrow">Mucals</p>
            <h1>
              Leave music behind. Listen to nasheeds and Quran recitations.
            </h1>
            <p className="hero-copy">
              A responsive dashboard for mobile and desktop with audio, Hijri
              date history, location-aware tracking, and distraction-free notes.
            </p>
          </div>
          <div className="hero-actions">
            <LocationCard location={location} />
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "light"
                  ? "Switch to dark mode"
                  : "Switch to light mode"
              }
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="dashboard-card overview-card">
          <h2>Daily calm</h2>
        </section>

        <section className="dashboard-card audio-card">
          <div className="card-header">
            <h2>Nasheeds & Recitations</h2>
            <p>
              Save your own source links with categories and reuse them next
              time.
            </p>
          </div>
          <AudioSubmissionForm onAddAudio={addSavedAudio} />
          <AudioList audios={allAudios} onRemoveSavedAudio={removeSavedAudio} />
        </section>

        <section className="dashboard-card calendar-card">
          <div className="card-header">
            <div>
              <h2>Hijri Calendar History</h2>
              <p>
                Follow the day-by-day Hijri record and stay connected to the
                month.
              </p>
            </div>
            <button
              type="button"
              className={`calendar-icon-btn ${showCalendarView ? "active" : ""}`}
              onClick={() => setShowCalendarView(!showCalendarView)}
              title="Toggle calendar view"
            >
              {showCalendarView ? "📅" : "📆"}
            </button>
          </div>
          <HijriCalendar
            location={location}
            showCalendarView={showCalendarView}
            setShowCalendarView={setShowCalendarView}
          />
        </section>

        <section className="dashboard-card notes-card">
          <div className="card-header">
            <h2>Quiet Notes</h2>
            <p>Write anything you want in a distraction-free space.</p>
          </div>
          <NotesPanel />
        </section>
      </main>
    </div>
  );
}

export default App;
