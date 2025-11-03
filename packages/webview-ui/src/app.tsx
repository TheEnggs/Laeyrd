"use client";

import { useEffect } from "react";
import { SettingsProvider } from "@webview/contexts/settings-context";
import { AuthProvider } from "@webview/components/auth-provider";
import HeroSection from "@webview/components/hero-section";
import CustomizationTabs from "@webview/components/customization-tabs";
import { Toaster } from "@webview/components/ui/sonner";
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
