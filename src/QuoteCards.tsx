import { useState, useEffect, useMemo, useRef, type JSX } from "react";
import quotes from "./data";
import img1 from "../src/assets/images/img1.png";

type Theme = {
  bg: string;
  text: string;
  accent: string;
  sub: string;
};

const themes: Theme[] = [
  { bg: "#2a2a2a", text: "#ffffff", accent: "#796fab", sub: "#262626" }, // black
  { bg: "gray", text: "#eff6f8", accent: "#ffffff", sub: "#e5e5e5" }, // white
  { bg: "#796fab", text: "#ffffff", accent: "#ffffff", sub: "#7e22ce" }, // purple
  { bg: "#ec4899", text: "#ffffff", accent: "#ffffff", sub: "#be185d" }, // pink
  { bg: "#e5aa2d", text: "#2a2a2a", accent: "#2a2a2a", sub: "#ca8a04" }, // yellow
];

const INTERVAL_MS = 1000 * 60 * 1;

function QuoteCards(): JSX.Element {
  const shuffledQuotes = useMemo(() => {
    const copy = [...quotes];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }, []);

  const [current, setCurrent] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);

  const total = shuffledQuotes.length;
  const remainingSeconds = Math.ceil((1 - progress) * (INTERVAL_MS / 1000));

  // function btnStyle(theme: Theme): React.CSSProperties {
  //   return {
  //     background: "transparent",
  //     border: `1px solid ${theme.accent}`,
  //     color: theme.accent,
  //     width: 36,
  //     height: 36,
  //     borderRadius: 4,
  //     cursor: "pointer",
  //     fontSize: "0.85rem",
  //     display: "flex",
  //     alignItems: "center",
  //     justifyContent: "center",
  //     opacity: 0.8,
  //   };
  // }

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      left: current * containerRef.current.clientWidth,
      behavior: "auto",
    });
  }, [current]);

  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--app-vh", `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
    };
  }, []);

  useEffect(() => {
    if (isPaused || total === 0) return;

    startTimeRef.current = performance.now() - progress * INTERVAL_MS;

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const ratio = Math.min(elapsed / INTERVAL_MS, 1);

      setProgress(ratio);

      if (ratio >= 1) {
        setCurrent((c) => (c + 1) % total);
        startTimeRef.current = performance.now();
        setProgress(0);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, total]);

  const goTo = (idx: number): void => {
    setCurrent(idx);
    startTimeRef.current = performance.now();
    setProgress(0);
  };

  const theme: Theme = themes[current % themes.length];

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (total === 0) return;

    if (event.key === "ArrowLeft") {
      goTo((current - 1 + total) % total);
    }

    if (event.key === "ArrowRight") {
      goTo((current + 1) % total);
    }

    if (event.key === " ") {
      event.preventDefault();
      setIsPaused((p) => !p);
    }
  };

  if (total === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "calc(var(--app-vh, 1vh) * 100)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
        }}
      >
        <p style={{ fontSize: 14, color: "#737373" }}>No quotes available.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "calc(var(--app-vh, 1vh) * 100)",
        position: "relative",
        overflow: "hidden",
        background: theme.bg,
        fontFamily: "serif",
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Quote carousel"
    >
      {/* Scroll strip */}
      <div
        ref={containerRef}
        style={{
          display: "flex",
          width: "100%",
          height: "calc(var(--app-vh, 1vh) * 100)",
          overflowX: "hidden",
        }}
      >
        {shuffledQuotes.map((quote: string, i: number) => {
          const t = themes[i % themes.length];

          return (
            <div
              key={i}
              style={{
                flexShrink: 0,
                minWidth: "100%",
                width: "100%",
                height: "calc(var(--app-vh, 1vh) * 100)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 8vw",
                boxSizing: "border-box",
                position: "relative",
                background: t.bg,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 48,
                  left: 48,
                  width: 200,
                  height: 30,
                }}
              >
                <img
                  src={img1}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 24,
                  zIndex: 101,
                  color: theme.accent,
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: 1,
                }}
              >
                Next slide in {remainingSeconds}s
              </div>
              {/* Corner decoration */}
              <div
                style={{
                  position: "absolute",
                  top: 32,
                  left: 32,
                  width: 48,
                  height: 48,
                  opacity: 0.6,
                  borderTop: `2px solid ${t.accent}`,
                  borderLeft: `2px solid ${t.accent}`,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: 32,
                  right: 32,
                  width: 48,
                  height: 48,
                  opacity: 0.6,
                  borderBottom: `2px solid ${t.accent}`,
                  borderRight: `2px solid ${t.accent}`,
                }}
              />

              {/* Card number */}
              {/* <p
                className="text-[0.7rem] tracking-[0.25em] uppercase mb-10 opacity-70"
                style={{ color: t.accent }}
              >
                {String(i + 1).padStart(4, "0")} / {total}
              </p> */}

              {/* Quote */}
              <p
                style={{
                  maxWidth: 780,
                  fontSize: "3.5vw",
                  color: t.text,
                  fontFamily: "Plus Jakarta Sans",
                  textAlign: "center",
                  fontWeight: 500,
                  lineHeight: 1.6,
                }}
              >
                {quote}
              </p>

              {/* Accent line */}
              <div
                style={{
                  width: 60,
                  height: 2,
                  marginTop: 48,
                  opacity: 0.8,
                  background: t.accent,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 3,
          zIndex: 100,
          background: theme.sub,
        }}
        role="presentation"
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: theme.accent,
          }}
        />
      </div>

      {/* Controls */}
      {/* <div className="fixed bottom-12 right-12 flex gap-3 z-[101]">
        <button
          onClick={() => goTo((current - 1 + total) % total)}
          style={btnStyle(theme)}
          aria-label="Previous quote"
        >
          Prev
        </button>

        <button
          onClick={() => setIsPaused((p) => !p)}
          style={btnStyle(theme)}
          aria-label={isPaused ? "Play carousel" : "Pause carousel"}
        >
          {isPaused ? "Play" : "Pause"}
        </button>

        <button
          onClick={() => goTo((current + 1) % total)}
          style={btnStyle(theme)}
          aria-label="Next quote"
        >
          Next
        </button>
      </div> */}
    </div>
  );
}

export default QuoteCards;
