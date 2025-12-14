// Must be when using framer-motion
"use client";
import DecryptedText from "../animations/DecryptedText";
import { Terminal } from "lucide-react";
import { features } from "@/app/_utils/utils";
import TerminalCard from "./TerminalCard";

export default function Features() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 bg-background-700 relative"
    >
      {/* Background Circuit Lines (Decoration) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary-500/10 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary-500/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block p-3 mb-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <Terminal className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400 text-glow" />
          </div>
          <h2 className="text-3xl sm:text-4xl text-glow font-mono tracking-tight">
            &lt;System_Modules /&gt;
          </h2>
          <p className="text-text-low mt-4 max-w-xl mx-auto text-base sm:text-lg font-mono">
            <DecryptedText
              text="Core functionalities loaded. Optimizing workflow parameters..."
              animateOn="view"
              sequential
              useOriginalCharsOnly
              maxIterations={20}
            />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <TerminalCard
              key={feature.label}
              title={feature.label.replace(/\s+/g, "_").toLowerCase()}
              index={i}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <feature.icon className="w-6 h-6 text-primary-400" />
                  <span className="text-primary-300 font-bold text-lg">
                    {feature.label}
                  </span>
                </div>
                <div className="text-text-low text-sm leading-relaxed font-mono">
                  <DecryptedText
                    text={feature.description}
                    animateOn="view"
                    sequential
                    useOriginalCharsOnly
                    maxIterations={10}
                    className="inline"
                    renderCursor={true}
                  />
                </div>
              </div>
            </TerminalCard>
          ))}
        </div>
      </div>
    </section>
  );
}
