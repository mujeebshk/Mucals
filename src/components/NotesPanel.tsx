import { useState } from "react";
import type { Note } from "../services/noteService";

type Props = {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onAdd: (content: string) => Promise<void>;
  onUpdate: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled: boolean;
};

function NotesPanel({
  notes,
  loading,
  error,
  onAdd,
  onUpdate,
  onDelete,
  disabled,
}: Props) {
  const [newNote, setNewNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      await onAdd(newNote);
      setNewNote("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notes-panel">
      <div className="notes-input-group">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={
            disabled
              ? "Firebase not configured..."
              : "Write a new reflection..."
          }
          disabled={disabled || saving}
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled || saving || !newNote.trim()}
          className="auth-dropdown-btn"
        >
          {saving ? "Saving..." : "Save Note"}
        </button>
      </div>

      {error && <p className="auth-dropdown-error">{error}</p>}

      <div className="notes-list">
        {loading ? (
          <p>Loading notes...</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-item">
              <textarea
                defaultValue={note.content}
                onBlur={(e) => {
                  if (e.target.value !== note.content) {
                    onUpdate(note.id, e.target.value);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => onDelete(note.id)}
                className="delete-btn"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="notes-footer">
        <span>{notes.length} notes synced to cloud</span>
      </div>
    </div>
  );
}
export default NotesPanel;
