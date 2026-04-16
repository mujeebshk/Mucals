import type {
  AudioCategory,
  AudioProvider,
  SavedAudioLink,
} from "../data/sampleAudios";

export const SAVED_AUDIO_STORAGE_KEY = "mucals-saved-audio-links";

export type CreateSavedAudioInput = {
  title: string;
  url: string;
  category: AudioCategory;
  artist?: string;
  description?: string;
};

type ResolvedSource = {
  provider: AudioProvider;
  playbackMode: SavedAudioLink["playbackMode"];
  playableUrl?: string;
};

export function parseSavedAudioUrl(rawUrl: string): ResolvedSource {
  const trimmed = rawUrl.trim();

  try {
    const parsed = new URL(trimmed);

    if (isDirectAudioUrl(parsed)) {
      return {
        provider: "direct",
        playbackMode: "audio",
        playableUrl: parsed.toString(),
      };
    }

    const youtubeId = getYoutubeId(parsed);
    if (youtubeId) {
      return {
        provider: "youtube",
        playbackMode: "embed",
        playableUrl: `https://www.youtube.com/embed/${youtubeId}`,
      };
    }

    const spotifyEmbedUrl = getSpotifyEmbedUrl(parsed);
    if (spotifyEmbedUrl) {
      return {
        provider: "spotify",
        playbackMode: "embed",
        playableUrl: spotifyEmbedUrl,
      };
    }

    const instagramEmbedUrl = getInstagramEmbedUrl(parsed);
    if (instagramEmbedUrl) {
      return {
        provider: "instagram",
        playbackMode: "embed",
        playableUrl: instagramEmbedUrl,
      };
    }

    return {
      provider: "external",
      playbackMode: "external",
    };
  } catch {
    throw new Error("Enter a valid audio link.");
  }
}

export function createSavedAudioLink(
  input: CreateSavedAudioInput,
): SavedAudioLink {
  const resolved = parseSavedAudioUrl(input.url);

  return {
    id: `saved-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim(),
    type: "saved",
    category: input.category,
    artist: input.artist?.trim() || getDefaultArtistLabel(resolved.provider),
    description:
      input.description?.trim() ||
      getDefaultDescription(resolved.provider, resolved.playbackMode),
    sourceUrl: input.url.trim(),
    provider: resolved.provider,
    playbackMode: resolved.playbackMode,
    playableUrl: resolved.playableUrl,
    savedAt: new Date().toISOString(),
  };
}

export function loadSavedAudioLinks(): SavedAudioLink[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(SAVED_AUDIO_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isSavedAudioLinkShape);
  } catch {
    return [];
  }
}

export function saveSavedAudioLinks(items: SavedAudioLink[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SAVED_AUDIO_STORAGE_KEY, JSON.stringify(items));
}

export function getProviderLabel(provider: AudioProvider): string {
  const labels: Record<AudioProvider, string> = {
    direct: "Direct Audio",
    youtube: "YouTube",
    spotify: "Spotify",
    instagram: "Instagram",
    external: "External Link",
  };

  return labels[provider];
}

function isDirectAudioUrl(url: URL): boolean {
  return /\.(mp3|wav|ogg|m4a|aac|flac)(?:$|[?#])/i.test(url.pathname);
}

function getYoutubeId(url: URL): string | null {
  if (url.hostname.includes("youtu.be")) {
    return url.pathname.split("/").filter(Boolean)[0] || null;
  }

  if (!url.hostname.includes("youtube.com")) {
    return null;
  }

  if (url.pathname === "/watch") {
    return url.searchParams.get("v");
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments[0] === "shorts" || segments[0] === "embed") {
    return segments[1] || null;
  }

  return null;
}

function getSpotifyEmbedUrl(url: URL): string | null {
  if (!url.hostname.includes("spotify.com")) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const contentType = segments[0];
  const contentId = segments[1];

  if (
    !contentId ||
    !["track", "album", "playlist", "episode", "show"].includes(contentType)
  ) {
    return null;
  }

  return `https://open.spotify.com/embed/${contentType}/${contentId}`;
}

function getInstagramEmbedUrl(url: URL): string | null {
  if (!url.hostname.includes("instagram.com")) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const contentType = segments[0];
  const contentId = segments[1];

  if (!contentId || !["reel", "p", "tv"].includes(contentType)) {
    return null;
  }

  return `https://www.instagram.com/${contentType}/${contentId}/embed/captioned`;
}

function getDefaultArtistLabel(provider: AudioProvider): string {
  switch (provider) {
    case "youtube":
      return "YouTube source";
    case "spotify":
      return "Spotify source";
    case "instagram":
      return "Instagram source";
    case "direct":
      return "Direct audio source";
    case "external":
      return "Saved external source";
  }
}

function getDefaultDescription(
  provider: AudioProvider,
  playbackMode: SavedAudioLink["playbackMode"],
): string {
  if (playbackMode === "audio") {
    return `Saved ${getProviderLabel(provider).toLowerCase()} for in-app playback.`;
  }

  if (playbackMode === "embed") {
    return `Saved ${getProviderLabel(provider).toLowerCase()} for inline embed playback.`;
  }

  return `Saved ${getProviderLabel(provider).toLowerCase()} for quick access later.`;
}

function isSavedAudioLinkShape(value: unknown): value is SavedAudioLink {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<SavedAudioLink>;
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    item.type === "saved" &&
    typeof item.category === "string" &&
    typeof item.artist === "string" &&
    typeof item.description === "string" &&
    typeof item.sourceUrl === "string" &&
    typeof item.provider === "string" &&
    typeof item.playbackMode === "string" &&
    typeof item.savedAt === "string"
  );
}
