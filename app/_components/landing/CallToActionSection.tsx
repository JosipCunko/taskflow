import Link from "next/link";
import GridAndDotsBackground from "../animations/GridAndDotsBackground";
import GlitchText from "../animations/GlitchText";

export default function CallToActionSection() {
  return (
    <section className="relative py-16 md:py-24 bg-background-700 overflow-hidden">
      <GridAndDotsBackground />
      <div className="absolute inset-0 bg-gradient-to-t from-background-700 via-background-700/80 to-transparent z-0"></div>

      <div className="container mx-auto px-6 relative z-10 grid place-items-center">
        <GlitchText
          enableOnHover={false}
          speed={2.2}
          className="text-3xl md:text-5xl tracking-tight mb-6"
        >
          Ready to Deploy?
        </GlitchText>
        <p className="text-text-low mx-auto mb-8 text-base max-w-xl  leading-relaxed text-center text-balance">
          Your journey to peak productivity is one click away. Authorize and
          engage.
        </p>
        <Link
          href="/login"
          className="group inline-flex items-center justify-center text-lg font-semibold text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 border-2 border-primary-500/50 shadow-lg hover:shadow-primary-500/20 focus:ring-4 focus:ring-primary-500/50 rounded-lg px-10 py-4 transition-all duration-300 transform hover:scale-105"
        >
          &gt; Execute_Login
        </Link>
      </div>
    </section>
  );
}
