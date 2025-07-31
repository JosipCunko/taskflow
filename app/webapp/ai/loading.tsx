import Loader from "@/app/_components/Loader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <Loader label="Loading AI Assistant..." />
    </div>
  );
}
