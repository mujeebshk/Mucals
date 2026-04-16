import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type { SavedAudioLink } from "../data/sampleAudios";
import { db } from "../lib/firebase";
import {
  createSavedAudioLink,
  type CreateSavedAudioInput,
} from "../utils/audioSources";

const COLLECTION_NAME = "savedAudios";

export async function listSavedAudios(userId: string): Promise<SavedAudioLink[]> {
  if (!db) {
    return [];
  }

  const savedAudioQuery = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(savedAudioQuery);

  return snapshot.docs
    .map((entry) => {
      const data = entry.data() as Omit<SavedAudioLink, "id"> & {
        userId: string;
      };

      return {
        id: entry.id,
        title: data.title,
        type: "saved" as const,
        category: data.category,
        artist: data.artist,
        description: data.description,
        sourceUrl: data.sourceUrl,
        provider: data.provider,
        playbackMode: data.playbackMode,
        playableUrl: data.playableUrl,
        savedAt: data.savedAt,
      };
    })
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

export async function createSavedAudioForUser(
  userId: string,
  input: CreateSavedAudioInput,
): Promise<SavedAudioLink> {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const audio = createSavedAudioLink(input);
  const payload = {
    userId,
    title: audio.title,
    type: audio.type,
    category: audio.category,
    artist: audio.artist,
    description: audio.description,
    sourceUrl: audio.sourceUrl,
    provider: audio.provider,
    playbackMode: audio.playbackMode,
    playableUrl: audio.playableUrl,
    savedAt: audio.savedAt,
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

  return {
    ...audio,
    id: docRef.id,
  };
}

export async function deleteSavedAudioForUser(id: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  await deleteDoc(doc(db, COLLECTION_NAME, id));
}
