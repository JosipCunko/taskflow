import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="py-5 px-6 md:px-10 lg:px-16 sticky top-0 z-50 bg-background-600 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold text-primary-400 flex items-center"
        >
          <Image
            width={28}
            height={28}
            src={"/icon.png"} // Assuming icon.png is in public folder
            className="mr-2"
            alt={"TaskFlow Logo"}
          />
          TaskFlow
        </Link>
        <div className="space-x-4 md:space-x-6">
          <Link
            href="#features"
            className="text-text-low hover:text-primary-400 transition-colors duration-200 text-sm sm:text-base"
          >
            Features
          </Link>
          {/* Add other nav links here if needed, e.g., Pricing, About */}
          <Link
            href="/login" // Or /webapp if user is already logged in (requires session check)
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 sm:px-5 rounded-md transition-colors duration-200 text-sm sm:text-base"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
