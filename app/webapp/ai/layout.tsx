export default function AILayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="py-1 sm:py-6 container overflow-y-auto mx-auto h-full">
      {children}
    </div>
  );
}
