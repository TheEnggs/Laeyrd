import { Coffee } from "lucide-react";
import { VSCodeMessenger } from "../hooks/use-vscode-messenger";

export default function HeroSection() {
  const { postMessage } = VSCodeMessenger();
  const openDonation = () => postMessage({ command: "OPEN_DONATION" });
  return (
    <section className="text-center py-8 relative">
      <div className="relative max-w-4xl mx-auto">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground shadow-xs">
          <Coffee size={14} className="opacity-80" />
          <span className="hidden sm:inline">Fuel the theme wizardry</span>
          <button
            onClick={openDonation}
            className="ml-1 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground hover:opacity-90 active:opacity-100"
            aria-label="Donate"
          >
            Donate
          </button>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground tracking-tight">
          Transform Your Development Experience
        </h2>

        <p className=" text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Fine-tune every aspect of your VSCode environment. From editor colors
          to terminal fonts, create the perfect coding atmosphere that matches
          your style and boosts your productivity.
        </p>
      </div>
    </section>
  );
}
