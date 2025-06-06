import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function CallToActionSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background-600 via-background-650 to-background-700">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-text-high mb-6">
          Ready to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent">
            Elevate Your Productivity?
          </span>
        </h2>
        <p className="text-text-low max-w-lg mx-auto mb-10 text-base sm:text-lg leading-relaxed">
          Join TaskFlow today and start turning your to-do lists into
          accomplishments. Discipline, control, and success are just a click
          away.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center text-lg font-semibold text-white bg-primary-600 hover:bg-primary-600 shadow-lg hover:shadow-primary-500/40 focus:ring-4 focus:ring-primary-500/50 rounded-lg px-10 py-4 transition-all duration-300 transform hover:scale-105"
        >
          Sign Up & Take Control <MoveRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </section>
  );
}
