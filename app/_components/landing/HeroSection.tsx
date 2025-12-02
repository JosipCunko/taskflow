"use client";
import Link from "next/link";
import { m as motion } from "framer-motion";
import GlitchText from "../animations/GlitchText";
import DecryptedText from "../animations/DecryptedText";
import GridAndDotsBackground from "../animations/GridAndDotsBackground";
import { useEffect, useState } from "react";

export default function HeroSection() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative min-h-[90vh] flex flex-col justify-center items-center text-center bg-background-700 overflow-hidden pt-20 pb-10">
      <GridAndDotsBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-700/50 to-background-700 z-0 pointer-events-none"></div>

      {/* HUD Elements */}
      <div className="absolute top-24 left-6 hidden md:block text-xs font-mono text-primary-500/60 z-20">
        <div className="flex flex-col space-y-1">
          <div>SYS.STATUS: ONLINE</div>
          <div>SEC.LEVEL: MAX</div>
          <div>MEM.USAGE: 14%</div>
        </div>
      </div>
      
      <div className="absolute top-24 right-6 hidden md:block text-xs font-mono text-primary-500/60 z-20 text-right">
        <div className="flex flex-col space-y-1">
          <div>TIME: {currentTime}</div>
          <div>LOC: UNKNOWN</div>
          <div>USR: GUEST</div>
        </div>
      </div>

      {/* Decorative Border Frame */}
      <div className="absolute inset-4 sm:inset-8 border border-primary-500/10 rounded-3xl pointer-events-none z-10 hidden sm:block">
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary-500/40 rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary-500/40 rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary-500/40 rounded-bl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary-500/40 rounded-br-3xl"></div>
      </div>

      <div className="space-y-8 container mx-auto max-w-4xl text-pretty px-6 relative z-30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="inline-block px-3 py-1 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-xs font-mono mb-4 uppercase tracking-widest"
        >
          System Ready v2.0
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="grid place-items-center"
        >
          <h1 className="relative">
             <span className="absolute -inset-1 blur-2xl bg-primary-500/20 rounded-full"></span>
             <GlitchText
              enableOnHover={false}
              speed={2.5}
              className="relative text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter text-text-high drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]"
            >
              TASKFLOW
            </GlitchText>
          </h1>
          <p className="text-primary-400 font-mono mt-2 text-sm sm:text-base tracking-widest uppercase opacity-80">
            &lt; Master Your Productivity /&gt;
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <DecryptedText
            text="Initialize your workflow. Organize, prioritize, and execute tasks with military-grade precision. The ultimate command center for your daily operations."
            animateOn="view"
            sequential
            useOriginalCharsOnly
            maxIterations={20}
            encryptedClassName="text-lg md:text-xl text-text-low max-w-2xl mx-auto leading-relaxed font-light"
            className="text-lg md:text-xl text-text-low max-w-2xl mx-auto leading-relaxed font-light"
          />
        </motion.div>

        <motion.div
          className="mt-8 grid place-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <Link
            href="/login"
            className="relative group inline-flex items-center justify-center overflow-hidden rounded-none"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-600 to-primary-500 opacity-20 group-hover:opacity-30 transition-opacity"></span>
            <span className="absolute top-0 left-0 w-full h-[1px] bg-primary-400"></span>
            <span className="absolute bottom-0 right-0 w-full h-[1px] bg-primary-400"></span>
            <span className="absolute left-0 bottom-0 w-[1px] h-full bg-primary-400"></span>
            <span className="absolute right-0 top-0 w-[1px] h-full bg-primary-400"></span>
            
            <span className="relative px-10 py-4 bg-background-700/50 backdrop-blur-sm text-primary-300 font-mono text-lg font-bold tracking-wider uppercase hover:text-primary-200 transition-colors flex items-center gap-3">
              <span className="w-2 h-2 bg-primary-500 animate-pulse"></span>
              Initialize_Sequence
              <span className="w-2 h-2 bg-primary-500 animate-pulse"></span>
            </span>
          </Link>
        </motion.div>
      </div>
    </header>
  );
}
