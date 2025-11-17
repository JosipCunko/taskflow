"use client";

import Image from "next/image";
import { Camera, Grid3x3, Code, Zap } from "lucide-react";
import { m as motion } from "framer-motion";
import { images } from "@/app/_utils/utils";

// Tech Background Pattern Component
function TechBackgroundPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div className="absolute inset-0">
        {/* Horizontal lines */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`h-${i}`}
            className="absolute h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"
            style={{
              top: `${(i + 1) * 8.33}%`,
              width: "100%",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{
              scaleX: [0, 1, 0.3, 1, 0],
              opacity: [0.2, 0.5, 0.25, 0.5, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Vertical lines */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`v-${i}`}
            className="absolute w-1  bg-gradient-to-b from-transparent via-primary-500 to-transparent"
            style={{
              left: `${(i + 1) * 12.5}%`,
              height: "100%",
            }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{
              scaleY: [0, 1, 0.5, 1, 0],
              opacity: [0.2, 0.5, 0.25, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          ></motion.div>
        ))}
      </div>

      {/* Floating Dots */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`dot-${i}`}
          className="absolute w-1.5 h-1.5 bg-primary-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        ></motion.div>
      ))}

      {/* Corner Tech Elements */}
      <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary-500/30"></div>
      <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary-500/30"></div>
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary-500/30"></div>
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary-500/30"></div>
    </div>
  );
}

export default function ImageSection() {
  return (
    <section
      id="images"
      className="py-16 md:py-24 bg-gradient-to-br from-background-700 to-background-650 relative overflow-hidden"
    >
      <TechBackgroundPattern />

      <div className="container mx-auto p-6 text-center relative z-10">
        <motion.div
          className="inline-flex items-center gap-2 p-3 mb-4 bg-background-600/80 backdrop-blur-sm rounded-xl border border-primary-500/20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Camera className="w-6 h-6 text-primary-400" />
          <Grid3x3 className="w-5 h-5 text-primary-400" />
          <Code className="w-5 h-5 text-primary-300" />
        </motion.div>

        <motion.h2
          className="text-3xl sm:text-4xl mb-6 text-glow"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          See <span className="text-primary-600">Taskflow</span> in action
        </motion.h2>

        <motion.p
          className="text-text-low max-w-xl mx-auto mb-12 text-base sm:text-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Experience the power of intelligent task management through visual
          examples of TaskFlow&apos;s cutting-edge interface and seamless
          workflow optimization.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {images.map((image, index) => (
            <motion.div
              key={image.src}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-video bg-background-600 rounded-2xl overflow-hidden">
                {/* Sophisticated Shadow Layers */}
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-500/20 via-transparent to-accent/20 blur-xl rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -inset-2 bg-gradient-to-br from-background-500/50 to-background-700/50 blur-lg rounded-2xl"></div>

                {/* Image */}
                <div className="relative w-full h-full">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                    priority={index < 3} // Preload first 3 images
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background-700/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </div>

                {/* Category  */}
                <div className="absolute top-1 left-1 px-3 py-1 bg-background-700/90 backdrop-blur-sm rounded-full border border-primary-500/30">
                  <span className="text-xs font-medium text-primary-300 uppercase tracking-wider">
                    {image.category}
                  </span>
                </div>

                {/* Tech Status Indicator */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-success rounded-full"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3,
                  }}
                />
              </div>

              {/* Title Section */}
              <div className="mt-6 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary-400" />
                  <div className="h-px flex-1 bg-gradient-to-r from-primary-500/50 to-transparent"></div>
                </div>
                <h3 className="text-lg font-bold text-text-high group-hover:text-primary-300 transition-colors duration-300">
                  {image.title}
                </h3>
                <p className="text-sm text-text-low mt-1">{image.alt}</p>
              </div>

              {/* Floating Tech Elements */}
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 border border-primary-400/40 rounded transform rotate-45 opacity-0 group-hover:opacity-100"
                animate={{
                  rotate: [45, 405],
                  scale: [0.8, 1.1, 0.8],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
