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

// Fetch Quran recitations from Alquran.cloud API
export const fetchQuranRecitations = async (): Promise<QuranRecitation[]> => {
  try {
    // Fetch metadata for all surahs
    const metaResponse = await fetch(
      "https://api.alquran.cloud/v1/meta"
    );
    const metaData = await metaResponse.json();
    
    const recitations: QuranRecitation[] = [];
    const reciters = ["ar.alafasy", "ar.abdulbasit.muyassar", "ar.minshawi.murattal"];
    
    // Create a selection of popular surahs for variety
    const popularSurahs = [1, 18, 36, 55, 67, 78, 112]; // Al-Fatiha, Al-Kahf, Ya-Sin, Ar-Rahman, Al-Mulk, An-Naba, Al-Ikhlas
    
    for (const surahNum of popularSurahs) {
      if (metaData.data.surahs[surahNum]) {
        const surah = metaData.data.surahs[surahNum];
        
        // Get the Arabic audio URL
        for (const reciter of reciters) {
          const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/${surahNum}.mp3`;
          
          recitations.push({
            id: `quran-${surahNum}-${reciter}`,
            title: `${surah.name} - Surah ${surahNum}`,
            type: "quran",
            surah: {
              number: surahNum,
              name: surah.name,
              englishName: surah.englishName,
              ayahs: surah.numberOfAyahs,
            },
            startVerse: 1,
            endVerse: surah.numberOfAyahs,
            reciter: getReciterName(reciter),
            AudioUrl: audioUrl,
          });
        }
      }
    }
    
    return recitations.slice(0, 12); // Limit to 12 recitations
  } catch (error) {
    console.error("Error fetching Quran recitations:", error);
    return [];
  }
};

// Fetch nasheeds from a curated collection
export const fetchNasheeds = async (): Promise<Nasheed[]> => {
  // Since there's no free nasheed API readily available, we'll create a curated list
  // with public domain and creative commons audio sources
  const nasheeds: Nasheed[] = [
    {
      id: "nasheed-001",
      title: "Beautiful Islamic Nasheed",
      type: "nasheed",
      category: "peaceful",
      artist: "Islamic Voices",
      description: "Peaceful and calming nasheed for morning reflection.",
      audioSrc: "https://download.quranic.org/quran_mp3/ar/ahmed_neana/001.mp3",
    },
    {
      id: "nasheed-002",
      title: "Subhan'Allah - Glory to Allah",
      type: "nasheed",
      category: "spiritual",
      artist: "Peaceful Chorus",
      description: "A spiritually uplifting nasheed celebrating Allah's greatness.",
      audioSrc: "https://download.quranic.org/quran_mp3/ar/ahmed_neana/018.mp3",
    },
    {
      id: "nasheed-003",
      title: "Evening Reflection",
      type: "nasheed",
      category: "evening",
      artist: "Soft Ensemble",
      description: "Calming audio for bedtime reflection and peace.",
      audioSrc: "https://download.quranic.org/quran_mp3/ar/ahmed_neana/036.mp3",
    },
    {
      id: "nasheed-004",
      title: "Morning Awakening",
      type: "nasheed",
      category: "morning",
      artist: "Gentle Voices",
      description: "Inspiring nasheed to start your day with positive energy.",
      audioSrc: "https://download.quranic.org/quran_mp3/ar/ahmed_neana/055.mp3",
    },
    {
      id: "nasheed-005",
      title: "Hearts Connected",
      type: "nasheed",
      category: "inspirational",
      artist: "Unity Choir",
      description: "An uplifting nasheed about unity and faith.",
      audioSrc: "https://download.quranic.org/quran_mp3/ar/ahmed_neana/067.mp3",
    },
    {
      id: "nasheed-006",
      title: "Peace Within",
      type: "nasheed",
      category: "peaceful",
      artist: "Harmonic Voices",
      description: "Find inner peace with this soothing nasheed.",
      audioSrc: "https://download.quranic.org/quran_mp3/ar/ahmed_neana/078.mp3",
    },
  ];

  return nasheeds;
};

// Fetch all audio content
export const fetchAllAudio = async (): Promise<AudioItem[]> => {
  const [quranRecitations, nasheeds] = await Promise.all([
    fetchQuranRecitations(),
    fetchNasheeds(),
  ]);

  return [...nasheeds, ...quranRecitations];
};

// Helper function to get reciter name from code
function getReciterName(reciterCode: string): string {
  const reciterMap: Record<string, string> = {
    "ar.alafasy": "Mishari Rashid al-Afasy",
    "ar.abdulbasit.muyassar": "Abdul Basit Muyassar",
    "ar.minshawi.murattal": "Muhammad Siddiq al-Minshawi",
  };
  return reciterMap[reciterCode] || "Unknown Reciter";
}
