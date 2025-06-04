import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function HeroSection() {
  return (
    <header className="relative py-20 md:py-32 lg:py-40 text-center bg-gradient-to-br from-background-700 via-background-650 to-background-600 overflow-hidden">
      {/* Decorative background elements - consider making these more unique if possible */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="smallGridHero"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="var(--color-primary-500, #3b82f6)" // Fallback color
                strokeWidth="0.3"
              ></path>
            </pattern>
            <pattern
              id="gridHero"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <rect width="100" height="100" fill="url(#smallGridHero)"></rect>
              <path
                d="M 100 0 L 0 0 0 100"
                fill="none"
                stroke="var(--color-primary-600, #2563eb)" // Fallback color
                strokeWidth="0.5"
              ></path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridHero)"></rect>
        </svg>
      </div>
      <div className="absolute top-10 left-10 w-52 h-52 md:w-72 md:h-72 bg-primary-500/10 rounded-full filter blur-3xl opacity-40 animate-pulse-slow"></div>
      <div className="absolute bottom-10 right-10 w-52 h-52 md:w-72 md:h-72 bg-accent/10 rounded-full filter blur-3xl opacity-40 animate-pulse-slower"></div>

      <div className="container mx-auto px-6 relative z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
          Conquer Your Day with{" "}
          <span className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-accent">
            TaskFlow
          </span>
        </h1>
        <p className="text-lg md:text-xl text-text-low max-w-2xl mx-auto mb-10 leading-relaxed">
          Organize, prioritize, and achieve your goals with ultimate discipline
          and control. Transform your productivity and master your schedule like
          never before.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/login" // Or /webapp based on auth status
            className="inline-flex items-center justify-center text-base font-semibold text-white bg-primary-500 hover:bg-primary-600 shadow-lg hover:shadow-primary-500/40 focus:ring-4 focus:ring-primary-500/50 rounded-lg px-8 py-3.5 transition-all duration-300 transform hover:scale-105"
          >
            Start Flowing <MoveRight className="w-5 h-5 ml-2" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center text-base font-semibold text-text-high bg-background-500 hover:bg-background-600 border border-divider focus:ring-4 focus:ring-divider/50 rounded-lg px-8 py-3.5 transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>
    </header>
  );
}
