import { useState } from "preact/hooks";

function YouTubeEmbed({ videoId, i }) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        key={i}
        className="blog-media"
        loading="lazy"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`}
        title={`YouTube video ${i + 1}`}
        allowFullScreen
        referrerPolicy="no-referrer"
      />
    );
  }

  const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div
      key={i}
      className="youtube-placeholder blog-media"
      onClick={() => setActive(true)}
    >
      <img
        src={thumbnail}
        alt={`YouTube video ${i + 1}`}
        title={`YouTube Video ID: ${videoId}`}
        loading="lazy"
      />
      <div title={`YouTube Video ID: ${videoId}`}>
        ▶ <span>Play YouTube Video</span>
      </div>
    </div>
  );
}

export default function renderMedia(src, i) {
  const extension = src.split(".").pop().toLowerCase();
  const isYouTube =
    src.includes("youtube.com/watch?v=") || src.includes("youtu.be/");

  if (isYouTube) {
    let videoId = "";
    if (src.includes("youtube.com/watch?v=")) {
      const url = new URL(src);
      videoId = url.searchParams.get("v");
    } else {
      videoId = src.split("youtu.be/")[1].split(/[?&]/)[0];
    }
    return <YouTubeEmbed key={i} videoId={videoId} i={i} />;
  }

  if (["mp4", "webm"].includes(extension)) {
    return (
      <video
        key={i}
        controls
        className="blog-media"
        loading="lazy"
        aria-label={`Video content ${i + 1}`}
      >
        <source src={src} type={`video/${extension}`} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
    return (
      <img
        key={i}
        src={src}
        alt={`Blog media ${i + 1}`}
        className="blog-media"
        loading="lazy"
      />
    );
  }

  return (
    <a
      key={i}
      href={src}
      className="blog-media website-link"
      rel="noopener"
      target="_blank"
    >
      {src
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .replace(/\/$/, "")}
    </a>
  );
}
