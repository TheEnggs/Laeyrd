"use client";

import { SettingsProvider } from "./contexts/settings-context";
import HeroSection from "./components/hero-section";
import CustomizationTabs from "./components/customization-tabs";
import Header from "./components/floating-save";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-6 py-6 space-y-8 pb-32">
          <HeroSection />
          <CustomizationTabs />
        </div>
        <Header />
        <Toaster />
      </div>
    </SettingsProvider>
  );
}
