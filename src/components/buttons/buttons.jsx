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
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 760);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 760);
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
          aria-label="A collection of NeoCities like buttons."
        >
          {shuffledButtons.map(({ src, href }) =>
            href ? (
              <a key={src} href={href} target="_blank" rel="noopener">
                <img
                  className="bouncing-img"
                  src={`/buttons/${src}`}
                  alt=""
                  aria-hidden
                />
              </a>
            ) : (
              <img
                key={src}
                className="bouncing-img"
                src={`/buttons/${src}`}
                alt=""
                aria-hidden
              />
            )
          )}
        </div>
      ) : (
        <>
          <div className="static-buttons left-column" aria-disabled>
            {leftButtons.map(({ src, href }) =>
              href ? (
                <a key={src} href={href} rel="noopener" target="_blank">
                  <img src={`/buttons/${src}`} alt="" />
                </a>
              ) : (
                <img key={src} src={`/buttons/${src}`} alt="" />
              )
            )}
          </div>
          {!isMobile && (
            <div className="static-buttons right-column" aria-disabled>
              {rightButtons.map(({ src, href }) =>
                href ? (
                  <a key={src} href={href} rel="noopener" target="_blank">
                    <img src={`/buttons/${src}`} alt="" />
                  </a>
                ) : (
                  <img key={src} src={`/buttons/${src}`} alt="" />
                )
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}
