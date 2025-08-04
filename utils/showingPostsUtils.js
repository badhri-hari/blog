export function getLocalDateOnly(datetime) {
  return new Date(datetime).toLocaleDateString("en-CA");
}

export function isNonYoutubeWebsite(url) {
  const isYouTube =
    url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
  const imageOrVideoExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "mp4",
    "webm",
  ];
  const extension = url.split(".").pop().toLowerCase();
  return (
    !isYouTube &&
    !imageOrVideoExtensions.includes(extension) &&
    url.startsWith("http")
  );
}

// parseContentToHtml function is used direclty in api/rss.js
// so if it is updated, it should be updated there as well

export function parseContentToHtml(text, isTitle = false) {
  if (!text) return "";

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  if (isTitle) {
    return `<h2>${escapeHtml(text)}</h2>`;
  }

  const paragraphs = text
    .split(/\n+/)
    .flatMap((line) =>
      line
        .split(/(?<!\|)\|(?!\|)/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
    .map((rawPara) => {
      const isBlockquote = /^\|\|"\s*[^"]+\s*"\s*-\s*.+$/s.test(rawPara);
      const cleanPara = isBlockquote ? rawPara.replace(/^\|\|/, "") : rawPara;
      let escaped = escapeHtml(cleanPara);

      escaped = escaped
        .replace(/\*\*(.*?)\*\*/g, "<strong class='blog-text'>$1</strong>")
        .replace(/_([^_]+)_/g, "<em class='blog-text'>$1</em>")
        .replace(/__(.*?)__/g, "<u class='blog-text'>$1</u>")
        .replace(
          /\[([^\]]+)\]\((https?:\/\/[^\s)]+(?:\([^\s)]+\))*)\)/g,
          (match, linkText, url) =>
            `<a href="${url}" target="_blank" rel="noopener">${linkText}</a>`
        )
        .replace(
          /\*\[([^\]]+)\]/g,
          `<span class="asterisk-wrapper"><span class="asterisk-icon">*</span><span class="asterisk-popup">$1</span></span>`
        );

      return isBlockquote
        ? `<p role="blockquote" class="blockquote">${escaped}</p>`
        : `<p>${escaped}</p>`;
    })
    .join("");

  return paragraphs;
}
