"use client";

import { BarChart3, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default function AnalyticsUpgradePrompt() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background-700 via-background-600 to-background-700 border border-primary-500/20 p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-primary-500/10 rounded-xl border border-primary-500/20">
            <BarChart3 className="w-8 h-8 text-primary-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text-high">
              Analytics Dashboard
            </h3>
            <p className="text-text-low text-sm">
              Unlock powerful insights about your productivity
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <FeaturePreview
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            title="Productivity Score"
            description="Track your task completion patterns"
          />
          <FeaturePreview
            icon={<Zap className="w-5 h-5 text-yellow-400" />}
            title="Consistency Score"
            description="Monitor your daily engagement"
          />
          <FeaturePreview
            icon={<Sparkles className="w-5 h-5 text-blue-400" />}
            title="Usage Analytics"
            description="See which features you use most"
          />
        </div>

        <div className="relative mb-8 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-background-600/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="text-text-low text-sm font-medium bg-background-700/80 px-4 py-2 rounded-full border border-primary-500/20">
              🔒 Available on Pro & Ultra plans
            </span>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4 bg-background-600/50 rounded-lg">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-background-500 rounded animate-pulse"></div>
                <div className="h-20 bg-background-500 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/40"
          >
            <Sparkles className="w-5 h-5" />
            Upgrade to Pro
          </Link>
          <p className="text-text-low text-sm">
            Starting at{" "}
            <span className="text-primary-400 font-semibold">$4.99/month</span>{" "}
            with 7-day free trial
          </p>
        </div>
      </div>
    </div>
  );
}

function FeaturePreview({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-background-600/50 rounded-lg border border-primary-500/10">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-text-high font-medium text-sm">{title}</span>
      </div>
      <p className="text-text-low text-xs">{description}</p>
    </div>
  );
}
