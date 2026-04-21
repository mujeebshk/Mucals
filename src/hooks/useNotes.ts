import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  listNotes,
  createNote,
  updateNoteInFirestore,
  deleteNoteFromFirestore,
  Note,
} from "../services/noteService";

const LOCAL_STORAGE_KEY = "mucals_local_notes";

export function useNotes(user: User | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        setNotes(local ? JSON.parse(local) : []);
        setNotesLoading(false);
        return;
      }

      setNotesLoading(true);
      setNotesError(null);
      try {
        // Sync local notes to Firestore
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const localItems: Note[] = JSON.parse(localData);
          for (const item of localItems) {
            await createNote(user.uid, item.content);
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        const data = await listNotes(user.uid);
        setNotes(data);
      } catch (err: any) {
        console.error("Error loading notes:", err);
        setNotesError("Could not load your notes.");
      } finally {
        setNotesLoading(false);
      }
    };

    void load();
  }, [user]);

  const addNote = async (content: string) => {
    try {
      if (!user) {
        const newNote: Note = {
          id: `local-${Date.now()}`,
          userId: "local",
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const updated = [newNote, ...notes];
        setNotes(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return;
      }

      const newNote = await createNote(user.uid, content);
      setNotes((prev) => [newNote, ...prev]);
    } catch (err: any) {
      console.error("Error creating note:", err);
      setNotesError(err.message || "Failed to save note.");
      throw err;
    }
  };

  const updateNote = async (id: string, content: string) => {
    try {
      if (user && !id.startsWith("local-")) {
        await updateNoteInFirestore(id, content);
      }

      const updated = notes.map((n) =>
        n.id === id ? { ...n, content, updatedAt: new Date() } : n,
      );
      setNotes(updated);

      if (!user || id.startsWith("local-")) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err: any) {
      console.error("Error updating note:", err);
      setNotesError(err.message || "Failed to update note.");
      throw err;
    }
  };

  const removeNote = async (id: string) => {
    try {
      if (user && !id.startsWith("local-")) {
        await deleteNoteFromFirestore(id);
      }
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      if (!user || id.startsWith("local-")) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (err: any) {
      console.error("Error deleting note:", err);
      setNotesError(err.message || "Failed to delete note.");
      throw err;
    }
  };

  return {
    notes,
    notesLoading,
    notesError,
    addNote,
    updateNote,
    removeNote,
  };
}
