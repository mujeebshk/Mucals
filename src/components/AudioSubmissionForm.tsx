import { useState, type FormEvent } from "react";
import type { AudioCategory } from "../data/sampleAudios";
import type { CreateSavedAudioInput } from "../utils/audioSources";

type Props = {
  disabled?: boolean;
  helperText?: string | null;
  onAddAudio: (audio: CreateSavedAudioInput) => Promise<void> | void;
};

const categories: AudioCategory[] = [
  "peaceful",
  "spiritual",
  "morning",
  "evening",
  "inspirational",
];

function AudioSubmissionForm({
  disabled = false,
  helperText = null,
  onAddAudio,
}: Props) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [artist, setArtist] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<AudioCategory>("peaceful");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setTitle("");
    setUrl("");
    setArtist("");
    setDescription("");
    setCategory("peaceful");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !url.trim()) {
      setError("Add a title and source link before saving.");
      setFeedback(null);
      return;
    }

    try {
      setSubmitting(true);
      await onAddAudio({
        title,
        url,
        category,
        artist,
        description,
      });
      setError(null);
      setFeedback(`Saved your source in the ${category} category.`);
      resetForm();
    } catch (submitError) {
      setFeedback(null);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save this source link.",
      );
    } finally {
      setSubmitting(false);
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
            disabled={disabled || submitting}
          />
        </label>

        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AudioCategory)
            }
            disabled={disabled || submitting}
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
            disabled={disabled || submitting}
          />
        </label>

        <label>
          <span>Artist or Source</span>
          <input
            type="text"
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            placeholder="Optional"
            disabled={disabled || submitting}
          />
        </label>

        <label>
          <span>Description</span>
          <input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional note for later"
            disabled={disabled || submitting}
          />
        </label>
      </div>

      <div className="audio-form-footer">
        <p>
          Direct audio links play in the built-in player. YouTube, Spotify, and
          Instagram use inline embeds when available.
        </p>
        <button type="submit" disabled={disabled || submitting}>
          {submitting ? "Saving..." : "Save Source"}
        </button>
      </div>

      {helperText ? <p className="audio-form-helper">{helperText}</p> : null}
      {feedback ? <p className="audio-form-success">{feedback}</p> : null}
      {error ? <p className="audio-form-error">{error}</p> : null}
    </form>
  );
}

export default AudioSubmissionForm;
