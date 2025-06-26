import { Users, CheckCircle, Clock, Zap } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1",
    label: "Active Users",
  },
  {
    icon: CheckCircle,
    value: "300+",
    label: "Total tasks Created",
  },
  {
    icon: Clock,
    value: "6.6K",
    label: "Tasks reviewed",
  },
  {
    icon: Zap,
    value: "100%",
    label: "Reliability",
  },
];

function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-background-500 to-background-700">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            You can trust us
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Join the growing community of productive individuals and teams
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-4 group-hover:bg-white/20 transition-all duration-300 transform group-hover:scale-105">
                <stat.icon className="w-12 h-12 text-white mx-auto mb-4" />
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-primary-100 mb-1">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
