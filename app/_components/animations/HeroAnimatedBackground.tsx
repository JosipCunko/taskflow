"use client";

import { motion } from "framer-motion";
import {
  CheckSquare,
  Calendar,
  FileText,
  Clock,
  Target,
  Star,
  Zap,
  Trophy,
  Lightbulb,
  Bookmark,
  PenTool,
  Layout,
} from "lucide-react";

const productivityIcons = [
  { Icon: CheckSquare, color: "#10b981", startX: 100, startY: 150 },
  { Icon: Calendar, color: "#3b82f6", startX: 300, startY: 250 },
  { Icon: FileText, color: "#8b5cf6", startX: 500, startY: 180 },
  { Icon: Clock, color: "#f59e0b", startX: 700, startY: 300 },
  { Icon: Target, color: "#ef4444", startX: 200, startY: 400 },
  { Icon: Star, color: "#eab308", startX: 600, startY: 120 },
  { Icon: Zap, color: "#06b6d4", startX: 150, startY: 350 },
  { Icon: Trophy, color: "#f97316", startX: 450, startY: 450 },
  { Icon: Lightbulb, color: "#84cc16", startX: 350, startY: 100 },
  { Icon: Bookmark, color: "#ec4899", startX: 550, startY: 380 },
  { Icon: PenTool, color: "#6366f1", startX: 250, startY: 200 },
  { Icon: Layout, color: "#14b8a6", startX: 650, startY: 220 },
];

export default function HeroAnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {productivityIcons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute opacity-30 hover:opacity-50 transition-opacity duration-300"
          initial={{
            x: item.startX,
            y: item.startY,
            rotate: 0,
            scale: 0,
            opacity: 0,
          }}
          animate={{
            x: [
              item.startX,
              item.startX + 100,
              item.startX - 50,
              item.startX + 150,
              item.startX,
            ],
            y: [
              item.startY,
              item.startY - 100,
              item.startY + 80,
              item.startY - 120,
              item.startY,
            ],
            rotate: [0, 180, 360],
            scale: [0, 1, 0.8, 1.2, 0.8],
            opacity: [0, 0.3, 0.5, 0.4, 0.3],
          }}
          transition={{
            duration: 20 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        >
          <div
            className="p-3 rounded-xl backdrop-blur-sm border border-white/10"
            style={{
              backgroundColor: `${item.color}20`,
              boxShadow: `0 0 20px ${item.color}30`,
            }}
          >
            <item.Icon size={28} style={{ color: item.color }} />
          </div>
        </motion.div>
      ))}

      {/* Large Floating Orbs */}
      <motion.div
        className="absolute top-10 left-10 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #3b82f680, #3b82f620, transparent)",
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, #8b5cf680, #8b5cf620, transparent)",
        }}
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 20, repeat: Infinity, delay: 3 }}
      />

      {/* Additional ambient effects */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full opacity-10"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, #3b82f6, transparent 50%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 25, repeat: Infinity }}
      />
    </div>
  );
}
