import { Sparkles, Palette, Code } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="text-center py-8 relative">
      <div className="relative max-w-4xl mx-auto">
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
