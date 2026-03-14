import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const INTRO_PLAYED_KEY = "terra_intro_played";

const VideoIntro = ({ onIntroComplete }: { onIntroComplete: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"intro" | "transitioning" | "background">("intro");

  // Check reduced motion / already played
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = localStorage.getItem(INTRO_PLAYED_KEY);
    if (alreadyPlayed || reducedMotion) {
      setPhase("background");
      onIntroComplete();
    }
  }, [onIntroComplete]);

  // Time-based transition trigger
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || phase !== "intro") return;
    if (video.currentTime >= 3.5) {
      setPhase("transitioning");
      localStorage.setItem(INTRO_PLAYED_KEY, "true");
      setTimeout(() => {
        setPhase("background");
        onIntroComplete();
      }, 800);
    }
  }, [phase, onIntroComplete]);

  // Fallback timer
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => {
      if (phase === "intro") {
        setPhase("transitioning");
        localStorage.setItem(INTRO_PLAYED_KEY, "true");
        setTimeout(() => {
          setPhase("background");
          onIntroComplete();
        }, 800);
      }
    }, 5000);
    return () => clearTimeout(t);
  }, [phase, onIntroComplete]);

  const isIntro = phase === "intro";
  const isTrans = phase === "transitioning";

  return (
    <>
      {/* Video layer */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: isIntro ? 50 : -2 }}>
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isIntro ? 1.05 : 1,
            filter: phase === "background"
              ? "blur(0px) brightness(0.55)"
              : isTrans
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
            onTimeUpdate={handleTimeUpdate}
          >
            <source src="/videos/terra-intro.mov" type="video/mp4" />
            <source src="/videos/hero-background.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Overlay */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor: phase === "background"
              ? "rgba(0,0,0,0.35)"
              : isTrans ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.05)",
          }}
          transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
          style={{ backdropFilter: phase === "background" ? "blur(2px)" : "none" }}
        />
      </div>

      {/* Intro branding overlay */}
      <AnimatePresence>
        {(isIntro || isTrans) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 51 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isTrans ? 0 : 1, y: isTrans ? -20 : 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
            >
              <h1
                className="text-4xl md:text-6xl font-bold text-white tracking-tight"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
              >
                Terra Farming
              </h1>
              <motion.p
                className="mt-3 text-lg md:text-xl text-white/80 font-light"
                style={{ textShadow: "0 1px 10px rgba(0,0,0,0.5)" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isTrans ? 0 : 0.8 }}
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
