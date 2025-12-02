"use client";

import { motion } from "framer-motion";
import { User, Terminal } from "lucide-react";
import LoginForm from "../_components/auth/LoginForm";
import GridAndDotsBackground from "../_components/animations/GridAndDotsBackground";
import DecryptedText from "../_components/animations/DecryptedText";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background-700 overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-[45%] xl:w-[40%] relative z-10 flex flex-col border-r border-primary-500/20 bg-background-700/95 backdrop-blur-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
        <LoginForm />
        <div className="absolute bottom-0 left-0 w-full h-px bg-primary-500/10"></div>
      </div>

      {/* Right Side - Visuals & Testimonial */}
      <div className="hidden md:flex w-1/2 lg:w-[55%] xl:w-[60%] relative items-center justify-center p-8 overflow-hidden bg-background-650">
        <GridAndDotsBackground />

        {/* Tech Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-background-700/80 via-transparent to-background-700/80 z-0 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-50">
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary-500/50 rounded-full"></div>
              <div className="w-2 h-2 bg-primary-500/20 rounded-full"></div>
            </div>
            <div className="font-mono text-xs text-primary-400">
              SECURE_CONNECTION_ESTABLISHED
            </div>
          </div>
        </div>

        <div className="max-w-lg relative z-10">
          {/* Terminal/Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-background-700/50 border border-primary-500/30 rounded-xl p-8 backdrop-blur-md relative overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-primary-500/20 rounded-tl-xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-primary-500/20 rounded-br-xl pointer-events-none"></div>

            <div className="mb-6 flex items-center gap-2 opacity-70">
              <Terminal className="w-5 h-5 text-primary-400" />
              <span className="text-xs font-mono text-primary-300 uppercase tracking-widest">
                User_Testimonial_Log
              </span>
            </div>

            <motion.div
              className="text-xl md:text-2xl text-text-low mb-8 font-light leading-relaxed font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <span className="text-primary-500/50 text-4xl absolute -top-2 -left-2">
                &quot;
              </span>
              <div className="relative z-10">
                <DecryptedText
                  text="Taskflow team is doing some awesome stuff, with a focus on productivity, seamless collaboration, and efficient task management. Organize your work, track progress, and manage tasks effortlessly with intuitive tools designed for teams."
                  animateOn="view"
                  sequential
                  useOriginalCharsOnly
                  maxIterations={5}
                  speed={30}
                />
              </div>
            </motion.div>

            <motion.div
              className="flex items-center border-t border-primary-500/10 pt-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 rounded-full flex items-center justify-center mr-4 relative group overflow-hidden">
                <User className="text-primary-300 relative z-10" />
                <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div>
                <div className="text-text-high font-bold tracking-wide">
                  Josip Čunko
                </div>
                <div className="text-primary-400/60 text-xs font-mono uppercase">
                  Developer
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
