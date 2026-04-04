import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { TransitionProvider } from "@/components/TransitionProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AnimatedRoutes from "./components/AnimatedRoutes";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

// Google OAuth Client ID - fetched from environment or backend
const GOOGLE_CLIENT_ID = "163392845598-5q8moo3idrec9fsi57i8ubguqlhc5oi6.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TransitionProvider>
              <AuthProvider>
                <ScrollToTop />
                <AnimatedRoutes />
              </AuthProvider>
            </TransitionProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
