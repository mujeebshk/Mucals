export type AudioItem = {
  id: string;
  title: string;
  artist: string;
  description: string;
  audioSrc: string;
};

const audioData: AudioItem[] = [
  {
    id: "nasheed-001",
    title: "Morning Nasheed Sample",
    artist: "Peaceful Voices",
    description: "A gentle sample to begin your day with calm focus.",
    audioSrc:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  },
  {
    id: "recitation-001",
    title: "Quran Recitation Preview",
    artist: "Recitation Studio",
    description: "A soothing short recitation to help clear the mind.",
    audioSrc:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  },
  {
    id: "nasheed-002",
    title: "Evening Reflection",
    artist: "Soft Ensemble",
    description: "A calm audio track for bedtime reflection.",
    audioSrc:
      "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  },
];

export default audioData;
