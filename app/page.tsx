import HeroSection from "@/app/_components/landing/HeroSection";
import FeaturesOverview from "@/app/_components/landing/FeaturesOverview";
import ImagePlaceholderSection from "@/app/_components/landing/ImagePlaceholderSection";
import CallToActionSection from "@/app/_components/landing/CallToActionSection";
import Footer from "@/app/_components/landing/Footer";
import Navbar from "@/app/_components/landing/Navbar";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background-700 text-text-high overflow-x-hidden">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesOverview />
        <ImagePlaceholderSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
}
