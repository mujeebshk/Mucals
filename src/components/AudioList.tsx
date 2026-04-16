import type {
  AudioItem,
  Nasheed,
  SavedAudioLink,
} from "../data/sampleAudios";
import { getProviderLabel } from "../utils/audioSources";

type Props = {
  audios: AudioItem[];
  onRemoveSavedAudio?: (id: string) => void;
};

function AudioList({ audios, onRemoveSavedAudio }: Props) {
  const isNasheed = (audio: AudioItem): audio is Nasheed =>
    audio.type === "nasheed";
  const isSaved = (audio: AudioItem): audio is SavedAudioLink =>
    audio.type === "saved";

  const getAudioSource = (audio: AudioItem): string => {
    if (audio.type === "quran") {
      return audio.audioUrl;
    }

    if (audio.type === "nasheed") {
      return audio.audioSrc;
    }

    return audio.playableUrl ?? audio.sourceUrl;
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

  if (audios.length === 0) {
    return (
      <div className="audio-empty-state">
        <p>No saved audio sources yet. Add a link above to start building your list.</p>
      </div>
    );
  }

  return (
    <div className="audio-list">
      {audios.map((audio) => (
        <article key={audio.id} className="audio-item">
          <div className="audio-header">
            <div>
              <h3>{audio.title}</h3>
              {isSaved(audio) ? (
                <div className="audio-meta">
                  <span className="audio-artist">{audio.artist}</span>
                  <span className="audio-badge">
                    {getCategoryBadge(audio.category)} {audio.category}
                  </span>
                  <span className="audio-provider-badge">
                    {getProviderLabel(audio.provider)}
                  </span>
                </div>
              ) : isNasheed(audio) ? (
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
                {isSaved(audio)
                  ? audio.description
                  : isNasheed(audio)
                  ? audio.description
                  : `Reciter: ${audio.reciter}`}
              </p>
            </div>
            {isSaved(audio) && onRemoveSavedAudio ? (
              <button
                type="button"
                className="audio-remove-btn"
                onClick={() => onRemoveSavedAudio(audio.id)}
              >
                Remove
              </button>
            ) : null}
          </div>
          {isSaved(audio) ? (
            audio.playbackMode === "audio" && audio.playableUrl ? (
              <audio controls preload="none" src={audio.playableUrl}>
                Your browser does not support the audio element.
              </audio>
            ) : audio.playbackMode === "embed" && audio.playableUrl ? (
              <div className="audio-embed-shell">
                <iframe
                  src={audio.playableUrl}
                  title={audio.title}
                  loading="lazy"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="audio-external-card">
                <p>
                  This source cannot be played with a built-in player, but the
                  link is saved for later.
                </p>
                <a
                  href={audio.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="audio-link-btn"
                >
                  Open Source
                </a>
              </div>
            )
          ) : (
            <audio controls preload="none" src={getAudioSource(audio)}>
              Your browser does not support the audio element.
            </audio>
          )}
        </article>
      ))}
    </div>
  );
}

export default AudioList;
