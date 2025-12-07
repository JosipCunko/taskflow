"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
              src="/icon-512.png"
              alt="Taskflow Logo"
              fill
              className="w-8 h-8 p-1 text-primary-300 group-hover:animate-[text-glitch_0.3s_ease-out]"
            />
          </div>
          <span className="group-hover:text-glow transition-all">TaskFlow</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link
            href="#images"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium"
          >
            _Preview
          </Link>

          <Link
            href="#features"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium"
          >
            _Features
          </Link>
          <Link
            href="#pricing"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium"
          >
            _Pricing
          </Link>
          <Link
            href="https://mail.google.com/mail/u/0/#inbox?compose=CllgCJZbjrwqZhdlnFdSGkCDrWzqCMDPVlffTKZHKVLxQZMgcDQKGsDlMZLDDlpjDpczSXcjtmg"
            className="text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium"
          >
            _Contact_Us
          </Link>
          <Link
            href="/login"
            className="bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/50 text-primary-300 font-semibold py-2 px-5 rounded-md transition-all duration-200 text-base hover:shadow-md hover:shadow-primary-500/20"
          >
            [Engage]
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col space-y-1 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle mobile menu"
        >
          <span
            className={`block w-6 h-0.5 bg-primary-300 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-primary-300 transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-primary-300 transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-4 pb-2 space-y-3 border-t border-primary-500/20 mt-4">
          <Link
            href="#images"
            className="block text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            _Preview
          </Link>

          <Link
            href="#features"
            className="block text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            _Features
          </Link>
          <Link
            href="#pricing"
            className="block text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            _Pricing
          </Link>
          <Link
            href="https://mail.google.com/mail/u/0/#inbox?compose=CllgCJZbjrwqZhdlnFdSGkCDrWzqCMDPVlffTKZHKVLxQZMgcDQKGsDlMZLDDlpjDpczSXcjtmg"
            className="block text-text-low hover:text-primary-300 hover:text-glow transition-all duration-200 text-base font-medium py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            _Contact_Us
          </Link>
          <Link
            href="/login"
            className="inline-block bg-primary-500/10 hover:bg-primary-500/20 border border-primary-500/50 text-primary-300 font-semibold py-2 px-5 rounded-md transition-all duration-200 text-base hover:shadow-md hover:shadow-primary-500/20 mt-2"
            onClick={() => setIsMenuOpen(false)}
          >
            [Engage]
          </Link>
        </div>
      </div>
    </nav>
  );
}
