import AnimatedNumber from "../animations/AnimatedNumber";
import GridAndDotsBackground from "../animations/GridAndDotsBackground";
import { stats } from "@/app/_utils/utils";

function StatsSection() {
  return (
    <section className="py-20 bg-background-700 relative overflow-hidden border-y border-primary-500/10">
      <GridAndDotsBackground />
      <div className="absolute inset-0 bg-background-700/90 z-0"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-primary-500/20 pb-4">
          <div>
             <h2 className="text-3xl md:text-4xl text-text-high mb-2 font-mono tracking-tighter">
              SYSTEM_METRICS
            </h2>
            <p className="text-sm text-text-low font-mono">
              // Live performance data stream
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
             <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
             <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-75"></span>
             <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-150"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-background-600/30 border border-primary-500/10 p-6 transition-all duration-300 hover:border-primary-500/40 hover:bg-background-600/50"
            >
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary-500/50"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary-500/50"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary-500/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary-500/50"></div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono text-primary-500/60 uppercase tracking-widest">
                  Metric_0{index + 1}
                </div>
                <stat.icon className="w-5 h-5 text-primary-400 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="text-4xl md:text-5xl font-bold text-text-high mb-2 font-mono tracking-tighter">
                <AnimatedNumber value={stat.value} />
                <span className="text-2xl text-primary-500/80 ml-1">{stat.suffix}</span>
              </div>
              
              <div className="text-sm font-semibold text-text-low uppercase tracking-wide mb-4">
                {stat.label}
              </div>

              {/* Pseudo-Progress Bar */}
              <div className="w-full h-1 bg-background-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500/50 group-hover:bg-primary-500 transition-colors duration-500"
                  style={{ width: `${Math.min((stat.value / (stat.value > 100 ? 1000 : 100)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
