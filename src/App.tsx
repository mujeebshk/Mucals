import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import AudioList from "./components/AudioList";
import AudioSubmissionForm from "./components/AudioSubmissionForm";
import AuthMenu from "./components/AuthMenu";
import HijriCalendar from "./components/HijriCalendar";
import LocationCard from "./components/LocationCard";
import NotesPanel from "./components/NotesPanel";
import "./App.css";
import audioData from "./data/sampleAudios";
import type { SavedAudioLink } from "./data/sampleAudios";
import { auth, googleProvider, isFirebaseConfigured } from "./lib/firebase";
import {
  createSavedAudioForUser,
  deleteSavedAudioForUser,
  listSavedAudios,
} from "./services/savedAudioService";
import type { CreateSavedAudioInput } from "./utils/audioSources";

type LocationState = {
  loading: boolean;
  message: string;
  latitude?: number;
  longitude?: number;
};

function App() {
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

  const [savedAudios, setSavedAudios] = useState<SavedAudioLink[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseConfigured);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const allAudios = useMemo(() => [...savedAudios, ...audioData], [savedAudios]);

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

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);

      if (!nextUser) {
        setSavedAudios([]);
        return;
      }

      setAudioLoading(true);
      setAudioError(null);

      try {
        const items = await listSavedAudios(nextUser.uid);
        setSavedAudios(items);
      } catch (error) {
        console.error("Error loading saved audios:", error);
        setAudioError("Could not load saved links from Firestore.");
      } finally {
        setAudioLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const handleSignIn = async () => {
    if (!auth || !googleProvider) {
      setAuthError("Firebase is not configured yet.");
      return;
    }

    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign-in failed:", error);
      setAuthError("Google sign-in did not complete. Please try again.");
    }
  };

  const handleSignOut = async () => {
    if (!auth) {
      return;
    }

    try {
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      console.error("Sign-out failed:", error);
      setAuthError("Could not sign out right now.");
    }
  };

  const addSavedAudio = async (input: CreateSavedAudioInput) => {
    if (!user) {
      throw new Error("Sign in before saving audio links.");
    }

    const saved = await createSavedAudioForUser(user.uid, input);
    setSavedAudios((current) => [saved, ...current]);
  };

  const removeSavedAudio = async (id: string) => {
    try {
      await deleteSavedAudioForUser(id);
      setSavedAudios((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      setAudioError("Could not remove this saved link.");
    }
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div className="hero-header">
          <div className="hero-content">
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
            <AuthMenu
              configured={isFirebaseConfigured}
              loading={authLoading}
              user={user}
              error={authError}
              onSignIn={handleSignIn}
              onSignOut={handleSignOut}
            />
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
              Save your own source links in Firestore and sync them with your
              account.
            </p>
          </div>
          <AudioSubmissionForm
            onAddAudio={addSavedAudio}
            disabled={!user}
            helperText={
              isFirebaseConfigured
                ? user
                  ? "Your saved links are stored in your Firebase account."
                  : "Sign in with Google to save links to your account."
                : "Firebase keys are missing. Add them in .env.local to enable saving."
            }
          />
          {audioError ? (
            <p className="audio-error-message">{audioError}</p>
          ) : null}
          {audioLoading ? (
            <div className="audio-empty-state">
              <p>Loading your saved links...</p>
            </div>
          ) : null}
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
