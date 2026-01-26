import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/60 backdrop-blur-md py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-6">
          
          {/* Main Info Row */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[13px] font-medium text-muted-foreground/90 tracking-tight">
            <span>© 2026 MindEase</span>
            <span className="hidden md:inline text-border">|</span>
            <div className="flex items-center gap-1.5">
              <span>Built with</span>
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/10 animate-pulse" />
              <span>for mental wellness</span>
              <span className="text-foreground/60">— Team MindEase</span>
            </div>
          </div>

          {/* Separator Line */}
          <div className="h-px w-12 bg-border/60" />

          {/* Disclaimer */}
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground/60 max-w-lg text-center leading-relaxed italic">
            Designed for emotional well-being and self-reflection. 
            <br className="hidden sm:block" />
            Not a substitute for professional medical advice.
          </p>
          
        </div>
      </div>
    </footer>
  );
}