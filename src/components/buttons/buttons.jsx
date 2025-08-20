import { useEffect, useRef, useState } from "preact/hooks";

import "./buttons.css";
import "./buttons-mobile.css";

import { buttonImages } from "../../../utils/buttonImages";

function shuffle(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Buttons() {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1040);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1040);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [disableAnimations, setDisableAnimations] = useState(() => {
    if (isMobile) {
      localStorage.setItem("disableAnimations", "true");
      return true;
    }
    const saved = localStorage.getItem("disableAnimations");
    return saved === null ? true : saved === "true";
  });

  const [shuffledButtons] = useState(() => shuffle(buttonImages));

  const leftButtons = isMobile
    ? shuffledButtons
    : shuffledButtons.slice(0, Math.ceil(shuffledButtons.length / 2));

  const rightButtons = isMobile
    ? []
    : shuffledButtons.slice(Math.ceil(shuffledButtons.length / 2));

  useEffect(() => {
    localStorage.setItem("disableAnimations", disableAnimations);
  }, [disableAnimations]);

  useEffect(() => {
    if (disableAnimations) return;

    const container = containerRef.current;
    if (!container) return;

    const imgs = Array.from(container.querySelectorAll("img"));
    const velocities = imgs.map(() => ({
      x: (Math.random() * 0.5 + 0.25) * (Math.random() < 0.5 ? 1 : -1),
      y: (Math.random() * 0.5 + 0.25) * (Math.random() < 0.5 ? 1 : -1),
    }));

    imgs.forEach((img) => {
      img.style.left = `${
        Math.random() * (container.clientWidth - img.width)
      }px`;
      img.style.top = `${
        Math.random() * (container.clientHeight - img.height)
      }px`;
    });

    function animate() {
      imgs.forEach((img, i) => {
        let currentLeft = parseFloat(img.style.left) || 0;
        let currentTop = parseFloat(img.style.top) || 0;

        let newLeft = currentLeft + velocities[i].x;
        let newTop = currentTop + velocities[i].y;

        const rect = { width: 88, height: 31 };
        const parent = container.getBoundingClientRect();

        if (newLeft + rect.width >= parent.width || newLeft <= 0) {
          velocities[i].x *= -1;
          newLeft = Math.max(0, Math.min(newLeft, parent.width - rect.width));
        }

        if (newTop + rect.height >= parent.height || newTop <= 0) {
          velocities[i].y *= -1;
          newTop = Math.max(0, Math.min(newTop, parent.height - rect.height));
        }

        img.style.left = `${newLeft}px`;
        img.style.top = `${newTop}px`;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, [disableAnimations]);

  return (
    <>
      <button
        onClick={() => setDisableAnimations((prev) => !prev)}
        className="toggle-animation-btn"
        title={
          disableAnimations
            ? "Make the buttons bounce around"
            : "Put the buttons in a static position"
        }
        aria-label={
          disableAnimations
            ? "Make the buttons bounce around"
            : "Put the buttons in a static position"
        }
      >
        {disableAnimations ? "Enable Animations" : "Disable Animations"}
      </button>

      {!disableAnimations ? (
        <div
          className="buttons-background"
          ref={containerRef}
          aria-disabled
          aria-label="A collection of small, clickable images/GIFs that show my interests, personality et cetera. When clicked, many of them open to relevant/co-responding websites. All of them are displayed in 88 into 31 pixels in dimension, hence they are known as 88 x 31 buttons."
        >
          {shuffledButtons.map(({ src, href, label }) =>
            href ? (
              <a key={src} href={href} target="_blank" rel="noopener">
                <img
                  className="bouncing-img"
                  src={`/buttons/${src}`}
                  alt={label}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            ) : (
              <img
                key={src}
                className="bouncing-img"
                src={`/buttons/${src}`}
                alt={label}
                loading="lazy"
                decoding="async"
              />
            )
          )}
        </div>
      ) : (
        <>
          <div className="static-buttons left-column">
            {leftButtons.map(({ src, href, label }) =>
              href ? (
                <a key={src} href={href} rel="noopener" target="_blank">
                  <img
                    src={`/buttons/${src}`}
                    loading="lazy"
                    decoding="async"
                    alt={label}
                  />
                </a>
              ) : (
                <img
                  key={src}
                  src={`/buttons/${src}`}
                  loading="lazy"
                  decoding="async"
                  alt={label}
                />
              )
            )}
          </div>
          {!isMobile && (
            <div className="static-buttons right-column">
              {rightButtons.map(({ src, href, label }) =>
                href ? (
                  <a key={src} href={href} rel="noopener" target="_blank">
                    <img
                      src={`/buttons/${src}`}
                      loading="lazy"
                      decoding="async"
                      alt={label}
                    />
                  </a>
                ) : (
                  <img
                    key={src}
                    src={`/buttons/${src}`}
                    loading="lazy"
                    decoding="async"
                    alt={label}
                  />
                )
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
