import { useEffect, useMemo, useState } from "react";
import AudioList from "./components/AudioList";
import HijriCalendar from "./components/HijriCalendar";
import LocationCard from "./components/LocationCard";
import NotesPanel from "./components/NotesPanel";
import "./App.css";
import audioData from "./data/sampleAudios";
import { fetchAllAudio } from "./services/audioService";
import type { AudioItem } from "./data/sampleAudios";

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
  const [audioLoading, setAudioLoading] = useState(true);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mucals-theme", theme);
  }, [theme]);

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

  // Fetch audio content from APIs
  useEffect(() => {
    const loadAudio = async () => {
      setAudioLoading(true);
      setAudioError(null);
      try {
        const fetchedAudios = await fetchAllAudio();
        if (fetchedAudios.length > 0) {
          setAudios(fetchedAudios);
        } else {
          setAudios(audioData);
        }
      } catch (err) {
        console.error("Error loading audio:", err);
        setAudioError("Could not load online audio. Using sample content.");
        setAudios(audioData);
      } finally {
        setAudioLoading(false);
      }
    };

    loadAudio();
  }, []);

  const toggleTheme = () =>
    setTheme((current) => (current === "light" ? "dark" : "light"));

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
            <p>Choose a peaceful audio to listen without distractions.</p>
          </div>
          {audioError && (
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              ⚠️ {audioError}
            </p>
          )}
          {audioLoading ? (
            <p style={{ color: "var(--muted)" }}>Loading audio content...</p>
          ) : (
            <AudioList audios={audios} />
          )}
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

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("mucals-theme", theme);
  }, [theme]);

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
            <p>Choose a peaceful audio to listen without distractions.</p>
          </div>
          <AudioList audios={audioData} />
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
