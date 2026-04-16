import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import type { SavedAudioLink } from "../data/sampleAudios";
import {
  createSavedAudioForUser,
  deleteSavedAudioForUser,
  listSavedAudios,
} from "../services/savedAudioService";
import type { CreateSavedAudioInput } from "../utils/audioSources";

export function useSavedAudios(user: User | null) {
  const [savedAudios, setSavedAudios] = useState<SavedAudioLink[]>([]);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSavedAudios([]);
      setAudioLoading(false);
      return;
    }

    const loadSavedAudios = async () => {
      setAudioLoading(true);
      setAudioError(null);

      try {
        const items = await listSavedAudios(user.uid);
        setSavedAudios(items);
      } catch (error) {
        console.error("Error loading saved audios:", error);
        setAudioError("Could not load saved links from Firestore.");
      } finally {
        setAudioLoading(false);
      }
    };

    void loadSavedAudios();
  }, [user]);

  const addSavedAudio = async (input: CreateSavedAudioInput) => {
    if (!user) {
      throw new Error("Sign in before saving audio links.");
    }

    const saved = await createSavedAudioForUser(user.uid, input);
    setSavedAudios((current) => [saved, ...current]);
    setAudioError(null);
  };

  const removeSavedAudio = async (id: string) => {
    try {
      await deleteSavedAudioForUser(id);
      setSavedAudios((current) => current.filter((item) => item.id !== id));
      setAudioError(null);
    } catch (error) {
      console.error("Delete failed:", error);
      setAudioError("Could not remove this saved link.");
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
