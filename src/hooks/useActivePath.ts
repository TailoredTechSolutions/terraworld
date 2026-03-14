import { useLocation } from "react-router-dom";

/**
 * Returns helpers for checking if a path is the current active route.
 * Supports exact match and prefix match for nested routes.
 */
export function useActivePath() {
  const { pathname } = useLocation();

  const isExact = (path: string) => pathname === path;

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(path + "/");
  };

  return { pathname, isExact, isActive };
}
