import Link from "next/link";
import { FEATURES } from "./utils";
import { MoveRight, Zap } from "lucide-react";
import Image from "next/image";

const FeatureCard = ({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
}) => {
  return (
    <div className="bg-background-625 p-6 rounded-xl shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col items-start">
      <div className="mb-4 p-3 bg-primary-500/10 rounded-full inline-block">
        <Icon className="w-7 h-7 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-text-high mb-2">{label}</h3>
      <p className="text-text-low text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-700 text-text-high overflow-x-hidden">
      <nav className="py-5 px-6 md:px-10 lg:px-16 sticky top-0 z-50 bg-background-700/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-primary-400 flex items-center"
          >
            <Image
              width={28}
              height={28}
              src={"/icon.png"}
              className="mr-2"
              alt={"Taskflow"}
            />{" "}
            TaskFlow
          </Link>
          <div className="space-x-4">
            <Link
              href="#features"
              className="text-text-low hover:text-primary-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/login"
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-5 rounded-md transition-colors text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 md:py-32 lg:py-40 text-center bg-gradient-to-br from-background-700 via-background-650 to-background-600 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="smallGrid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="var(--color-primary-500)"
                  strokeWidth="0.5"
                ></path>
              </pattern>
              <pattern
                id="grid"
                width="100"
                height="100"
                patternUnits="userSpaceOnUse"
              >
                <rect width="100" height="100" fill="url(#smallGrid)"></rect>
                <path
                  d="M 100 0 L 0 0 0 100"
                  fill="none"
                  stroke="var(--color-primary-600)"
                  strokeWidth="1"
                ></path>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"></rect>
          </svg>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slower"></div>

        <div className="container mx-auto px-6 relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            Conquer Your Day with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent">
              TaskFlow
            </span>
          </h1>
          <p className="text-lg md:text-xl text-text-low max-w-2xl mx-auto mb-10 leading-relaxed">
            Organize, prioritize, and achieve your goals with ultimate
            discipline and control. Transform your productivity and master your
            schedule like never before.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/login"
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

      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 bg-background-600">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-text-high">
              Features Designed for{" "}
              <span className="text-primary-400">Peak Performance</span>
            </h2>
            <p className="text-text-low mt-3 max-w-xl mx-auto">
              Everything you need to master your tasks and boost your
              productivity.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.label}
                icon={feature.icon}
                label={feature.label}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background-650 to-background-700">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-high mb-6">
            Ready to{" "}
            <span className="text-primary-400">Elevate Your Productivity?</span>
          </h2>
          <p className="text-text-low max-w-lg mx-auto mb-10">
            Join TaskFlow today and start turning your to-do lists into
            accomplishments. Discipline, control, and success are just a click
            away.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-lg font-semibold text-white bg-accent hover:bg-red-500 shadow-lg hover:shadow-accent/40 focus:ring-4 focus:ring-accent/50 rounded-lg px-10 py-4 transition-all duration-300 transform hover:scale-105"
          >
            Sign Up & Take Control <MoveRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-background-600 border-t border-divider">
        <div className="container mx-auto px-6 text-center">
          <p className="text-text-low text-sm">
            © {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
          <p className="text-xs text-text-gray mt-1">
            Built with passion and <span className="text-red-500">❤️</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

// You'll need to ensure FEATURES is correctly imported, e.g.:
// import { Timer, Activity, Heart, Sunrise, AlarmClock, Dumbbell } from 'lucide-react';
// export const FEATURES = [ /* ...your array using these icons */ ];

// Add to your tailwind.config.js if you want pulse animations:
// theme: {
//   extend: {
//     animation: {
//       'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
//       'pulse-slower': 'pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
//     },
//   },
// },
