"use client";

import { useEffect } from "react";
import { DraftProvider } from "@/contexts/draft-context";
import { AuthProvider } from "@/components/auth-provider";
import HeroSection from "@/components/hero-section";
import CustomizationTabs from "@/components/customization-tabs";
import { Toaster } from "@/components/ui/sonner";
import { startListeners, stopListeners } from "@/lib/listeners";

export default function App() {
  useEffect(() => {
    startListeners();
    return () => {
      stopListeners();
    };
  }, []);

  return (
    <AuthProvider>
      <DraftProvider>
        <div className="min-h-screen bg-background text-foreground">
          <div className="p-4 flex flex-col gap-4">
            <HeroSection />
            <CustomizationTabs />
          </div>
          <Toaster />
        </div>
      </DraftProvider>
    </AuthProvider>
  );
}
