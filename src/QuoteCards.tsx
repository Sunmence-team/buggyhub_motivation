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
  { bg: "gray", text: "#2a2a2a", accent: "#ffffff", sub: "#e5e5e5" }, // white
  { bg: "#796fab", text: "#ffffff", accent: "#ffffff", sub: "#7e22ce" }, // purple
  { bg: "#ec4899", text: "#ffffff", accent: "#ffffff", sub: "#be185d" }, // pink
  { bg: "#e5aa2d", text: "#2a2a2a", accent: "#2a2a2a", sub: "#ca8a04" }, // yellow
];

const INTERVAL_MS = 1000 * 60 * 3;

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
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-sm text-neutral-500">No quotes available.</p>
      </div>
    );
  }

  return (
    <div
      className="w-full relative overflow-hidden transition-colors duration-700 font-serif"
      style={{ background: theme.bg, height: "100vh" }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Quote carousel"
    >
      {/* Scroll strip */}
      <div
        ref={containerRef}
        className="flex w-full h-screen overflow-x-hidden scroll-smooth"
      >
        {shuffledQuotes.map((quote: string, i: number) => {
          const t = themes[i % themes.length];

          return (
            <div
              key={i}
              className="shrink-0 min-w-full w-full h-screen flex flex-col items-center justify-center px-[8vw] py-8 box-border relative slide"
              style={{ background: t.bg }}
            >
              <div
                className="absolute"
                style={{
                  position: "absolute",
                  top: 48,
                  left: 48,
                  width: 80,
                  height: 20,
                }}
              >
                <img src={img1} alt="" className="h-full w-full" />
              </div>

              <div
                className="text-sm font-medium opacity-80"
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 24,
                  zIndex: 101,
                  color: theme.accent,
                }}
              >
                Next slide in {remainingSeconds}s
              </div>
              {/* Corner decoration */}
              <div
                className="absolute top-8 left-8 w-12 h-12 opacity-60"
                style={{
                  borderTop: `2px solid ${t.accent}`,
                  borderLeft: `2px solid ${t.accent}`,
                }}
              />

              <div
                className="absolute bottom-8 right-8 w-12 h-12 opacity-60"
                style={{
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
                className="text-center leading-relaxed font-medium"
                style={{
                  maxWidth: 780,
                  fontSize: "3.5vw",
                  color: t.text,
                  fontFamily: "Plus Jakarta Sans",
                }}
              >
                {quote}
              </p>

              {/* Accent line */}
              <div
                className="mt-12 opacity-80"
                style={{ width: 60, height: 2, background: t.accent }}
              />
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        className="fixed bottom-0 left-0 w-full"
        style={{ height: 3, zIndex: 100, background: theme.sub }}
      >
        <div
          className="h-full transition-all duration-100 linear"
          style={{
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
