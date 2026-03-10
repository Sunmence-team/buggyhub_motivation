import { useState, useEffect, useRef, type JSX } from "react";
import quotes from "./data";

type Theme = {
  bg: string;
  text: string;
  accent: string;
  sub: string;
};

const themes: Theme[] = [
  { bg: "#000000", text: "#ffffff", accent: "#a855f7", sub: "#262626" }, // black
  { bg: "gray", text: "#000000", accent: "#fffff", sub: "#e5e5e5" }, // white
  { bg: "#9333ea", text: "#ffffff", accent: "#ffffff", sub: "#7e22ce" }, // purple
  { bg: "#ec4899", text: "#ffffff", accent: "#ffffff", sub: "#be185d" }, // pink
  { bg: "#facc15", text: "#000000", accent: "#000000", sub: "#ca8a04" }, // yellow
];

const INTERVAL_MS =  1000;

function QuoteCards(): JSX.Element {
  const [current, setCurrent] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  const total = quotes.length;

  function btnStyle(theme: Theme): React.CSSProperties {
  return {
    background: "transparent",
    border: `1px solid ${theme.accent}`,
    color: theme.accent,
    width: 36,
    height: 36,
    borderRadius: 4,
    cursor: "pointer",
    fontSize: "0.85rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.8,
  };
};

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      left: current * containerRef.current.clientWidth,
      behavior: "smooth",
    });
  }, [current]);

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now() - progress * INTERVAL_MS;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const ratio = Math.min(elapsed / INTERVAL_MS, 1);

      setProgress(ratio);

      if (ratio >= 1) {
        setCurrent((c) => (c + 1) % total);
        startTimeRef.current = Date.now();
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
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const theme: Theme = themes[current % themes.length];

  return (
    <div
      className="w-full h-screen relative overflow-hidden transition-colors duration-700 font-serif"
      style={{ background: theme.bg }}
    >
      {/* Scroll strip */}
      <div
        ref={containerRef}
        className="flex w-full h-screen overflow-x-hidden scroll-smooth"
      >
        {quotes.map((quote: string, i: number) => {
          const t = themes[i % themes.length];

          return (
            <div
              key={i}
              className="min-w-full w-full h-screen flex flex-col items-center justify-center px-[8vw] py-8 box-border relative"
              style={{ background: t.bg }}
            >
            <div className="h-5 w-30 absolute top-20 start-20">
              <img src={logo} alt="" className="h-full w-full"/>
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
              <p
                className="text-[0.7rem] tracking-[0.25em] uppercase mb-10 opacity-70"
                style={{ color: t.accent }}
              >
                {String(i + 1).padStart(4, "0")} / {total}
              </p>

              {/* Quote */}
              <p
                className="text-center max-w-[780px] font-normal leading-relaxed text-[clamp(1.25rem,3.5vw,2.4rem)]"
                style={{ color: t.text , fontFamily: "Plus Jakarta Sans"}}
              >
                {quote}
              </p>

              {/* Accent line */}
              <div
                className="w-[60px] h-[2px] mt-12 opacity-80"
                style={{ background: t.accent }}
              />
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        className="fixed bottom-0 left-0 w-full h-[3px] z-[100]"
        style={{ background: theme.sub }}
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
      <div className="fixed bottom-12 right-12 flex gap-3 z-101">
        <button
          onClick={() => goTo((current - 1 + total) % total)}
          style={btnStyle(theme)}
        >
          ←
        </button>

        <button
          onClick={() => setIsPaused((p) => !p)}
          style={btnStyle(theme)}
        >
          {isPaused ? "▶" : "⏸"}
        </button>

        <button
          onClick={() => goTo((current + 1) % total)}
          style={btnStyle(theme)}
        >
          →
        </button>
      </div>

      {/* Counter */}
      <div
        className="fixed top-5 right-6 text-[0.72rem] tracking-[0.15em] opacity-75 z-[101]"
        style={{ color: theme.accent }}
      >
        {current + 1} / {total}
      </div>
    </div>
  );
};



export default QuoteCards;