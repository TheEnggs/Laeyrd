"use client";

import { useEffect } from "react";
import { SettingsProvider } from "./contexts/settings-context";
import { HistoryProvider } from "./contexts/history-context";
import { AuthProvider } from "./components/auth-provider";
import HeroSection from "./components/hero-section";
import CustomizationTabs from "./components/customization-tabs";
import FloatingSave from "./components/floating-save";
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
        <HistoryProvider>
          <div className="min-h-screen bg-background text-foreground">
            <div className="p-4 flex flex-col gap-4">
              <HeroSection />
              <CustomizationTabs />
            </div>
            <FloatingSave />
            <Toaster />
          </div>
        </HistoryProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
