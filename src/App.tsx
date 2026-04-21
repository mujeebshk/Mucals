import { useMemo, useState } from "react";
import AudioList from "./components/AudioList";
import AudioSubmissionForm from "./components/AudioSubmissionForm";
import AuthMenu from "./components/AuthMenu";
import HijriCalendar from "./components/HijriCalendar";
import LocationCard from "./components/LocationCard";
import NotesPanel from "./components/NotesPanel";
import "./App.css";
import audioData from "./data/sampleAudios";
import { useAuth } from "./hooks/useAuth";
import { useLocation } from "./hooks/useLocation";
import { useSavedAudios } from "./hooks/useSavedAudios";
import { useNotes } from "./hooks/useNotes";
import { useTheme } from "./hooks/useTheme";

function App() {
  const [showCalendarView, setShowCalendarView] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const {
    user,
    authLoading,
    authError,
    isFirebaseConfigured,
    signIn,
    signOut,
  } = useAuth();
  const {
    savedAudios,
    audioLoading,
    audioError,
    addSavedAudio,
    removeSavedAudio,
  } = useSavedAudios(user);

  const { notes, notesLoading, notesError, addNote, updateNote, removeNote } =
    useNotes(user);

  const allAudios = useMemo(
    () => [...savedAudios, ...audioData],
    [savedAudios],
  );

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
              onSignIn={signIn}
              onSignOut={signOut}
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
            disabled={!isFirebaseConfigured}
            helperText={
              isFirebaseConfigured
                ? "Your links are saved locally and synced when you sign in."
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
          <NotesPanel
            notes={notes}
            loading={notesLoading}
            error={notesError}
            onAdd={addNote}
            onUpdate={updateNote}
            onDelete={removeNote}
            disabled={!isFirebaseConfigured}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
