// Must be when using framer-motion
"use client";
import DecryptedText from "../animations/DecryptedText";
import { LucideIcon, Zap } from "lucide-react";
import { features } from "@/app/_utils/landingPageUtils";
import { motion } from "framer-motion";

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background-700">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-block p-3 mb-4 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-primary-400 text-glow" />
          </div>
          <h2 className="text-3xl sm:text-4xl text-glow">
            System Core Features
          </h2>
          <p className="text-text-low mt-4 max-w-xl mx-auto text-base sm:text-lg">
            <DecryptedText
              text="Everything you need to master your tasks and boost your productivity, wrapped in a smart and intuitive interface."
              animateOn="view"
              sequential
              useOriginalCharsOnly
              maxIterations={20}
            />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.label}
              icon={feature.icon}
              label={feature.label}
              description={feature.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  label,
  description,
  index,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      className="group relative bg-background-650/50 p-6 rounded-xl border border-primary-500/10 shadow-lg hover:border-primary-500/30 transition-all duration-300 h-full overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="relative z-10">
        <div className="p-3 mb-4 inline-block bg-primary-500/10 rounded-lg border border-primary-500/20 group-hover:bg-primary-500/20 transition-colors">
          <Icon className="w-7 h-7 text-primary-400 group-hover:text-glow transition-all" />
        </div>
        <h3 className="text-xl font-bold text-text-high mb-2">{label}</h3>

        <DecryptedText
          text={description}
          animateOn="view"
          sequential
          useOriginalCharsOnly
          maxIterations={20}
          className="text-text-low text-sm leading-relaxed flex-grow"
          encryptedClassName="text-text-low text-sm leading-relaxed flex-grow"
        />
      </div>

      <div className="absolute top-2 right-2 text-primary-500/40 text-sm font-mono">
        0{index + 1}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-500/30 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </motion.div>
  );
}
