import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import terraLogo from "@/assets/terra-logo.png";

const INTRO_PLAYED_KEY = "terra_intro_played";

// Floating particle component for organic feel
const Particle = ({ delay, x, y }: { delay: number; x: number; y: number }) => (
  <motion.div
    className="absolute rounded-full bg-terra-gold/30"
    style={{ width: 4 + Math.random() * 6, height: 4 + Math.random() * 6 }}
    initial={{ opacity: 0, x: `${x}%`, y: `${y}%`, scale: 0 }}
    animate={{
      opacity: [0, 0.8, 0],
      y: [`${y}%`, `${y - 15 - Math.random() * 20}%`],
      scale: [0, 1.2, 0],
    }}
    transition={{
      duration: 2.5 + Math.random(),
      delay: 0.5 + delay,
      ease: "easeOut",
    }}
  />
);

// Generate particles around the logo
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  delay: i * 0.12,
  x: 35 + Math.random() * 30,
  y: 40 + Math.random() * 30,
}));

const cubicSmooth = [0.22, 1, 0.36, 1] as const;
const cubicSlow = [0.16, 1, 0.3, 1] as const;

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
    if (video.currentTime >= 4) {
      setPhase("transitioning");
      localStorage.setItem(INTRO_PLAYED_KEY, "true");
      setTimeout(() => {
        setPhase("background");
        onIntroComplete();
      }, 1200);
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
        }, 1200);
      }
    }, 6000);
    return () => clearTimeout(t);
  }, [phase, onIntroComplete]);

  const isIntro = phase === "intro";
  const isTrans = phase === "transitioning";

  return (
    <>
      {/* Video layer */}
      <div className="fixed inset-0 overflow-hidden" style={{ zIndex: isIntro || isTrans ? 50 : -2 }}>
        <motion.div
          className="absolute inset-0"
          animate={{
            scale: isIntro ? 1.06 : 1,
            filter: phase === "background"
              ? "blur(0px) brightness(0.5)"
              : isTrans
                ? "blur(6px) brightness(0.45)"
                : "blur(0px) brightness(0.75)",
          }}
          transition={{ duration: 1.2, ease: cubicSmooth }}
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

        {/* Gradient overlay — cinematic vignette */}
        <motion.div
          className="absolute inset-0"
          animate={{
            opacity: phase === "background" ? 1 : isTrans ? 0.8 : 0.4,
          }}
          transition={{ duration: 1.2, ease: cubicSmooth }}
          style={{
            background: `
              radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%),
              linear-gradient(to top, rgba(22,19,17,0.7) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      {/* Intro branding overlay — logo reveal */}
      <AnimatePresence>
        {(isIntro || isTrans) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 51 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: cubicSlow }}
          >
            {/* Particles */}
            {particles.map((p) => (
              <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />
            ))}

            <motion.div
              className="flex flex-col items-center text-center"
              animate={{ opacity: isTrans ? 0 : 1, y: isTrans ? -30 : 0 }}
              transition={{ duration: 0.8, ease: cubicSmooth }}
            >
              {/* Logo image — scales in with a glow pulse */}
              <motion.div
                className="relative mb-6"
                initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
                animate={{
                  opacity: isTrans ? 0 : 1,
                  scale: isTrans ? 0.8 : 1,
                  rotateY: 0,
                }}
                transition={{
                  duration: 1,
                  delay: 0.2,
                  ease: cubicSmooth,
                }}
              >
                {/* Glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.6, 0.3],
                    scale: [0.8, 1.15, 1.05],
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.6,
                    ease: "easeOut",
                  }}
                  style={{
                    boxShadow: "0 0 60px 20px hsla(38, 65%, 55%, 0.35), 0 0 120px 40px hsla(38, 65%, 55%, 0.15)",
                  }}
                />
                <img
                  src={terraLogo}
                  alt="Terra Farming"
                  className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl relative z-10"
                />
              </motion.div>

              {/* Title — staggered letter reveal */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
                style={{
                  textShadow: "0 4px 30px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)",
                }}
                initial={{ opacity: 0, y: 24, clipPath: "inset(0 0 100% 0)" }}
                animate={{
                  opacity: isTrans ? 0 : 1,
                  y: isTrans ? -10 : 0,
                  clipPath: "inset(0 0 0% 0)",
                }}
                transition={{ duration: 0.9, delay: 0.5, ease: cubicSmooth }}
              >
                Terra Farming
              </motion.h1>

              {/* Tagline — slides up with a gold underline accent */}
              <motion.div
                className="mt-4 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: isTrans ? 0 : 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <motion.p
                  className="text-lg md:text-xl lg:text-2xl text-white/85 font-light tracking-wide"
                  style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: isTrans ? 0 : 0.9,
                    y: isTrans ? -8 : 0,
                  }}
                  transition={{ duration: 0.6, delay: 1.3, ease: cubicSmooth }}
                >
                  From Dirt to Dessert
                </motion.p>

                {/* Gold accent line */}
                <motion.div
                  className="mt-3 h-[2px] rounded-full bg-terra-gold/70"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: isTrans ? 0 : 80,
                    opacity: isTrans ? 0 : 1,
                  }}
                  transition={{ duration: 0.8, delay: 1.6, ease: cubicSmooth }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoIntro;
