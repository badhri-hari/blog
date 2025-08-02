import { useEffect, useRef, useState } from "preact/hooks";

import "./buttons.css";
import "./buttons-mobile.css"

const buttonImages = [
  "scp-wikidot.png",
  "piracy_now.png",
  "pokemon_pikachu.gif",
  "2025_button_user.png",
  "badhri_site.gif",
  "best_viewed_with_eyes.gif",
  "trump_mugshot.png",
  "windowsonarm.png",
  "zen-browser.png",
];

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
  const [disableAnimations, setDisableAnimations] = useState(() => {
    if (window.innerWidth < 760) {
      localStorage.setItem("disableAnimations", "true");
      return true;
    }
    const saved = localStorage.getItem("disableAnimations");
    return saved === "true";
  });

  const [shuffledButtons] = useState(() => shuffle(buttonImages));
  const half = Math.ceil(shuffledButtons.length / 2);
  const leftButtons = shuffledButtons.slice(0, half);
  const rightButtons = shuffledButtons.slice(half);

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
          aria-label="A collection of NeoCities/GeoCities like buttons."
        >
          {shuffledButtons.map((src) => (
            <img
              key={src}
              className="bouncing-img"
              src={`/buttons/${src}`}
              aria-hidden
            />
          ))}
        </div>
      ) : (
        <>
          <div className="static-buttons left-column" aria-disabled>
            {leftButtons.map((src) => (
              <img key={src} src={`/buttons/${src}`} />
            ))}
          </div>
          <div className="static-buttons right-column" aria-disabled>
            {rightButtons.map((src) => (
              <img key={src} src={`/buttons/${src}`} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
