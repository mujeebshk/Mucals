import {
  addDoc,
  collection,
  deleteDoc,
  type DocumentData,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import type {
  AudioCategory,
  AudioProvider,
  SavedAudioLink,
} from "../data/sampleAudios";
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
    .flatMap((entry) => {
      const validated = parseSavedAudioDocument(entry.id, entry.data());
      return validated ? [validated] : [];
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

function parseSavedAudioDocument(
  id: string,
  value: DocumentData,
): SavedAudioLink | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const category = asAudioCategory(value.category);
  const provider = asAudioProvider(value.provider);
  const playbackMode = asPlaybackMode(value.playbackMode);

  if (
    value.type !== "saved" ||
    !isNonEmptyString(id) ||
    !isNonEmptyString(value.title) ||
    !category ||
    !isNonEmptyString(value.artist) ||
    !isNonEmptyString(value.description) ||
    !isNonEmptyString(value.sourceUrl) ||
    !provider ||
    !playbackMode ||
    !isNonEmptyString(value.savedAt)
  ) {
    return null;
  }

  if (
    value.playableUrl !== undefined &&
    value.playableUrl !== null &&
    !isNonEmptyString(value.playableUrl)
  ) {
    return null;
  }

  return {
    id,
    title: value.title,
    type: "saved",
    category,
    artist: value.artist,
    description: value.description,
    sourceUrl: value.sourceUrl,
    provider,
    playbackMode,
    playableUrl: value.playableUrl,
    savedAt: value.savedAt,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asAudioCategory(value: unknown): AudioCategory | null {
  const categories: AudioCategory[] = [
    "peaceful",
    "inspirational",
    "evening",
    "morning",
    "spiritual",
  ];

  return typeof value === "string" && categories.includes(value as AudioCategory)
    ? (value as AudioCategory)
    : null;
}

function asAudioProvider(value: unknown): AudioProvider | null {
  const providers: AudioProvider[] = [
    "direct",
    "youtube",
    "spotify",
    "instagram",
    "external",
  ];

  return typeof value === "string" && providers.includes(value as AudioProvider)
    ? (value as AudioProvider)
    : null;
}

function asPlaybackMode(value: unknown): SavedAudioLink["playbackMode"] | null {
  const playbackModes: SavedAudioLink["playbackMode"][] = [
    "audio",
    "embed",
    "external",
  ];

  return typeof value === "string" &&
    playbackModes.includes(value as SavedAudioLink["playbackMode"])
    ? (value as SavedAudioLink["playbackMode"])
    : null;
}
