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
  { Icon: CheckSquare, color: "#10b981" },
  { Icon: Calendar, color: "#3b82f6" },
  { Icon: FileText, color: "#8b5cf6" },
  { Icon: Clock, color: "#f59e0b" },
  { Icon: Target, color: "#ef4444" },
  { Icon: Star, color: "#eab308" },
  { Icon: Zap, color: "#06b6d4" },
  { Icon: Trophy, color: "#f97316" },
  { Icon: Lightbulb, color: "#84cc16" },
  { Icon: Bookmark, color: "#ec4899" },
  { Icon: PenTool, color: "#6366f1" },
  { Icon: Layout, color: "#14b8a6" },
];

// Floating Icon Component
function FloatingIcon({
  Icon,
  color,
  delay = 0,
  duration = 20,
  startX = 0,
  startY = 0,
  size = 24,
}: {
  Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
  delay?: number;
  duration?: number;
  startX?: number;
  startY?: number;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute opacity-20 hover:opacity-40 transition-opacity duration-300"
      initial={{
        x: startX,
        y: startY,
        rotate: 0,
        scale: 0.5,
        opacity: 0,
      }}
      animate={{
        x: [startX, startX + 100, startX - 50, startX + 150, startX],
        y: [startY, startY - 100, startY + 80, startY - 120, startY],
        rotate: [0, 180, 360],
        scale: [0.5, 1, 0.8, 1.2, 0.5],
        opacity: [0, 0.2, 0.4, 0.3, 0.2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    >
      <Icon size={size} style={{ color }} />
    </motion.div>
  );
}

// Geometric Orb Component
function GeometricOrb({
  delay = 0,
  x = 0,
  y = 0,
  color = "#3b82f6",
  size = 60,
}: {
  delay?: number;
  x?: number;
  y?: number;
  color?: string;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full opacity-10 blur-sm"
      style={{
        background: `radial-gradient(circle, ${color}40, ${color}10)`,
        width: size,
        height: size,
      }}
      initial={{ x, y, scale: 0.5 }}
      animate={{
        x: [x, x + 200, x - 100, x],
        y: [y, y - 150, y + 100, y],
        scale: [0.5, 1.5, 0.8, 1.2, 0.5],
        rotate: [0, 360],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

// Animated Grid Lines
function GridLines() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Horizontal lines */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute h-px bg-gradient-to-r from-transparent via-primary-500/10 to-transparent"
          style={{
            top: `${(i + 1) * 12.5}%`,
            width: "100%",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: [0, 1, 0.5, 1, 0],
            opacity: [0, 0.3, 0.1, 0.3, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Vertical lines */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute w-px bg-gradient-to-b from-transparent via-primary-500/10 to-transparent"
          style={{
            left: `${(i + 1) * 16.67}%`,
            height: "100%",
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{
            scaleY: [0, 1, 0.3, 1, 0],
            opacity: [0, 0.2, 0.05, 0.2, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.7,
          }}
        />
      ))}
    </div>
  );
}

// Constellation Effect
function ConstellationDots() {
  const dots = [...Array(20)].map(() => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-30"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.1, 0.6, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}

// Productivity Visualization
function ProductivityVisualization() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        {/* Central hub */}
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/30 flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.2)",
              "0 0 40px rgba(59, 130, 246, 0.4)",
              "0 0 20px rgba(59, 130, 246, 0.2)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Target size={24} className="text-primary-400" />
        </motion.div>

        {/* Orbiting elements */}
        {productivityIcons.slice(0, 6).map((item, i) => {
          const angle = i * 60 * (Math.PI / 180);
          const radius = 80;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={i}
              className="absolute w-8 h-8 rounded-full bg-background-600/50 border border-background-500/50 flex items-center justify-center backdrop-blur-sm"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
              }}
              animate={{
                rotate: -360,
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                rotate: { duration: 60, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, delay: i * 0.5 },
              }}
            >
              <item.Icon size={16} style={{ color: item.color }} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Main Animated Background Component
export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <GridLines />

      <ConstellationDots />

      <GeometricOrb delay={0} x={100} y={100} color="#3b82f6" size={80} />
      <GeometricOrb delay={2} x={300} y={250} color="#8b5cf6" size={60} />
      <GeometricOrb delay={4} x={150} y={400} color="#10b981" size={100} />
      <GeometricOrb delay={6} x={400} y={150} color="#f59e0b" size={70} />
      <GeometricOrb delay={8} x={50} y={350} color="#ef4444" size={90} />

      {productivityIcons.map((item, i) => (
        <FloatingIcon
          key={i}
          Icon={item.Icon}
          color={item.color}
          delay={i * 0.8}
          duration={15 + (i % 3) * 5}
          startX={Math.random() * 400}
          startY={Math.random() * 500}
          size={20 + (i % 3) * 8}
        />
      ))}

      <ProductivityVisualization />

      {/* Ambient Glow Effects */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
        style={{
          background: "radial-gradient(circle, #3b82f6, transparent)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.05, 0.15, 0.05],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full opacity-5"
        style={{
          background: "radial-gradient(circle, #8b5cf6, transparent)",
        }}
        animate={{
          scale: [1.2, 0.8, 1.2],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
      />
    </div>
  );
}
