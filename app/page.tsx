import HeroSection from "@/app/_components/landing/HeroSection";
import ImageSection from "@/app/_components/landing/ImageSection";
import StatsSection from "@/app/_components/landing/StatsSection";
import Features from "@/app/_components/landing/Features";
import CallToActionSection from "@/app/_components/landing/CallToActionSection";
import Footer from "@/app/_components/landing/Footer";
import Navbar from "@/app/_components/landing/Navbar";
import ProgrammingFeatures from "./_components/landing/ProgrammingFeatures";

export default async function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background-700 text-text-high overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <ImageSection />
        <StatsSection />
        <Features />
        <ProgrammingFeatures />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
