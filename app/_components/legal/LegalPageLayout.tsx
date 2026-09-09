import Navbar from "@/app/_components/landing/Navbar";
import Footer from "@/app/_components/landing/Footer";

export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background-700 text-text-high">
      <Navbar />
      <main className="grow">
        <div className="container mx-auto px-6 py-12 md:py-16 max-w-3xl">
          <div className="mb-10 border-b border-primary-500/20 pb-6">
            <span className="text-sm font-mono text-primary-400">
              LEGAL.DOCUMENT
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-text-high mt-2">
              {title}
            </h1>
            <p className="text-sm text-text-gray mt-2 font-mono">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div
            className="
              space-y-6 text-text-low leading-relaxed
              [&_h2]:text-xl [&_h2]:md:text-2xl [&_h2]:font-semibold [&_h2]:text-text-high [&_h2]:mt-10 [&_h2]:mb-3
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-text-high [&_h3]:mt-6 [&_h3]:mb-2
              [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:mb-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:mb-4
              [&_a]:text-primary-400 [&_a]:hover:text-primary-300 [&_a]:underline [&_a]:underline-offset-2
              [&_strong]:text-text-high [&_strong]:font-semibold
            "
          >
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
