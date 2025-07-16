"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import GlitchText from "../animations/GlitchText";
import DecryptedText from "../animations/DecryptedText";
import GridAndDotsBackground from "../animations/GridAndDotsBackground";

export default function HeroSection() {
  return (
    <header className="relative py-20 md:py-32 lg:py-40 text-center bg-background-700 overflow-hidden">
      <GridAndDotsBackground />
      <div className="absolute inset-0 bg-gradient-to-t from-background-700 via-background-700/80 to-transparent z-0"></div>

      <div className=" container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="grid place-items-center"
        >
          <GlitchText
            enableOnHover={false}
            speed={2.2}
            className="mb-6 text-xl tracking-tight"
          >
            Conquer Your Day
          </GlitchText>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <DecryptedText
            text="Organize, prioritize, and achieve your goals with ultimate discipline and control. Transform your productivity and master your schedule like never before."
            animateOn="view"
            sequential
            useOriginalCharsOnly
            maxIterations={20}
            encryptedClassName="text-lg md:text-xl text-text-low max-w-2xl mx-auto mb-10 leading-relaxed"
            className="text-lg md:text-xl text-text-low max-w-2xl mx-auto mb-10 leading-relaxed"
          />
        </motion.div>

        <motion.div
          className="mt-2 grid place-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link
            href="/login"
            className="group inline-flex items-center justify-center text-base font-semibold text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/50 shadow-lg hover:shadow-primary-500/20 focus:ring-4 focus:ring-primary-500/50 rounded-lg px-8 py-3.5 transition-all duration-300"
          >
            &gt; Initiate Sequence
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
