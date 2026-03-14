import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VideoIntroProps {
  /** Called when intro finishes and content should appear */
  onIntroComplete: () => void;
  /** Video source URL */
  videoSrc?: string;
  /** Poster image fallback */
  posterSrc?: string;
  /** Intro duration in seconds before transitioning */
  introDuration?: number;
}

const INTRO_PLAYED_KEY = "terra_intro_played";

const VideoIntro = ({
  onIntroComplete,
  videoSrc = "/videos/hero-background.mp4",
  posterSrc,
  introDuration = 3.5,
}: VideoIntroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"intro" | "transitioning" | "background">("intro");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Check if intro was already played
  useEffect(() => {
    const alreadyPlayed = localStorage.getItem(INTRO_PLAYED_KEY);
    if (alreadyPlayed || prefersReducedMotion) {
      setPhase("background");
      onIntroComplete();
    }
  }, [prefersReducedMotion, onIntroComplete]);

  // Handle video time tracking for intro duration
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || phase !== "intro") return;

    if (video.currentTime >= introDuration) {
      setPhase("transitioning");
      localStorage.setItem(INTRO_PLAYED_KEY, "true");

      // After transition animation completes, switch to background
      setTimeout(() => {
        setPhase("background");
        onIntroComplete();
      }, 800);
    }
  }, [phase, introDuration, onIntroComplete]);

  // Fallback timer in case timeupdate doesn't fire reliably
  useEffect(() => {
    if (phase !== "intro") return;

    const fallback = setTimeout(() => {
      if (phase === "intro") {
        setPhase("transitioning");
        localStorage.setItem(INTRO_PLAYED_KEY, "true");
        setTimeout(() => {
          setPhase("background");
          onIntroComplete();
        }, 800);
      }
    }, (introDuration + 1) * 1000);

    return () => clearTimeout(fallback);
  }, [phase, introDuration, onIntroComplete]);

  const isIntroActive = phase === "intro";
  const isTransitioning = phase === "transitioning";

  return (
    <>
      {/* Video layer — always present */}
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: isIntroActive ? 50 : -2 }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isIntroActive ? 1.05 : 1,
            filter: phase === "background"
              ? "blur(0px) brightness(0.55)"
              : isTransitioning
                ? "blur(4px) brightness(0.6)"
                : "blur(0px) brightness(0.85)",
          }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={posterSrc}
            onTimeUpdate={handleTimeUpdate}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </motion.div>

        {/* Dark overlay — adjusts based on phase */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor:
              phase === "background"
                ? "rgba(0,0,0,0.35)"
                : isTransitioning
                  ? "rgba(0,0,0,0.25)"
                  : "rgba(0,0,0,0.05)",
          }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          style={{ backdropFilter: phase === "background" ? "blur(2px)" : "none" }}
        />
      </div>

      {/* Intro overlay — Terra branding during intro phase */}
      <AnimatePresence>
        {(isIntroActive || isTransitioning) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 51 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -20 : 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                Terra Farming
              </motion.h1>
              <motion.p
                className="mt-3 text-lg md:text-xl text-white/80 font-light"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTransitioning ? 0 : 0.8 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                From Dirt to Dessert
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoIntro;
