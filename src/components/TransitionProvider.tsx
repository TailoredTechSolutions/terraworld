import { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TRANSITION_VIDEO = "/videos/hero-background.mp4";
const INTRO_PLAYED_KEY = "terra_intro_played";
const VIDEO_DURATION_MS = 3000;

type TransitionTrigger = "first_visit" | "sign_in" | "sign_out" | "route_change";

interface TransitionContextType {
  triggerTransition: (reason: TransitionTrigger, callback?: () => void) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export const useTransition = () => {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used within TransitionProvider");
  return ctx;
};

export const TransitionProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(false);
  const callbackRef = useRef<(() => void) | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasFinished = useRef(false);
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const isFirstRender = useRef(true);

  // First visit: show intro immediately
  const [firstVisitPending] = useState(() => {
    if (typeof window === "undefined") return false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const alreadyPlayed = localStorage.getItem(INTRO_PLAYED_KEY);
    return !alreadyPlayed && !reducedMotion;
  });

  const finish = useCallback(() => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    callbackRef.current?.();
    callbackRef.current = null;
    setTimeout(() => setActive(false), 300);
  }, []);

  const triggerTransition = useCallback((reason: TransitionTrigger, callback?: () => void) => {
    callbackRef.current = callback || null;
    hasFinished.current = false;
    setActive(true);
    if (reason === "first_visit") {
      localStorage.setItem(INTRO_PLAYED_KEY, "true");
    }
  }, []);

  // First visit auto-trigger
  useEffect(() => {
    if (firstVisitPending) {
      hasFinished.current = false;
      setActive(true);
      localStorage.setItem(INTRO_PLAYED_KEY, "true");
    }
  }, [firstVisitPending]);

  // Route change auto-trigger (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      // Don't stack transitions
      if (!active) {
        hasFinished.current = false;
        setActive(true);
      }
    }
  }, [location.pathname, active]);

  // Play video when active
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
    const fallback = setTimeout(finish, VIDEO_DURATION_MS + 500);
    return () => clearTimeout(fallback);
  }, [active, finish]);

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning: active }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
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
