"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

export default function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useSpring(0, {
    damping: 50,
    stiffness: 400,
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  return (
    <motion.span ref={ref}>
      {useTransform(motionValue, (latest) =>
        Intl.NumberFormat("en-US").format(Math.round(latest))
      )}
    </motion.span>
  );
}
