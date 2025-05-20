import { Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "./_components/reusable/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background-600 to-background-700 px-4 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[240px] font-bold text-background-500 opacity-10 select-none pointer-events-none z-0">
          404
        </div>

        <div className="relative z-10 grid place-items-center  ">
          <div className="flex items-center gap-2 ">
            <Search className="h-8 w-8 text-primary-400" />
            <h1 className="text-3xl font-bold text-text-high ">
              Looking for something?
            </h1>
          </div>

          <p className="text-text-low text-md mb-6 mt-1">
            We couldn&apos;t find the page that you&apos;re looking for!
          </p>

          <Link href="/" passHref>
            <Button>
              <span>Head back</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 h-24 w-24 bg-primary-500 rounded-full opacity-5"></div>
      <div className="absolute bottom-1/4 right-1/4 h-16 w-16 bg-accent rounded-full opacity-5"></div>
      <div className="absolute top-3/4 left-1/3 h-12 w-12 bg-primary-400 rounded-full opacity-5"></div>
    </div>
  );
}
