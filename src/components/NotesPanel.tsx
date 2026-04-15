import { useEffect, useState } from "react";

function NotesPanel() {
  const storageKey = "mucals-notes";
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setNotes(saved);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, notes);
  }, [notes]);

  return (
    <div className="notes-panel">
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Write your thoughts, reminders, or reflections without distraction..."
      />
      <div className="notes-footer">
        <span>
          {notes.trim().split("\n").filter(Boolean).length} lines saved
        </span>
        <span>{notes.length} characters</span>
      </div>
    </div>
  );
}

export default NotesPanel;
