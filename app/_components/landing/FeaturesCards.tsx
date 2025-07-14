"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import GraphLoader from "../animations/GraphLoader";
import BookLoader from "../animations/BookLoader";
import PolylineLoader from "../animations/PolylineLoader";

const features = [
  {
    title: "Add Tasks",
    tag: "Don't forget anything",
    imgPath: "/addTask.png",
    color: "primary-500",
    clipPath:
      "polygon(4% 43%, 75% 28%, 75% 14%, 100% 11%, 100% 85%, 100% 85%, 100% 100%, 0 100%, 0 86%, 9% 86%)",
    loaderComponent: <PolylineLoader />,
    classNameIcon: "scale-[0.5] -bottom-3 -left-3 z-3",
  },
  {
    title: "Get things done",
    tag: "Advanced task customization",
    imgPath: "/repetitionRules.png",
    color: "accent",
    clipPath:
      " polygon(0 24%, 63% 20%, 100% 13%, 100% 100%, 0 100%, 0 77%, 10% 77%)",
    loaderComponent: <BookLoader />,
    classNameIcon: "scale-[0.2] -bottom-12 -left-18 z-1",
  },
  {
    title: "Express yourself",
    tag: "Customization",
    imgPath: "/customizeTask.png",
    color: "warning",
    clipPath:
      "polygon(0 18%, 63% 24%, 100% 25%, 100% 100%, 20% 100%, 0 100%, 5% 79%)",
    loaderComponent: <GraphLoader />,
    classNameIcon: "scale-[0.5] -bottom-0.5 -left-3 z-3",
  },
];

const featureCardVariants = {
  initial: {
    opacity: 0,
  },
  hover: {
    opacity: 1,
  },
};

export default function FeaturesCards() {
  return (
    <div className="flex flex-wrap gap-5 items-center justify-evenly py-10 place-items-center w-full border-t border-b border-divider/20">
      {features.map((feature) => (
        <motion.div
          initial="initial"
          whileHover="hover"
          key={feature.title}
          className="bg-white w-52 p-3 h-80 rounded-2xl relative overflow-hidden transition-all duration-300 "
        >
          <div className="font-semibold whitespace-nowrap text-[10px] uppercase text-text-gray tracking-tight mb-1">
            {feature.tag}
          </div>
          <div className="relative text-xl text-black leading-5.5 font-semibold z-1 ">
            {feature.title}
          </div>
          <div
            className="rounded-tl-lg absolute h-[225px] right-0 bottom-0 left-10 overflow-hidden z-2"
            style={{ boxShadow: "10px 10px 20px 15px #000000" }}
          >
            <Image
              src={feature.imgPath}
              fill
              className="object-cover"
              alt="feature image"
            />
          </div>
          <motion.div
            variants={featureCardVariants}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`absolute  -bottom-3 -left-3 w-fit ${feature.classNameIcon}`}
          >
            {feature.loaderComponent}
          </motion.div>
          <motion.div
            variants={featureCardVariants}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`absolute inset-0 w-full h-full bg-${feature.color}`}
            style={{ clipPath: feature.clipPath }}
          ></motion.div>
        </motion.div>
      ))}
    </div>
  );
}
