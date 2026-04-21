import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import type { SavedAudioLink } from "../data/sampleAudios";
import {
  createSavedAudioForUser,
  deleteSavedAudioForUser,
  listSavedAudios,
} from "../services/savedAudioService";
import type { CreateSavedAudioInput } from "../utils/audioSources";

const LOCAL_STORAGE_KEY = "mucals_local_audios";

export function useSavedAudios(user: User | null) {
  const [savedAudios, setSavedAudios] = useState<SavedAudioLink[]>([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setAudioLoading(false);

      if (!user) {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        setSavedAudios(local ? JSON.parse(local) : []);
        return;
      }

      setAudioLoading(true);
      setAudioError(null);

      try {
        // Sync local storage to Firestore if user just signed in
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const localItems: SavedAudioLink[] = JSON.parse(localData);
          for (const item of localItems) {
            // Use the input format expected by the service
            await createSavedAudioForUser(user.uid, {
              title: item.title,
              url: item.sourceUrl,
              category: item.category,
              artist: item.artist,
              description: item.description,
            });
          }
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        }

        const items = await listSavedAudios(user.uid);
        setSavedAudios(items);
      } catch (error: any) {
        console.error("Error loading saved audios:", error);
        setAudioError(
          error.message || "Could not load saved links from Firestore.",
        );
      } finally {
        setAudioLoading(false);
      }
    };

    void load();
  }, [user]);

  const addSavedAudio = async (input: CreateSavedAudioInput) => {
    if (!user) {
      // Save to local storage if not signed in
      const tempId = `local-${Date.now()}`;
      const newAudio: SavedAudioLink = {
        ...input,
        id: tempId,
        type: "saved",
        sourceUrl: input.url,
        provider: "external", // Default for local
        playbackMode: "external",
        savedAt: new Date().toISOString(),
      };
      const updated = [newAudio, ...savedAudios];
      setSavedAudios(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return;
    }

    const saved = await createSavedAudioForUser(user.uid, input);
    setSavedAudios((current) => [saved, ...current]);
    setAudioError(null);
  };

  const removeSavedAudio = async (id: string) => {
    try {
      if (user) {
        await deleteSavedAudioForUser(id);
      }
      setSavedAudios((current) => current.filter((item) => item.id !== id));
      if (!user) {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(savedAudios.filter((item) => item.id !== id)),
        );
      }
      setAudioError(null);
    } catch (error: any) {
      console.error("Delete failed:", error);
      setAudioError(error.message || "Could not remove this saved link.");
    }
  };

  return {
    savedAudios,
    audioLoading,
    audioError,
    addSavedAudio,
    removeSavedAudio,
  };
}
