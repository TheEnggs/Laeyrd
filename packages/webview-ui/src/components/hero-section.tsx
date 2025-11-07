import { Coffee } from "lucide-react";
import { useMutation } from "@/hooks/use-query";

export default function HeroSection() {
  const { mutate: openDonation } = useMutation("OPEN_DONATION");
  return (
    <>
      {/* <div className="absolute top-6 right-24 mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground shadow-xs">
        <Github size={14} className="opacity-80" />
        <span className="hidden sm:inline">Going open source soon</span>
        <a
          href="#"
          className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground hover:opacity-90 active:opacity-100"
          aria-label="Donate"
        >
          Hang tight
          <SquareArrowOutUpRight size={12} />
        </a>
      </div> */}
      <section className="text-center py-2 relative">
        <div className="relative max-w-4xl mx-auto">
          <div className="mb-10 flex items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-secondary-foreground shadow-xs">
              <Coffee size={14} className="opacity-80" />
              <span className="hidden sm:inline">Fuel the Laeyrd</span>
              <button
                onClick={() => openDonation({ command: "OPEN_DONATION" })}
                className="ml-1 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground hover:opacity-90 active:opacity-100"
                aria-label="Donate"
              >
                Donate
              </button>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground tracking-tight">
            Transform Your Development Experience
          </h2>

          <p className=" text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed text-sm">
            Fine-tune every aspect of your VSCode environment. From editor
            colors to terminal fonts, create the perfect coding atmosphere that
            matches your style and boosts your productivity.
          </p>
        </div>
      </section>
    </>
  );
}
