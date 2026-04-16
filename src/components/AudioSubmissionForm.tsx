import { useState, type FormEvent } from "react";
import type { AudioCategory, SavedAudioLink } from "../data/sampleAudios";
import { createSavedAudioLink } from "../utils/audioSources";

type Props = {
  onAddAudio: (audio: SavedAudioLink) => void;
};

const categories: AudioCategory[] = [
  "peaceful",
  "spiritual",
  "morning",
  "evening",
  "inspirational",
];

function AudioSubmissionForm({ onAddAudio }: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AudioCategory>("peaceful");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setArtist("");
    setDescription("");
    setCategory("peaceful");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !url.trim()) {
      setError("Add a title and source link before saving.");
      setFeedback(null);
      return;
    }

    try {
      const savedAudio = createSavedAudioLink({
        title,
        url,
        category,
        artist,
        description,
      });

      onAddAudio(savedAudio);
      setError(null);
      setFeedback(
        `Saved ${savedAudio.provider} link in ${savedAudio.category} category.`,
      );
      resetForm();
    } catch (submitError) {
      setFeedback(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save this source link.",
      );
    }
  };

  return (
    <form className="audio-submission-form" onSubmit={handleSubmit}>
      <div className="audio-form-copy">
        <h3>Add Your Own Source</h3>
        <p>
          Paste a YouTube, Spotify, Instagram, or direct audio link, choose a
          category, and keep it saved for the next visit.
        </p>
      </div>

      <div className="audio-form-grid">
        <label>
          <span>Title</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Quiet recitation for evening"
          />
        </label>

        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AudioCategory)
            }
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="audio-form-full">
          <span>Source Link</span>
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </label>

        <label>
          <span>Artist or Source</span>
          <input
            type="text"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            placeholder="Optional"
          />
        </label>

        <label>
          <span>Description</span>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional note for later"
          />
        </label>
      </div>

      <div className="audio-form-footer">
        <p>
          Direct audio links play in the built-in player. YouTube, Spotify, and
          Instagram use inline embeds when available.
        </p>
        <button type="submit">Save Source</button>
      </div>

      {feedback ? <p className="audio-form-success">{feedback}</p> : null}
      {error ? <p className="audio-form-error">{error}</p> : null}
    </form>
  );
}

export default AudioSubmissionForm;
