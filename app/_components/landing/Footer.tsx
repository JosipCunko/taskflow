export default function Footer() {
  return (
    <footer className="py-8 bg-background-600 border-t border-divider">
      <div className="container mx-auto px-6 text-center">
        <p className="text-text-low text-sm">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
        <p className="text-xs text-text-gray mt-1">
          Built with passion and <span className="text-red-500">❤️</span>
        </p>
        {/* You can add more links here, e.g., Privacy Policy, Terms of Service */}
      </div>
    </footer>
  );
}
