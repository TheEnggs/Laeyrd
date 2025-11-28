"use client";

import { useEffect } from "react";
import { DraftProvider } from "@/contexts/draft-context";
import HeroSection from "@/components/hero-section";
import { Toaster } from "@/components/ui/sonner";
import { startListeners, stopListeners } from "@/lib/listeners";
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
        <Toaster />
      </div>
    </DraftProvider>
  );
}
