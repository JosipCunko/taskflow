import { LucideIcon } from "lucide-react";
interface FeatureCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
}

export default function FeatureCard({
  icon: Icon,
  label,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-background-650 p-6 rounded-xl shadow-lg hover:shadow-primary-500/20 transition-shadow duration-300 flex flex-col items-start text-left h-full">
      <div className="p-3 mb-4 bg-primary-500/10 rounded-lg">
        <Icon className="w-7 h-7 text-primary-400" />
      </div>
      <h3 className="text-xl font-semibold text-text-high mb-2">{label}</h3>
      <p className="text-text-low text-sm leading-relaxed flex-grow">
        {description}
      </p>
    </div>
  );
}
