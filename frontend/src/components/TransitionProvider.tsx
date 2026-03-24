import { createContext, useContext, ReactNode } from "react";

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
  const triggerTransition = (_reason: TransitionTrigger, callback?: () => void) => {
    // No-op: transition removed. Execute callback immediately if provided.
    callback?.();
  };

  return (
    <TransitionContext.Provider value={{ triggerTransition, isTransitioning: false }}>
      {children}
    </TransitionContext.Provider>
  );
};
