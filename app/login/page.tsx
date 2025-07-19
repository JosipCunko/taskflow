"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import AnimatedBackground from "../_components/animations/AnimatedBackground";
import LoginForm from "../_components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background-600">
      <LoginForm />

      <div className="hidden md:flex w-full bg-background-700 items-center justify-center p-8 relative overflow-hidden">
        <AnimatedBackground />

        <div className="max-w-md relative z-10">
          <motion.p
            className="text-xl text-text-low mb-6 italic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Taskflow team is doing some awesome stuff, with a focus on
            productivity, seamless collaboration, and efficient task management.
            Organize your work, track progress, and manage tasks effortlessly
            with intuitive tools designed for teams.
          </motion.p>
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="w-10 h-10 bg-background-500 rounded-full flex items-center justify-center mr-3">
              <User color="#cbd5e1" />
            </div>
            <span className="text-text-low">Josip Čunko </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
