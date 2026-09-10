import type { Metadata } from "next";
import Link from "next/link";
import GridAndDotsBackground from "./_components/animations/GridAndDotsBackground";
import GlitchText from "./_components/animations/GlitchText";
import BrandMark from "./_components/BrandMark";
import { SITE_HOST } from "./_lib/site";

export const metadata: Metadata = {
  title: "404 — Signal Lost",
  description:
    "This route does not exist. Return to Prioritron's command center.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background-700 overflow-hidden px-4 py-16">
      <GridAndDotsBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-700/50 to-background-700 z-0 pointer-events-none" />

      <div className="absolute inset-4 sm:inset-8 border border-primary-500/10 rounded-3xl pointer-events-none z-10 hidden sm:block">
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary-500/40 rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary-500/40 rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary-500/40 rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary-500/40 rounded-br-3xl" />
      </div>

      <div className="absolute top-8 left-6 hidden md:block text-xs font-mono text-primary-500/60 z-20">
        <div className="flex flex-col space-y-1">
          <div>ERR.CODE: 404</div>
          <div>SYS.STATUS: ROUTE_MISSING</div>
          <div>SEC.LEVEL: MAX</div>
        </div>
      </div>

      <div className="absolute top-8 right-6 hidden md:block text-xs font-mono text-primary-500/60 z-20 text-right">
        <div className="flex flex-col space-y-1">
          <div>HOST: {SITE_HOST}</div>
          <div>LOC: UNKNOWN</div>
          <div>USR: GUEST</div>
        </div>
      </div>

      <div className="relative z-30 w-full max-w-xl flex flex-col items-center text-center">
        <Link
          href="/"
          aria-label="Prioritron home"
          className="mb-8 group shrink-0"
        >
          <BrandMark className="group-hover:opacity-90 transition-opacity" />
        </Link>

        <div className="inline-block px-3 py-1 rounded-full border border-error/40 bg-error/10 text-error text-xs font-mono mb-6 uppercase tracking-widest">
          Diagnostic_Report
        </div>

        <div className="relative mb-2">
          <span className="absolute -inset-4 blur-3xl bg-primary-500/15 rounded-full pointer-events-none" />
          <GlitchText
            enableOnHover={false}
            speed={2.2}
            className="relative text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-text-high drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
          >
            404
          </GlitchText>
        </div>

        <h1 className="text-primary-400 font-mono mt-1 text-sm sm:text-base tracking-widest uppercase opacity-90">
          &lt; Signal_Lost /&gt;
        </h1>

        <p className="text-text-low text-base sm:text-lg mt-4 mb-8 max-w-md leading-relaxed">
          The requested route is not mapped in this sector. Trace terminated.
        </p>

        <div className="w-full bg-background-700 border border-primary-500/30 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(14,165,233,0.15)] text-left mb-10">
          <div className="bg-background-600/80 border-b border-primary-500/20 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs font-mono text-primary-400/80 tracking-wider uppercase">
              scan.exe
            </div>
            <div className="w-10" />
          </div>
          <div className="p-5 font-mono text-sm relative">
            <div className="absolute inset-0 bg-primary-500/5 pointer-events-none" />
            <div className="relative z-10 space-y-1.5 text-text-low">
              <p>
                <span className="text-primary-400">$</span> locate requested_path
              </p>
              <p>
                <span className="text-error">ERR</span> 404 — NO_ROUTE
              </p>
              <p>TRACE terminated · sector unmapped</p>
              <p>
                suggestion: return to{" "}
                <span className="text-primary-300">command_center</span>
              </p>
              <p className="pt-1">
                <span className="text-primary-400">$</span>{" "}
                <span className="inline-block w-2 h-4 bg-primary-400 align-middle animate-pulse" />
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="relative group inline-flex items-center justify-center overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-600 to-primary-500 opacity-20 group-hover:opacity-30 transition-opacity" />
            <span className="absolute top-0 left-0 w-full h-px bg-primary-400" />
            <span className="absolute bottom-0 right-0 w-full h-px bg-primary-400" />
            <span className="absolute left-0 bottom-0 w-px h-full bg-primary-400" />
            <span className="absolute right-0 top-0 w-px h-full bg-primary-400" />
            <span className="relative px-8 py-3 bg-background-700/50 backdrop-blur-sm text-primary-300 font-mono text-sm sm:text-base font-bold tracking-wider uppercase hover:text-primary-200 transition-colors flex items-center gap-3">
              <span className="w-2 h-2 bg-primary-500 animate-pulse" />
              Return_To_Base
              <span className="w-2 h-2 bg-primary-500 animate-pulse" />
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm font-mono font-semibold text-text-low hover:text-primary-300 border border-primary-500/20 hover:border-primary-500/50 px-8 py-3 transition-all duration-200"
          >
            &gt; Execute_Login
          </Link>
        </div>
      </div>
    </div>
  );
}
