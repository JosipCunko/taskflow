import Image from "next/image";

type BrandMarkProps = {
  size?: "sm" | "md";
  showWordmark?: boolean;
  className?: string;
};

const sizes = {
  sm: { px: 36, className: "h-9 w-9" },
  md: { px: 40, className: "h-10 w-10" },
};

export default function BrandMark({
  size = "md",
  showWordmark = true,
  className = "",
}: BrandMarkProps) {
  const { px, className: imgClass } = sizes[size];

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <Image
        src="/icon.svg"
        alt={showWordmark ? "" : "Prioritron"}
        width={px}
        height={px}
        priority
        unoptimized
        className={`${imgClass} shrink-0`}
      />
      {showWordmark ? (
        <span className="font-bold tracking-[0.18em] text-text-high text-base md:text-lg">
          PRIORITRON
        </span>
      ) : null}
    </span>
  );
}
