import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TRANSITION_VIDEO = "/videos/terra-transition.mov";
const INTRO_PLAYED_KEY = "terra_intro_played";

type TransitionTrigger = "first_visit" | "sign_in" | "sign_out";

interface TransitionContextType {
  triggerTransition: (reason: TransitionTrigger, callback?: () => void) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used within TransitionProvider");
  return ctx;
};

/**
 * Global video transition provider.
 * Plays the uploaded 3-second video clip on:
 *   1. First visit (before seeing any content)
 *   2. Any sign-in (any role)
 *   3. Any sign-out (any role)
 */
export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(false);
  const callbackRef = useRef<(() => void) | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasFinished = useRef(false);

  // Check first visit on mount
  const [firstVisitPending, setFirstVisitPending] = useState(() => {
    if (typeof window === "undefined") return false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = localStorage.getItem(INTRO_PLAYED_KEY);
    return !alreadyPlayed && !reducedMotion;
  });

  // Auto-trigger first visit intro
  useEffect(() => {
    if (firstVisitPending) {
      setActive(true);
      localStorage.setItem(INTRO_PLAYED_KEY, "true");
    }
  }, [firstVisitPending]);

  const triggerTransition = useCallback((reason: TransitionTrigger, callback?: () => void) => {
    callbackRef.current = callback || null;
    hasFinished.current = false;
    setActive(true);
    if (reason === "first_visit") {
      localStorage.setItem(INTRO_PLAYED_KEY, "true");
    }
  }, []);

  const finish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    // Execute the callback (e.g. navigation) while overlay is still visible
    callbackRef.current?.();
    callbackRef.current = null;
    if (firstVisitPending) setFirstVisitPending(false);
    // Fade out after a brief delay so the new content renders under
    setTimeout(() => setActive(false), 300);
  }, [firstVisitPending]);

  // When active, play the video
  useEffect(() => {
    if (!active) {
      hasFinished.current = false;
      return;
    }
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => finish());
    }
    // Fallback timer
    const fallback = setTimeout(finish, 4000);
    return () => clearTimeout(fallback);
  }, [active, finish]);

  // Block page content until first-visit intro finishes
  const showChildren = !firstVisitPending;

  return (
    <TransitionContext.Provider value={{ triggerTransition }}>
      {showChildren && children}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[9999] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <video
              ref={videoRef}
              src={TRANSITION_VIDEO}
              className="w-full h-full object-cover"
              muted
              playsInline
              onEnded={finish}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
};
