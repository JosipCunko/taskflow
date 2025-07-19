export default function Loader({ label = undefined }: { label?: string }) {
  return (
    <div className="bg-background-650 absolute inset-0 flex justify-center items-center flex-col gap-y-1 z-50">
      <div className="spinner"></div>
      {label && <span className="text-lg text-text-low">{label}</span>}
    </div>
  );
}
