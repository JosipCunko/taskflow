"use client";

import Link from "next/link";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import HeroAnimatedBackground from "../animations/HeroAnimatedBackground";

export default function HeroSection() {
  return (
    <header className="relative py-20 md:py-32 lg:py-40 text-center bg-gradient-to-br from-background-700 via-background-650 to-background-600 overflow-hidden">
      <HeroAnimatedBackground />

      <div className="container mx-auto px-6 relative z-10">
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Conquer Your Day with{" "}
          <motion.span
            className="block sm:inline text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-accent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            TaskFlow
          </motion.span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-text-low max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          Organize, prioritize, and achieve your goals with ultimate discipline
          and control. Transform your productivity and master your schedule like
          never before.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center items-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
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
        </motion.div>
      </div>
    </header>
  );
}
