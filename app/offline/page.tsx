import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background-700">
      <div className="text-center max-w-md px-4">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-background-800 rounded-full border border-background-600">
            <WifiOff className="w-16 h-16 text-text-low" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-text-high mb-4">
          You're Offline
        </h1>
        <p className="text-text-medium mb-8">
          It looks like you've lost your internet connection. Some features may be limited until you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
