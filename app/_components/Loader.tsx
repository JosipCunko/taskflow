export default function Loader({ label = undefined }: { label?: string }) {
  return (
    <div className="absolute inset-0 flex justify-center items-center flex-col gap-0.5">
      <section className="dots-container">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </section>
      {label && <span className="text-lg text-text-low">{label}</span>}
    </div>
  );
}
