export default function GridAndDotsBackground() {
  return (
    <div className="absolute  inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 "
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(14, 165, 233, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(14, 165, 233, 0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
      </div>
    </div>
  );
}
