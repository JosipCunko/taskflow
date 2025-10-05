"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Calendar,
  Utensils,
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Home,
  ListChecks,
  Bot,
  Dumbbell,
  Hamburger,
} from "lucide-react";
import Button from "./reusable/Button";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route?: string;
  targetSelector?: string;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  highlight?: {
    selector: string;
    padding?: number;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    title: "Welcome to TaskFlow!",
    description:
      "Let's take a quick tour of the key features to help you get started with managing your tasks and health.",
    icon: <Home className="w-6 h-6" />,
    route: "/webapp",
    position: {
      top: "50%",
      left: "50%",
    },
  },
  {
    id: "dashboard",
    title: "Your Dashboard",
    description:
      "This is your main dashboard where you can see your progress, upcoming tasks, and daily statistics.",
    icon: <Home className="w-6 h-6" />,
    route: "/webapp",
    targetSelector: '[data-tutorial="sidebar-dashboard"]',
    highlight: {
      selector: '[data-tutorial="sidebar-dashboard"]',
      padding: 8,
    },
    position: {
      top: "20%",
      left: "50%",
    },
  },
  {
    id: "add-task",
    title: "Creating Tasks",
    description:
      "Click the '+ New task' button in the top navigation to create new tasks. You can set due dates, priorities, customize them and even make them repeating.",
    icon: <Plus className="w-6 h-6" />,
    route: "/webapp/tasks",
    targetSelector: '[data-tutorial="btn-add-task"]',
    position: {
      top: "15%",
      right: "10%",
    },
    highlight: {
      selector: '[data-tutorial="btn-add-task"]',
      padding: 8,
    },
  },
  {
    id: "sidebar-view",
    title: "Many useful features",
    description:
      "Use the sidebar to navigate to different views of your tasks - Today's tasks, all tasks, calendar, and completed tasks. You can also access your notes, health and fitness tracker, and inbox.",
    icon: <ListChecks className="w-6 h-6" />,
    route: "/webapp/tasks",
    targetSelector: '[data-tutorial="sidebar"]',
    position: {
      top: "40%",
      left: "20%",
    },
    highlight: {
      selector: '[data-tutorial="sidebar"]',
      padding: 8,
    },
  },
  {
    id: "calendar-view",
    title: "Calendar page",
    description:
      "Plan ahead in the Calendar to visualize upcoming tasks on a timeline.",
    icon: <Calendar className="w-6 h-6" />,
    route: "/webapp/calendar",
    targetSelector: '[data-tutorial="sidebar-calendar"]',
    position: {
      top: "45%",
      left: "20%",
    },
    highlight: {
      selector: '[data-tutorial="sidebar-calendar"]',
      padding: 8,
    },
  },
  {
    id: "today-view",
    title: "Today's plan",
    description:
      "Focus on what's important today. See and complete tasks due now. Create a daily plan with priority tasks.",
    icon: <Calendar className="w-6 h-6" />,
    route: "/webapp/today",
    targetSelector: '[data-tutorial="sidebar-today"]',
    position: {
      top: "50%",
      left: "20%",
    },
    highlight: {
      selector: '[data-tutorial="sidebar-today"]',
      padding: 8,
    },
  },
  {
    id: "health-view",
    title: "Health & Nutrition",
    description:
      "Track your meals and nutrition in the Health section. You can save meal templates and log your daily food intake.",
    icon: <Utensils className="w-6 h-6" />,
    route: "/webapp/health",
    targetSelector: '[data-tutorial="sidebar-health"]',
    position: {
      top: "60%",
      left: "20%",
    },
    highlight: {
      selector: '[data-tutorial="sidebar-health"]',
      padding: 8,
    },
  },

  {
    id: "save-meal",
    title: "Save Meals",
    description:
      "In the Health section, you can save meal templates with nutritional information that you can reuse later.",
    icon: <Hamburger className="w-6 h-6" />,
    route: "/webapp/health",
    position: {
      top: "40%",
      left: "50%",
    },
  },
  {
    id: "log-meal",
    title: "Log Your Meals",
    description:
      "Log your daily food intake by selecting from your saved meals and specifying portion sizes. Track calories, proteins, carbs, and fats.",
    icon: <Utensils className="w-6 h-6" />,
    route: "/webapp/health",
    position: {
      top: "50%",
      left: "50%",
    },
  },
  {
    id: "gym-view",
    title: "Gym & Fitness",
    description:
      "Track your workouts and monitor your fitness progress in the Gym section. You can save your workout sessions and log your daily exercises.",
    icon: <Dumbbell className="w-6 h-6" />,
    route: "/webapp/gym",
    targetSelector: '[data-tutorial="sidebar-gym"]',
    position: {
      top: "60%",
      left: "20%",
    },
    highlight: {
      selector: '[data-tutorial="sidebar-gym"]',
      padding: 8,
    },
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description:
      "Use AI to plan tasks, create schedule for your day, ask him anything and much more. Chats are saved.",
    icon: <Bot className="w-6 h-6" />,
    route: "/webapp/ai",
    targetSelector: '[data-tutorial="sidebar-ai"]',
    position: {
      top: "55%",
      left: "20%",
    },
    highlight: {
      selector: '[data-tutorial="sidebar-ai"]',
      padding: 8,
    },
  },
];

interface TutorialOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function TutorialOverlay({
  onComplete,
  onSkip,
}: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  // Navigate to step route (if provided), wait for target, and highlight; add keyboard support
  useEffect(() => {
    let highlightApplied = false;
    let pollId: number | undefined;

    const step = tutorialSteps[currentStep];

    // Navigate if route differs
    if (step.route && pathname !== step.route) {
      router.push(step.route);
    }

    const applyHighlightIfReady = () => {
      if (highlightApplied) return;
      if (step.highlight?.selector) {
        const element = document.querySelector(step.highlight.selector);
        if (element) {
          const padding = step.highlight.padding || 4;
          (element as HTMLElement).style.position = "relative";
          (element as HTMLElement).style.zIndex = "1001";

          // Special handling for sidebar to make it completely white
          if (step.highlight.selector === '[data-tutorial="sidebar"]') {
            (element as HTMLElement).style.boxShadow = "inset 0 0 0 8px #fff";
            (element as HTMLElement).style.borderRadius = "0px";
          } else {
            // Default highlighting for other elements
            (
              element as HTMLElement
            ).style.boxShadow = `0 0 0 ${padding}px #ffffff, 0 0 0 2000px rgba(0, 0, 0, 0.5)`;
            (element as HTMLElement).style.borderRadius = "8px";
          }
          highlightApplied = true;
          if (pollId) window.clearInterval(pollId);
        }
      }
    };

    // Poll until the element is rendered or up to timeout
    if (step.highlight?.selector) {
      pollId = window.setInterval(applyHighlightIfReady, 100);
      // Failsafe: stop polling after 8s
      window.setTimeout(() => pollId && window.clearInterval(pollId), 8000);
    }

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Clean up highlights
      const stepCleanup = tutorialSteps[currentStep];
      if (stepCleanup.highlight?.selector) {
        const element = document.querySelector(stepCleanup.highlight.selector);
        if (element) {
          (element as HTMLElement).style.position = "";
          (element as HTMLElement).style.zIndex = "";
          (element as HTMLElement).style.boxShadow = "";
          (element as HTMLElement).style.borderRadius = "";
          // Special cleanup for sidebar background color
          if (stepCleanup.highlight.selector === '[data-tutorial="sidebar"]') {
            (element as HTMLElement).style.backgroundColor = "";
          }
        }
      }
      if (pollId) window.clearInterval(pollId);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentStep, pathname, router]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep((prev: number) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev: number) => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  // Calculate tooltip position
  const getTooltipStyle = () => {
    const position = currentStepData.position;
    const style: React.CSSProperties = {
      position: "fixed",
      zIndex: 1002,
      transform: "translate(-50%, -50%)",
    };

    if (position.top) style.top = position.top;
    if (position.left) style.left = position.left;
    if (position.right) style.right = position.right;
    if (position.bottom) style.bottom = position.bottom;

    return style;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop - Prevent clicking outside to close */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-1000"
        style={{ zIndex: 1000 }}
        onClick={(e) => e.preventDefault()} // Prevent closing by clicking backdrop
      />

      {/* Tutorial Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          style={getTooltipStyle()}
          className="bg-background-700 rounded-xl border border-background-500 p-6 max-w-lg w-full max-h-[480px] mx-4 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                {currentStepData.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-low">
                  {currentStepData.title}
                </h3>
                <p className="text-sm text-text-gray">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="p-1 text-text-gray hover:text-text-low transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-text-low mb-4 leading-relaxed">
            {currentStepData.description}
          </p>

          {/* Keyboard shortcuts hint */}
          <div className="text-xs text-text-gray mb-6 bg-background-600 rounded-md p-2">
            💡 Tip: Use arrow keys to navigate, Enter to continue or Esc to skip
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-gray">Progress</span>
              <span className="text-sm text-text-gray">
                {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-background-600 rounded-full h-2">
              <motion.div
                className="bg-primary-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / tutorialSteps.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              <Button variant="secondary" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            </div>

            <Button onClick={handleNext} className="flex items-center gap-2">
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
