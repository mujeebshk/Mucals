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
  AudioUrl: string;
};

export type Nasheed = {
  id: string;
  title: string;
  type: "nasheed";
  category: "peaceful" | "inspirational" | "evening" | "morning" | "spiritual";
  artist: string;
  description: string;
  audioSrc: string;
};

export type AudioItem = QuranRecitation | Nasheed;

const audioData: AudioItem[] = [
  {
    id: "nasheed-001",
    title: "Beautiful Islamic Nasheed",
    type: "nasheed",
    category: "peaceful",
    artist: "Islamic Voices",
    description: "Peaceful and calming nasheed for daily reflection.",
    audioSrc:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  },
  {
    id: "nasheed-002",
    title: "Subhan'Allah - Glory to Allah",
    type: "nasheed",
    category: "spiritual",
    artist: "Peaceful Chorus",
    description: "A spiritually uplifting nasheed celebrating Allah's greatness.",
    audioSrc:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  },
  {
    id: "quran-001",
    title: "Al-Fatiha - Surah 1",
    type: "quran",
    surah: {
      number: 1,
      name: "الفاتحة",
      englishName: "Al-Fatiha",
      ayahs: 7,
    },
    startVerse: 1,
    endVerse: 7,
    reciter: "Mishari Rashid al-Afasy",
    AudioUrl:
      "https://cdn.islamic.network/quran/audio/128/ar.alafasy/001.mp3",
  },
];

export default audioData;
