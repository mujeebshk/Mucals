import type { AudioItem } from "../data/sampleAudios";

type Props = {
  audios: AudioItem[];
};

function AudioList({ audios }: Props) {
  return (
    <div className="audio-list">
      {audios.map((audio) => (
        <article key={audio.id} className="audio-item">
          <div>
            <h3>{audio.title}</h3>
            <p>{audio.description}</p>
          </div>
          <audio controls preload="none" src={audio.audioSrc}>
            Your browser does not support the audio element.
          </audio>
        </article>
      ))}
    </div>
  );
}

export default AudioList;
