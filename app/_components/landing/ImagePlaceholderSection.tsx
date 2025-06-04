import { Camera } from "lucide-react";

export default function ImagePlaceholderSection() {
  return (
    <section className="py-16 md:py-24 bg-background-650">
      <div className="container mx-auto px-6 text-center">
        <div className="inline-block p-3 mb-4 bg-accent/10 rounded-xl">
          <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-accent" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-text-high mb-6">
          See TaskFlow in Action
        </h2>
        <p className="text-text-low max-w-xl mx-auto mb-10 text-base sm:text-lg">
          Visual examples of TaskFlow helping you manage your daily schedule,
          track progress, and customize your tasks. Replace the content below
          with your app screenshots or a carousel.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="aspect-video bg-background-600 rounded-lg shadow-xl flex items-center justify-center border-2 border-dashed border-divider hover:border-primary-400 transition-colors duration-300"
            >
              <div className="text-center p-4">
                <Camera size={48} className="text-text-medium mx-auto mb-3" />
                <p className="text-sm text-text-medium">
                  App Screenshot Placeholder {item}
                </p>
                <p className="text-xs text-text-gray mt-1">
                  (e.g., Dashboard, Task View, Calendar)
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-12 text-text-low">
          Tip: Use high-quality images and consider a carousel component for
          multiple views.
        </p>
      </div>
    </section>
  );
}
