import { useCallback, useRef, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Hook for mobile dashboard scroll-to-section behavior.
 * On mobile, all sections render on one page; sidebar clicks scroll to sections.
 * On desktop, behavior is unchanged (tab-based).
 */
export const useMobileDashboard = () => {
  const isMobile = useIsMobile();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const registerSection = useCallback((id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return {
    isMobile,
    registerSection,
    scrollToSection,
  };
};
