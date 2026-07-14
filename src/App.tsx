import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

const LEFT_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260625_154433_532a85d3-dabf-4265-b8bd-19ac6af31842.mp4";
const RIGHT_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_39ca84eAE1ODL9hbR5VhoEj8tBf/hf_20260625_154401_a664f076-b971-4557-8728-40ef9ea4c49b.mp4";

const GALLERY_IMAGES = [
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_104530_521b2f85-c0f3-4d0e-9704-b578315b4cb9.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103711_76ccdb8b-5043-4f47-9c54-4379713393ea.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103728_394f6a1b-85e2-4386-a4f6-408472a0a5b7.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103739_86743e0e-16a7-4bee-bf38-dd67985344dc.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103748_b2215dc8-a3a7-470d-b19a-5b87fa7d0c37.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103758_e919ce72-5c9d-4b87-9be6-d7647b34825c.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103808_013583d0-3386-4547-9832-37c7d8edb3ac.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103937_a0c49d0a-33eb-4ead-aea6-c1baf241acbc.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_103956_d18ed8fd-7b6f-4b86-91f9-20010fe38670.png&w=1920&q=85",
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260629_104034_ba5a9963-87ff-4008-a545-6bd686c088b5.png&w=1920&q=85",
] as const;

const SYMBOLS = ["8", "$", "^^", "%", "/"] as const;
const ENTER_EASE = [0.25, 0.1, 0.25, 1] as const;

type LayoutCell = {
  column: number;
  imageIndex: number;
  row: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

// Keep the layout viewport stable while Safari's browser chrome expands/collapses.
const getViewportHeight = () => window.innerHeight;

const getColumnCount = () => {
  if (window.innerWidth < 640) return 2;
  if (window.innerWidth < 1024) return 3;
  return 4;
};

const detectTouch = () =>
  window.matchMedia("(hover: none), (pointer: coarse)").matches || navigator.maxTouchPoints > 0;

function buildLayout(count: number, columns: number): LayoutCell[] {
  const cells: LayoutCell[] = [];
  let imageIndex = 0;
  let row = 0;

  while (imageIndex < count) {
    const rowCells = new Array<number>(columns).fill(-1);
    const primary = (row * 2 + (row % 2)) % columns;
    rowCells[primary] = imageIndex++;

    if (row % 3 === 0 && imageIndex < count) {
      let secondary = (primary + 2) % columns;
      if (secondary === primary) secondary = (primary + 1) % columns;
      rowCells[secondary] = imageIndex++;
    }

    rowCells.forEach((index, column) => {
      cells.push({ column, imageIndex: index, row });
    });
    row += 1;
  }

  return cells;
}

function Wordmark() {
  return (
    <svg viewBox="0 0 355 110" role="img" aria-label="prmpt" className="wordmark-svg">
      <path
        fillRule="evenodd"
        d="M0 27h14v8c5-7 12-10 21-10 18 0 29 15 29 38 0 23-12 38-31 38-8 0-14-3-19-8v17H0V27Zm31 14c-10 0-17 8-17 22s7 22 17 22c11 0 18-8 18-22s-7-22-18-22Z"
      />
      <path d="M68 27h14v12c5-9 12-14 23-14v17h-4c-13 0-19 8-19 23v36H68V27Z" />
      <path d="M109 27h14v9c5-7 12-11 21-11 10 0 17 5 21 14 6-9 14-14 25-14 17 0 26 13 26 35v41h-15V63c0-14-4-21-13-21s-15 8-15 23v36h-15V63c0-14-4-21-13-21s-14 8-14 23v36h-22V27Z" />
      <path
        fillRule="evenodd"
        d="M220 27h14v8c5-7 12-10 21-10 18 0 29 15 29 38 0 23-12 38-31 38-8 0-14-3-19-8v17h-14V27Zm31 14c-10 0-17 8-17 22s7 22 17 22c11 0 18-8 18-22s-7-22-18-22Z"
      />
      <path d="M290 9h15v18h18v15h-18v34c0 8 4 11 12 11h6v14h-10c-16 0-23-8-23-24V42h-10V27h10V9Z" />
      <path
        fillRule="evenodd"
        d="M340 18a15 15 0 1 1 0 30 15 15 0 0 1 0-30Zm0 2.5a12.5 12.5 0 1 0 0 25 12.5 12.5 0 0 0 0-25Zm-5.2 6.1h5.8c3.7 0 6 1.9 6 5 0 2.1-1.1 3.7-3 4.5l3.7 5.5h-3.8l-3.1-4.9H338v4.9h-3.2v-15Zm3.2 2.8v4.5h2.3c1.9 0 3-.8 3-2.3 0-1.5-1.1-2.2-3-2.2H338Z"
      />
    </svg>
  );
}

function CursorGlyph() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="22.75" fill="none" stroke="white" strokeWidth="2.5" />
      <path
        d="M15.8 16.2h6.5v-3.1h3.4v3.1h6.5v3.2h-4.4c1.1 2.9 3 5.4 5.6 7.5l-2.2 2.8c-2.4-2.2-4.2-4.7-5.5-7.5v12.7h-3.4V22.4c-1.4 3-3.3 5.6-5.7 7.7l-2-2.8c2.6-2.1 4.5-4.7 5.6-7.9h-4.4v-3.2Z"
        fill="white"
      />
    </svg>
  );
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const galleryWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const leftVideoRef = useRef<HTMLVideoElement>(null);
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const buyRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const symbolRef = useRef<HTMLSpanElement>(null);
  const readyRef = useRef({ left: false, right: false });
  const metricsRef = useRef({ maxScroll: 0, viewportHeight: 1 });
  const pointerRef = useRef({ x: 0, y: 0, moved: false });
  const activeSideRef = useRef<"left" | "right">("right");

  const [columns, setColumns] = useState(() => getColumnCount());
  const [isTouch, setIsTouch] = useState(() => detectTouch());
  const [videosReady, setVideosReady] = useState(false);
  const prefersReducedMotion = Boolean(useReducedMotion());
  const layout = useMemo(() => buildLayout(GALLERY_IMAGES.length, columns), [columns]);

  const markVideoReady = useCallback((side: "left" | "right") => {
    readyRef.current[side] = true;
    if (readyRef.current.left && readyRef.current.right) setVideosReady(true);
  }, []);

  useEffect(() => {
    const updateMode = () => {
      setColumns(getColumnCount());
      setIsTouch(detectTouch());
    };

    window.addEventListener("resize", updateMode, { passive: true });
    return () => window.removeEventListener("resize", updateMode);
  }, []);

  useGSAP(
    () => {
      if (!panelRef.current || !rootRef.current) return;

      gsap.fromTo(
        panelRef.current,
        { y: () => getViewportHeight() },
        {
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top top",
            end: () => `+=${getViewportHeight()}`,
            scrub: prefersReducedMotion ? false : true,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    { scope: rootRef, dependencies: [prefersReducedMotion], revertOnUpdate: true },
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    const wrap = galleryWrapRef.current;
    if (!root || !wrap) return;

    let resizeFrame = 0;
    const measure = () => {
      resizeFrame = 0;
      const viewportHeight = Math.max(1, getViewportHeight());
      const maxScroll = Math.max(0, wrap.scrollHeight - viewportHeight);
      metricsRef.current = { maxScroll, viewportHeight };
      document.documentElement.style.setProperty("--app-vh", `${viewportHeight}px`);
      root.style.height = `${viewportHeight + maxScroll + 2 * viewportHeight}px`;
      ScrollTrigger.refresh();
    };
    let measuredWidth = window.innerWidth;
    const scheduleMeasure = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(measure);
    };
    const onResize = () => {
      const nextWidth = window.innerWidth;
      if (isTouch && Math.abs(nextWidth - measuredWidth) < 2) return;
      measuredWidth = nextWidth;
      scheduleMeasure();
    };

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(wrap);
    window.addEventListener("resize", onResize, { passive: true });
    scheduleMeasure();

    return () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [isTouch, layout]);

  useEffect(() => {
    const leftVideo = leftVideoRef.current;
    const rightVideo = rightVideoRef.current;
    if (!leftVideo || !rightVideo || !isTouch) return;

    let cancelled = false;

    const show = (side: "left" | "right") => {
      activeSideRef.current = side;
      leftVideo.style.display = side === "left" ? "block" : "none";
      rightVideo.style.display = side === "right" ? "block" : "none";
    };

    const playSide = async (side: "left" | "right") => {
      if (cancelled) return;
      const active = side === "left" ? leftVideo : rightVideo;
      const inactive = side === "left" ? rightVideo : leftVideo;
      inactive.pause();
      active.currentTime = 0;
      show(side);
      if (!prefersReducedMotion) {
        try {
          await active.play();
        } catch {
          // iOS may defer autoplay until media metadata is available.
        }
      }
    };

    const onLeftEnded = () => void playSide("right");
    const onRightEnded = () => void playSide("left");
    leftVideo.addEventListener("ended", onLeftEnded);
    rightVideo.addEventListener("ended", onRightEnded);
    show("left");

    if (prefersReducedMotion) {
      leftVideo.pause();
      rightVideo.pause();
      leftVideo.currentTime = 0;
      rightVideo.currentTime = 0;
    } else if (leftVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void playSide("left");
    } else {
      leftVideo.addEventListener("loadeddata", () => void playSide("left"), { once: true });
    }

    return () => {
      cancelled = true;
      leftVideo.removeEventListener("ended", onLeftEnded);
      rightVideo.removeEventListener("ended", onRightEnded);
      leftVideo.pause();
      rightVideo.pause();
    };
  }, [isTouch, prefersReducedMotion]);

  useEffect(() => {
    const cursor = cursorRef.current;
    const canvas = canvasRef.current;
    const wrap = galleryWrapRef.current;
    const info = infoRef.current;
    const buy = buyRef.current;
    const overlay = overlayRef.current;
    const footer = footerRef.current;
    const leftVideo = leftVideoRef.current;
    const rightVideo = rightVideoRef.current;
    if (!canvas || !wrap || !info || !buy || !overlay || !footer || !leftVideo || !rightVideo) return;

    let frameId = 0;
    let lastScroll = -1;
    let lastSymbolTime = 0;

    const showVideo = (side: "left" | "right") => {
      leftVideo.style.display = side === "left" ? "block" : "none";
      rightVideo.style.display = side === "right" ? "block" : "none";
    };

    const safeSeek = (video: HTMLVideoElement, time: number) => {
      if (
        video.seeking ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0 ||
        Math.abs(video.currentTime - time) < 0.018
      ) {
        return;
      }
      video.currentTime = Math.min(video.duration, Math.max(0, time));
    };

    const onPointerMove = (event: MouseEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, moved: true };
      if (cursor) {
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
        cursor.style.opacity = "1";
      }
    };
    const onPointerLeave = () => {
      if (cursor) cursor.style.opacity = "0";
    };

    if (!isTouch) {
      window.addEventListener("mousemove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onPointerLeave);
    }

    const renderFrame = (time: number) => {
      const scrollY = Math.max(0, window.scrollY || document.documentElement.scrollTop);
      const { maxScroll, viewportHeight: vh } = metricsRef.current;
      const galleryTravel = Math.min(maxScroll, Math.max(0, scrollY - vh));

      wrap.style.transform = `translate3d(0, ${-galleryTravel.toFixed(2)}px, 0)`;
      canvas.style.visibility = scrollY > vh ? "hidden" : "visible";

      for (const card of cardRefs.current) {
        if (!card) continue;
        const rect = card.getBoundingClientRect();
        let scale = 0;

        if (rect.bottom > 0 && rect.top < vh) {
          if (prefersReducedMotion) {
            scale = 1;
          } else {
            const enter = Math.min(1, (vh - rect.top) / (vh * 0.6));
            const exit = Math.min(1, rect.bottom / (vh * 0.4));
            scale = clamp01(Math.min(enter, exit));
          }
        }

        card.style.transform = `translateZ(0) scale(${scale.toFixed(4)})`;
      }

      const outroProgress = clamp01((scrollY - vh - maxScroll) / Math.max(1, vh - 100));
      const outroOffset = window.innerWidth >= 1024 ? 166 : 132;
      overlay.style.opacity = `${outroProgress}`;
      info.style.transform = `translate3d(0, ${(-outroOffset * outroProgress).toFixed(2)}px, 0)`;
      buy.style.transform = `translateZ(0) scale(${outroProgress.toFixed(4)})`;
      footer.style.opacity = `${outroProgress}`;

      if (scrollY !== lastScroll && time - lastSymbolTime >= 80) {
        lastSymbolTime = time;
        if (symbolRef.current) {
          symbolRef.current.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        }
      }
      lastScroll = scrollY;

      if (!isTouch && scrollY <= vh && pointerRef.current.moved) {
        const width = window.innerWidth;
        const center = width / 2;
        const deadZone = Math.max(30, width * 0.05);
        const x = Math.min(width, Math.max(0, pointerRef.current.x));

        if (x < center - deadZone) {
          activeSideRef.current = "right";
          showVideo("right");
          const progress = clamp01((center - deadZone - x) / (center - deadZone));
          safeSeek(rightVideo, progress * rightVideo.duration);
        } else if (x > center + deadZone) {
          activeSideRef.current = "left";
          showVideo("left");
          const progress = clamp01((x - center - deadZone) / (width - center - deadZone));
          safeSeek(leftVideo, progress * leftVideo.duration);
        } else {
          showVideo(activeSideRef.current);
          safeSeek(leftVideo, 0);
          safeSeek(rightVideo, 0);
        }
      }

      frameId = requestAnimationFrame(renderFrame);
    };

    frameId = requestAnimationFrame(renderFrame);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
    };
  }, [isTouch, layout, prefersReducedMotion]);

  return (
    <div id="scroll-spacer" ref={rootRef} className={isTouch ? "is-touch" : "is-desktop"}>
      <div ref={cursorRef} className="custom-cursor" aria-hidden="true">
        <CursorGlyph />
      </div>

      <motion.div
        className="brand-logo blend-ui"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ENTER_EASE, delay: 0 }}
      >
        <Wordmark />
      </motion.div>

      <motion.p
        className="hero-caption blend-ui"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ENTER_EASE, delay: 0.3 }}
      >
        When switching between videos near the center, do not reset currentTime to 0 abruptly. Add a small
        dead zone: if cursor is within +/-50px of center, keep both videos at currentTime = 0 and show whichever
        was last active.
      </motion.p>

      <motion.header
        className="hero-nav blend-ui"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: ENTER_EASE, delay: 0.15 }}
      >
        <span className="about-link">ABOUT</span>
        <div className="nav-actions">
          <svg viewBox="0 0 40 40" className="menu-icon" aria-hidden="true">
            <path d="M0 14H40M0 26H40" fill="none" stroke="white" strokeWidth="2.5" />
          </svg>
          <span className="cart-label">[ CART ]</span>
        </div>
      </motion.header>

      <motion.div
        id="outro-info"
        ref={infoRef}
        className="product-info blend-ui"
        data-outro-offset={columns === 4 ? 166 : 132}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: ENTER_EASE, delay: 0.45 }}
      >
        <div className="product-heading">
          <div className="symbol-circle">
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="18.75" fill="none" stroke="white" />
            </svg>
            <span id="circle-symbol" ref={symbolRef}>
              8
            </span>
          </div>
          <p className="collection-label">
            ARCHIVE COLLECTION
            <br />
            &ldquo;PROMPT&rdquo;
          </p>
        </div>
        <p className="product-price">$97,33</p>
      </motion.div>

      <div id="outro-buy" ref={buyRef} className="view-button">
        <span>view</span>
      </div>

      <div id="main-canvas" ref={canvasRef} className={videosReady ? "video-canvas is-ready" : "video-canvas"}>
        <video
          ref={leftVideoRef}
          className="hero-video hero-video-left"
          src={LEFT_VIDEO}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => markVideoReady("left")}
          onCanPlay={() => markVideoReady("left")}
        />
        <video
          ref={rightVideoRef}
          className="hero-video hero-video-right"
          src={RIGHT_VIDEO}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={() => markVideoReady("right")}
          onCanPlay={() => markVideoReady("right")}
        />
      </div>

      <section ref={panelRef} className="black-panel" aria-label="Archive collection gallery">
        <div ref={galleryWrapRef} className="gallery-wrap">
          <div
            className="gallery-grid"
            style={{ "--gallery-cols": columns } as React.CSSProperties}
          >
            {layout.map((cell) => {
              const key = `${cell.row}-${cell.column}`;
              if (cell.imageIndex < 0) {
                return <div key={key} className="gallery-cell gallery-spacer" aria-hidden="true" />;
              }

              const origin = cell.column < columns / 2 ? "right bottom" : "left bottom";
              return (
                <div
                  key={key}
                  ref={(node) => {
                    cardRefs.current[cell.imageIndex] = node;
                  }}
                  className="gallery-cell bp-card"
                  style={{ transformOrigin: origin }}
                >
                  <img
                    src={GALLERY_IMAGES[cell.imageIndex]}
                    alt={`Archive look ${String(cell.imageIndex + 1).padStart(2, "0")}`}
                    loading="eager"
                    decoding="async"
                    draggable={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div id="outro-overlay" ref={overlayRef} className="outro-overlay" />

      <footer id="outro-footer" ref={footerRef} className="outro-footer blend-ui">
        <span>PRMPT (R) 2026</span>
        <span>PRIVACY POLICY</span>
      </footer>
    </div>
  );
}

export default App;
