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
    return (
      <iframe
        key={i}
        className="blog-media"
        loading="lazy"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title={`YouTube video ${i + 1}`}
        allowFullScreen
        referrerPolicy="no-referrer"
      />
    );
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
