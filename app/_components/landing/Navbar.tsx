import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="py-4 px-6 md:px-10 lg:px-16 sticky top-0 z-50 bg-background-700/80 backdrop-blur-md border-b border-primary-500/20 shadow-lg shadow-primary-500/5">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-primary-400 flex items-center group"
        >
          <div className="w-8 h-8 mr-3 relative">
            <div className="absolute inset-0 bg-primary-500/20 rounded-lg group-hover:animate-none transition-colors animate-pulse"></div>
            <Image
              src="/icon.png"
              alt="Taskflow Logo"
              fill
              className="w-8 h-8 p-1 text-primary-300 group-hover:animate-[text-glitch_0.3s_ease-out]"
            />
          </div>
          <span className="group-hover:text-glow transition-all">TaskFlow</span>
        </Link>
        <div className="space-x-4 md:space-x-6 flex items-center">
          <Link
            href="#images"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-sm sm:text-base font-medium"
          >
            _Preview
          </Link>

          <Link
            href="#features"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-sm sm:text-base font-medium"
          >
            _Features
          </Link>
          <Link
            href="https://mail.google.com/mail/u/0/#inbox?compose=CllgCJZbjrwqZhdlnFdSGkCDrWzqCMDPVlffTKZHKVLxQZMgcDQKGsDlMZLDDlpjDpczSXcjtmg"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-sm sm:text-base font-medium"
          >
            _Contact_Us
          </Link>
          <Link
            href="/login"
            className="bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/50 text-primary-300 font-semibold py-2 px-4 sm:px-5 rounded-md transition-all duration-200 text-sm sm:text-base hover:shadow-md hover:shadow-primary-500/20"
          >
            [Engage]
          </Link>
        </div>
      </div>
    </nav>
  );
}
