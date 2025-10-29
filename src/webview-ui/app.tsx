"use client";

import { useEffect } from "react";
import { SettingsProvider } from "./contexts/settings-context";
import { AuthProvider } from "./components/auth-provider";
import HeroSection from "./components/hero-section";
import CustomizationTabs from "./components/customization-tabs";
import { Toaster } from "./components/ui/sonner";
import { startListeners, stopListeners } from "@webview/lib/listeners";

export default function App() {
  useEffect(() => {
    startListeners();
    return () => {
      stopListeners();
    };
  }, []);

  return (
    <AuthProvider>
      <SettingsProvider>
        <div className="min-h-screen bg-background text-foreground">
          <div className="p-4 flex flex-col gap-4">
            <HeroSection />
            <CustomizationTabs />
          </div>
          <Toaster />
        </div>
      </SettingsProvider>
    </AuthProvider>
  );
}
