import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { LOGO as terraLogo } from "@/lib/siteImages";

const INTRO_PLAYED_KEY = "terra_intro_played";

const spring = { type: "spring", stiffness: 80, damping: 18, mass: 1 } as const;
const cubicSmooth = [0.22, 1, 0.36, 1] as const;

// Organic floating particles — seeded so they're stable across renders
const PARTICLES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i / 24) * Math.PI * 2;
  const radius = 28 + (i % 3) * 14;
  return {
    id: i,
    delay: i * 0.09,
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
    size: 3 + (i % 4) * 2,
    drift: 12 + (i % 5) * 6,
  };
});

const Particle = ({ p }: { p: (typeof PARTICLES)[0] }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: p.size,
      height: p.size,
      background: `radial-gradient(circle, hsla(38,68%,60%,0.6) 0%, hsla(38,68%,55%,0) 70%)`,
    }}
    initial={{ opacity: 0, x: `${p.x}%`, y: `${p.y}%`, scale: 0 }}
    animate={{
      opacity: [0, 0.9, 0],
      y: [`${p.y}%`, `${p.y - p.drift}%`],
      x: [`${p.x}%`, `${p.x + (p.id % 2 === 0 ? 3 : -3)}%`],
      scale: [0, 1.5, 0],
    }}
    transition={{
      duration: 2.8 + (p.id % 3) * 0.4,
      delay: 0.4 + p.delay,
      ease: "easeOut",
    }}
  />
);

const VideoIntro = ({ onIntroComplete }: { onIntroComplete: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"intro" | "transitioning" | "background">("intro");
  const progress = useMotionValue(0);
  const videoScale = useTransform(progress, [0, 0.7, 1], [1.08, 1.04, 1]);
  const videoBrightness = useTransform(progress, [0, 0.6, 1], [0.78, 0.45, 0.5]);
  const videoBlur = useTransform(progress, [0, 0.6, 1], [0, 8, 0]);

  // Skip for returning visitors / reduced motion
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = localStorage.getItem(INTRO_PLAYED_KEY);
    if (alreadyPlayed || reducedMotion) {
      progress.set(1);
      setPhase("background");
      onIntroComplete();
    }
  }, [onIntroComplete, progress]);

  const triggerTransition = useCallback(() => {
    if (phase !== "intro") return;
    setPhase("transitioning");
    localStorage.setItem(INTRO_PLAYED_KEY, "true");

    // Animate progress 0→1 over 1.4s for buttery video transition
    animate(progress, 1, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });

    setTimeout(() => {
      setPhase("background");
      onIntroComplete();
    }, 1400);
  }, [phase, onIntroComplete, progress]);

  // Video time trigger
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || phase !== "intro") return;
    if (video.currentTime >= 4) triggerTransition();
  }, [phase, triggerTransition]);

  // Fallback safety timer
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(triggerTransition, 6000);
    return () => clearTimeout(t);
  }, [phase, triggerTransition]);

  const isIntro = phase === "intro";
  const isTrans = phase === "transitioning";

  return (
    <>
      {/* ─── Video Background Layer ─── */}
      <div
        className="fixed inset-0 overflow-hidden"
        style={{ zIndex: isIntro || isTrans ? 50 : -2 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            scale: videoScale,
            filter: useTransform(
              [videoBrightness, videoBlur],
              ([b, bl]) => `brightness(${b}) blur(${bl}px)`
            ),
          }}
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

        {/* Cinematic vignette + bottom gradient */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: phase === "background" ? 1 : isTrans ? 0.85 : 0.35,
          }}
          transition={{ duration: 1.4, ease: cubicSmooth }}
          style={{
            background: `
              radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, rgba(0,0,0,0.55) 100%),
              linear-gradient(to top, rgba(22,19,17,0.75) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* ─── Intro Branding Overlay ─── */}
      <AnimatePresence>
        {(isIntro || isTrans) && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 51 }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: cubicSmooth }}
          >
            {/* Floating particles */}
            {PARTICLES.map((p) => (
              <Particle key={p.id} p={p} />
            ))}

            <motion.div
              className="flex flex-col items-center text-center px-4"
              animate={{
                opacity: isTrans ? 0 : 1,
                y: isTrans ? -40 : 0,
                scale: isTrans ? 0.92 : 1,
              }}
              transition={{ duration: 1, ease: cubicSmooth }}
            >
              {/* ── Logo Reveal ── */}
              <motion.div
                className="relative mb-8"
                initial={{ opacity: 0, scale: 0.3, y: 30 }}
                animate={{
                  opacity: isTrans ? 0 : 1,
                  scale: isTrans ? 0.7 : 1,
                  y: 0,
                }}
                transition={spring}
              >
                {/* Outer glow pulse */}
                <motion.div
                  className="absolute -inset-8 rounded-full"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 0.5, 0.25, 0.35],
                    scale: [0.5, 1.3, 1.15, 1.2],
                  }}
                  transition={{
                    duration: 3,
                    delay: 0.4,
                    ease: "easeOut",
                    times: [0, 0.4, 0.7, 1],
                  }}
                  style={{
                    background:
                      "radial-gradient(circle, hsla(38,68%,58%,0.3) 0%, hsla(38,68%,55%,0.1) 50%, transparent 70%)",
                  }}
                />

                {/* Light sweep across logo */}
                <motion.div
                  className="absolute inset-0 z-20 overflow-hidden rounded-3xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <motion.div
                    className="absolute inset-y-0 w-1/3"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
                    }}
                    initial={{ x: "-100%" }}
                    animate={{ x: "400%" }}
                    transition={{
                      duration: 1.6,
                      delay: 1,
                      ease: [0.25, 0.8, 0.25, 1],
                    }}
                  />
                </motion.div>

                <motion.img
                  src={terraLogo}
                  alt="Terra Farming"
                  className="w-32 h-32 md:w-40 md:h-40 object-contain relative z-10"
                  style={{
                    filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
                  }}
                  initial={{ rotateY: -40, rotateX: 10 }}
                  animate={{ rotateY: 0, rotateX: 0 }}
                  transition={{ ...spring, delay: 0.1 }}
                />
              </motion.div>

              {/* ── Title with clip-path reveal ── */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight"
                style={{
                  textShadow:
                    "0 4px 40px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
                  fontFamily: "'Playfair Display', serif",
                }}
                initial={{
                  opacity: 0,
                  y: 30,
                  clipPath: "inset(0 0 100% 0)",
                }}
                animate={{
                  opacity: isTrans ? 0 : 1,
                  y: isTrans ? -16 : 0,
                  clipPath: isTrans
                    ? "inset(100% 0 0 0)"
                    : "inset(0 0 0% 0)",
                }}
                transition={{ duration: 1, delay: 0.6, ease: cubicSmooth }}
              >
                Terra Farming
              </motion.h1>

              {/* ── Tagline + gold accent ── */}
              <motion.div
                className="mt-5 flex flex-col items-center gap-3"
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: isTrans ? 0 : 1,
                  y: isTrans ? -10 : 0,
                }}
                transition={{ duration: 0.7, delay: 1.2, ease: cubicSmooth }}
              >
                <motion.p
                  className="text-lg md:text-xl lg:text-2xl font-light tracking-widest uppercase"
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                    letterSpacing: "0.2em",
                  }}
                >
                  From Dirt to Dessert
                </motion.p>

                {/* Gold divider — expands from center */}
                <motion.div
                  className="h-[2px] rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, hsl(38 68% 58%), transparent)",
                  }}
                  initial={{ width: 0, opacity: 0 }}
                  animate={{
                    width: isTrans ? 0 : 120,
                    opacity: isTrans ? 0 : 0.8,
                  }}
                  transition={{ duration: 1, delay: 1.6, ease: cubicSmooth }}
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
