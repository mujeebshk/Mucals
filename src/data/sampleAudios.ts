export type AudioCategory =
  | "peaceful"
  | "inspirational"
  | "evening"
  | "morning"
  | "spiritual";

export type AudioProvider =
  | "direct"
  | "youtube"
  | "spotify"
  | "instagram"
  | "external";

export type QuranRecitation = {
  id: string;
  title: string;
  type: "quran";
  surah: {
    number: number;
    name: string;
    englishName: string;
    ayahs: number;
  };
  startVerse: number;
  endVerse: number;
  reciter: string;
  audioUrl: string;
  provider?: AudioProvider;
};

export type Nasheed = {
  id: string;
  title: string;
  type: "nasheed";
  category: AudioCategory;
  artist: string;
  description: string;
  audioSrc: string;
  provider?: AudioProvider;
};

export type SavedAudioLink = {
  id: string;
  title: string;
  type: "saved";
  category: AudioCategory;
  artist: string;
  description: string;
  sourceUrl: string;
  provider: AudioProvider;
  playbackMode: "audio" | "embed" | "external";
  playableUrl?: string;
  savedAt: string;
};

export type AudioItem = QuranRecitation | Nasheed | SavedAudioLink;

const audioData: AudioItem[] = [];

export default audioData;
