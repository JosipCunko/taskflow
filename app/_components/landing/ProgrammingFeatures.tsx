"use client";
import Image from "next/image";
import { m as motion } from "framer-motion";
import { programmingFeatures } from "@/app/_utils/utils";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

export default function ProgrammingFeatures() {
  return (
    <>
      <div className="flex flex-wrap gap-8 items-center justify-center py-16 bg-background-650 border-t border-b border-divider/10">
        {programmingFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            custom={i}
            variants={cardVariants}
            initial="initial"
            whileInView="animate"
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

            {/* Image with Glitch Effect */}
            <div className="absolute h-60 w-full bottom-0 right-0 overflow-hidden ">
              <Image
                src={feature.imgPath}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                alt="feature image"
              />
              {/* Glitch Layers */}
              <div
                className="absolute inset-0 bg-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  backgroundImage: `url(${feature.imgPath})`,
                  filter: "hue-rotate(20deg)",
                  mixBlendMode: "screen",
                }}
              ></div>
              <div className="absolute inset-0 bg-black opacity-50 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>

            {/* Border Glow */}
            <div
              className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 border border-primary-400/50 transition-opacity duration-300`}
            ></div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
