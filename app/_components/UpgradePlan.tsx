"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Crown, Zap } from "lucide-react";
import Link from "next/link";

interface UpgradePlanProps {
  /** The reason displayed to the user why they need to upgrade */
  message: string;
  /** Optional: Custom title for the prompt */
  title?: string;
  /** Optional: Custom CTA button text */
  ctaText?: string;
  /** Optional: Custom link for the CTA button */
  ctaLink?: string;
  /** Unique key to store dismiss state in localStorage (different prompts can have different dismiss states) */
  storageKey: string;
  /** Optional: Whether to show the close button (default: true) */
  showCloseButton?: boolean;
  /** Optional: Custom icon to display */
  icon?: "sparkles" | "crown" | "zap";
  /** Optional: Variant for different visual styles */
  variant?: "default" | "compact" | "banner";
}

const STORAGE_PREFIX = "taskflow_upgrade_dismissed_";

export default function UpgradePlan({
  message,
  title = "Upgrade Your Plan",
  ctaText = "Upgrade Now",
  ctaLink = "/#pricing",
  storageKey,
  showCloseButton = true,
  icon = "sparkles",
  variant = "default",
}: UpgradePlanProps) {
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    // Check localStorage on mount
    const dismissedAt = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
    if (dismissedAt) {
      // Check if dismissed within the last 24 hours
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);

      // Re-show after 24 hours
      if (hoursSinceDismissed >= 24) {
        localStorage.removeItem(`${STORAGE_PREFIX}${storageKey}`);
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(
      `${STORAGE_PREFIX}${storageKey}`,
      Date.now().toString()
    );
  };

  if (isDismissed) return null;

  const IconComponent = {
    sparkles: Sparkles,
    crown: Crown,
    zap: Zap,
  }[icon];

  // Compact variant - minimal inline banner
  if (variant === "compact") {
    return (
      <div className="relative flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary-500/10 to-primary-600/5 border border-primary-500/20 animate-fadeIn">
        <IconComponent className="w-5 h-5 text-primary-400 flex-shrink-0" />
        <p className="text-sm text-text-low flex-1">{message}</p>
        <Link
          href={ctaLink}
          className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors whitespace-nowrap"
        >
          {ctaText}
        </Link>
        {showCloseButton && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md hover:bg-background-500/50 text-text-low hover:text-text-high transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  }

  // Banner variant - full width top/bottom banner
  if (variant === "banner") {
    return (
      <div className="relative flex items-center justify-between gap-4 px-4 py-3 bg-gradient-to-r from-primary-600/20 via-primary-500/10 to-primary-600/20 border-y border-primary-500/20 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary-500/20 rounded-lg">
            <IconComponent className="w-4 h-4 text-primary-400" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="text-sm font-medium text-text-high">{title}</span>
            <span className="text-sm text-text-low">{message}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={ctaLink}
            className="px-4 py-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            {ctaText}
          </Link>
          {showCloseButton && (
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-md hover:bg-background-500/50 text-text-low hover:text-text-high transition-colors"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default variant - card style
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background-700 via-background-600 to-background-700 border border-primary-500/20 p-6 animate-fadeIn">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-background-500/50 text-text-low hover:text-text-high transition-colors z-10"
          aria-label="Dismiss upgrade prompt"
        >
          <X size={18} />
        </button>
      )}

      <div className="relative z-10">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20 flex-shrink-0">
            <IconComponent className="w-6 h-6 text-primary-400" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-lg font-bold text-text-high mb-1">{title}</h3>
            <p className="text-text-low text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex flex-col xs:flex-row gap-3 items-start xs:items-center">
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {ctaText}
          </Link>
          <p className="text-text-low text-xs">
            Starting at{" "}
            <span className="text-primary-400 font-semibold">$4.99/month</span>{" "}
            with 7-day free trial
          </p>
        </div>
      </div>
    </div>
  );
}
