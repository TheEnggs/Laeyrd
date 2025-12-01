"use client";

import { useEffect } from "react";
import { DraftProvider } from "@webview/contexts/draft-context";
import HeroSection from "@webview/components/hero-section";
import { startListeners, stopListeners } from "@webview/lib/listeners";
import CustomizationTabs from "./components/tabs";

export default function App() {
  useEffect(() => {
    startListeners();
    return () => {
      stopListeners();
    };
  }, []);

  return (
    <DraftProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-4 flex flex-col gap-4">
          <HeroSection />
          <CustomizationTabs />
        </div>
      </div>
    </DraftProvider>
  );
}
