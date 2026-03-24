import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TRANSITION_VIDEO = "/videos/hero-background.mp4";
const VIDEO_DURATION_MS = 3000;

interface VideoTransitionOverlayProps {
  isActive: boolean;
  targetPath: string;
  onComplete: () => void;
}

const VideoTransitionOverlay = ({ isActive, targetPath, onComplete }: VideoTransitionOverlayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const hasNavigated = useRef(false);

  const finish = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    navigate(targetPath);
    setTimeout(onComplete, 200);
  }, [navigate, targetPath, onComplete]);

  useEffect(() => {
    if (!isActive) {
      hasNavigated.current = false;
      return;
    }

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => finish());
    }

    const fallback = setTimeout(finish, VIDEO_DURATION_MS + 500);
    return () => clearTimeout(fallback);
  }, [isActive, finish]);

  return (
    <AnimatePresence>
      {isActive && (
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
  );
};

export const useVideoTransition = () => {
  const [state, setState] = useState<{ active: boolean; target: string }>({
    active: false,
    target: "",
  });

  const trigger = useCallback((targetPath: string) => {
    setState({ active: true, target: targetPath });
  }, []);

  const overlay = (
    <VideoTransitionOverlay
      isActive={state.active}
      targetPath={state.target}
      onComplete={() => setState({ active: false, target: "" })}
    />
  );

  return [trigger, overlay] as const;
};

export default VideoTransitionOverlay;
