import AnimatedNumber from "../animations/AnimatedNumber";
import GridAndDotsBackground from "../animations/GridAndDotsBackground";
import { stats } from "@/app/_utils/landingPageUtils";

function StatsSection() {
  return (
    <section className="py-20 bg-background-700 relative overflow-hidden">
      <GridAndDotsBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-background-700 via-background-700/80 to-background-700 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl text-text-high mb-4 text-glow">
            System Diagnostics
          </h2>
          <p className="text-lg text-text-low max-w-2xl mx-auto">
            Real-time analysis of network performance and data throughput.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group bg-background-600/50 backdrop-blur-sm border border-primary-500/20 rounded-xl p-6 text-center transition-all duration-300 hover:border-primary-500/50 hover:shadow-2xl hover:shadow-primary-500/10"
            >
              <div className="mb-4">
                <stat.icon className="w-10 h-10 text-primary-400 mx-auto transition-all duration-300 group-hover:text-glow" />
              </div>
              <div className="text-4xl md:text-5xl font-bold text-text-high mb-2">
                <AnimatedNumber value={stat.value} />
                {stat.suffix}
              </div>
              <div className="text-base font-semibold text-text-low">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
