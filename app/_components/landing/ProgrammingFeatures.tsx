"use client";
import { m as motion } from "framer-motion";
import { programmingFeatures } from "@/app/_utils/utils";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: () => ({
    opacity: 1,
    y: 0,
  }),
};

export default function ProgrammingFeatures() {
  return (
      <div className="flex flex-wrap gap-8 items-center justify-center py-16">
        {programmingFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            custom={i}
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
            transition={{
              delay: i * 0.15,
              duration: 0.5,
              ease: "easeOut",
            }}
            viewport={{ once: true }}
            className="group w-72 h-96 rounded-2xl relative overflow-hidden transition-all duration-300 border border-primary-500/20 hover:border-primary-500/40 bg-background-700 shadow-xl hover:shadow-primary-500/10"
          >
            <div className="p-5 relative z-10">
              <div className="font-mono text-xs uppercase text-primary-300 tracking-widest mb-1">
                {feature.tag}
              </div>
              <div className="text-2xl text-text-high font-bold leading-tight text-balance">
                {feature.title}
              </div>
            </div>
            <div className="absolute inset-0 bg-cover opacity-50 group-hover:opacity-40 transition-opacity duration-300"
                style={{
                  backgroundImage: `url(${feature.imgPath})`,
                  filter: "hue-rotate(320deg) saturate(3)",
                  mixBlendMode: "screen",
                  transform: "translateX(4px) translateY(-2px) scale(1.06)",
                }}
              />
              <div className="absolute inset-0 bg-cover opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                style={{
                  backgroundImage: `url(${feature.imgPath})`,
                  filter: "hue-rotate(200deg) saturate(3)",
                  mixBlendMode: "screen",
                  transform: "translateX(-4px) translateY(2px) scale(1.06)",
                   }}
                 />
            {/* Border Glow */}
            <div
              className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 border border-primary-400/50 transition-opacity duration-300`}
            ></div>

          {/* Scanlines after glitch effect*/}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)" }}
          ></div>
          </motion.div>
        ))}
      </div>
  );
}
