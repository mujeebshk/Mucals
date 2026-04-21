import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Note {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = "notes";

export async function listNotes(userId: string): Promise<Note[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION_NAME),
    where("userId", "==", userId),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        content: data.content,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      };
    })
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function createNote(
  userId: string,
  content: string,
): Promise<Note> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    userId,
    content,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    userId,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function updateNoteInFirestore(
  id: string,
  content: string,
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    content,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNoteFromFirestore(id: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized");
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
