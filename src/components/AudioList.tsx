import type { AudioItem, Nasheed } from "../data/sampleAudios";

type Props = {
  audios: AudioItem[];
};

function AudioList({ audios }: Props) {
  const isNasheed = (audio: AudioItem): audio is Nasheed => audio.type === "nasheed";

  const getAudioSource = (audio: AudioItem): string => {
    return audio.type === "quran" ? audio.AudioUrl : audio.audioSrc;
  };

  const getCategoryBadge = (category: string): string => {
    const badges: Record<string, string> = {
      peaceful: "🕯️",
      spiritual: "✨",
      evening: "🌙",
      morning: "🌅",
      inspirational: "💫",
    };
    return badges[category] || "♫";
  };

  return (
    <div className="audio-list">
      {audios.map((audio) => (
        <article key={audio.id} className="audio-item">
          <div className="audio-header">
            <div>
              <h3>{audio.title}</h3>
              {isNasheed(audio) ? (
                <div className="audio-meta">
                  <span className="audio-artist">{audio.artist}</span>
                  <span className="audio-badge">
                    {getCategoryBadge(audio.category)} {audio.category}
                  </span>
                </div>
              ) : (
                <div className="audio-meta">
                  <span className="audio-surah">
                    📖 {audio.surah.englishName} (Surah {audio.surah.number})
                  </span>
                  <span className="audio-verses">
                    Verses {audio.startVerse}-{audio.endVerse}
                  </span>
                  <span className="audio-reciter">🎤 {audio.reciter}</span>
                </div>
              )}
              <p className="audio-description">
                {isNasheed(audio) ? audio.description : `Reciter: ${audio.reciter}`}
              </p>
            </div>
          </div>
          <audio controls preload="none" src={getAudioSource(audio)}>
            Your browser does not support the audio element.
          </audio>
        </article>
      ))}
    </div>
  );
}

export default AudioList;
