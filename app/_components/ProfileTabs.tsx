"use client";
import {
  BarChart3,
  Bell,
  Settings,
  Trophy,
  Palette,
  HelpCircle,
  Download,
  CreditCard,
  Crown,
  Sparkles,
  Zap,
  ExternalLink,
  Calendar,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ActivityLog, Task, AppUser, SubscriptionPlan } from "../_types/types";
import { getTaskIconByName } from "../_utils/icons";
import { formatDistanceToNowStrict } from "date-fns";
import TaskCardSmall from "./TaskCardSmall";
import Checkbox from "./reusable/Checkbox";
import Button from "./reusable/Button";
import { updateUserAction } from "../_lib/actions";
import { formatDate, handleToast } from "../_utils/utils";
import { useTheme } from "../_context/ThemeContext";
import { useTutorial } from "../_context/TutorialContext";
import { usePWA } from "../_context/PWAContext";
import { Theme } from "../_context/ThemeContext";

// Helper to get effective plan considering expiration
function getEffectivePlan(
  currentPlan: SubscriptionPlan,
  planExpiresAt?: number
): SubscriptionPlan {
  if (!planExpiresAt || currentPlan === "base") return currentPlan;
  if (planExpiresAt < Date.now()) return "base";
  return currentPlan;
}

const PLAN_DETAILS: Record<
  SubscriptionPlan,
  { name: string; icon: React.ReactNode; color: string; features: string[] }
> = {
  base: {
    name: "Base",
    icon: <Zap className="w-5 h-5" />,
    color: "text-warning",
    features: ["1 AI prompt/day", "Basic features"],
  },
  pro: {
    name: "Pro",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-primary-400",
    features: ["10 AI prompts/day", "Analytics dashboard", "Advanced insights"],
  },
  ultra: {
    name: "Ultra",
    icon: <Crown className="w-5 h-5" />,
    color: "text-amber-400",
    features: [
      "Unlimited AI prompts",
      "Early access features",
      "Priority support",
    ],
  },
};

export default function ProfileTabs({
  activityLogs,
  user,
}: {
  activityLogs: ActivityLog[];
  user: AppUser;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "settings" | "subscription"
  >("overview");
  const { theme, setTheme } = useTheme();
  const { showTutorial } = useTutorial();
  const { isInstallable, promptInstall } = usePWA();

  const [isLoading, setIsLoading] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

  const getActivityDisplayInfo = (
    activityType: ActivityLog["type"]
  ): string => {
    switch (activityType) {
      case "TASK_COMPLETED":
        return "Completed task";
      case "TASK_CREATED":
        return "Created new task";
      case "TASK_UPDATED":
        return "Updated task";
      case "TASK_DELAYED":
        return "Delayed task";
      case "TASK_MISSED":
        return "Marked task as missed";
      case "TASK_DELETED":
        return "Deleted task";
      default:
        return "Activity";
    }
  };

  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="flex border-b border-background-600 mb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`relative flex-1 py-3 text-center font-semibold transition-colors duration-150 ${
            activeTab === "overview"
              ? "text-white"
              : "text-text-low hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Trophy size={16} className="hidden sm:block" />
            Overview
          </div>
          {activeTab === "overview" && (
            <motion.div
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary-500"
              layoutId="profileUnderline"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`relative flex-1 py-3 text-center font-semibold transition-colors duration-150 ${
            activeTab === "settings"
              ? "text-white"
              : "text-text-low hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Settings size={16} className="hidden sm:block" />
            Settings
          </div>
          {activeTab === "settings" && (
            <motion.div
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary-500"
              layoutId="profileUnderline"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscription")}
          className={`relative flex-1 py-3 text-center font-semibold transition-colors duration-150 ${
            activeTab === "subscription"
              ? "text-white"
              : "text-text-low hover:text-white"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard size={16} className="hidden sm:block" />
            Subscription
          </div>
          {activeTab === "subscription" && (
            <motion.div
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary-500"
              layoutId="profileUnderline"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <>
            {isInstallable && (
              <motion.div
                key="install-app"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md"
              >
                <h3 className="text-lg font-semibold mb-4 text-text-high">
                  Install App
                </h3>
                <p className="text-text-low mb-4">
                  Install TaskFlow on your device for a better experience.
                </p>
                <Button
                  onClick={promptInstall}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Install App
                </Button>
              </motion.div>
            )}

            <motion.div
              key="activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-text-high">
                  Recent Activity
                </h3>
                {activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    {" "}
                    {/* Added custom-scrollbar */}
                    {activityLogs.map((activity) => {
                      const IconComponent = getTaskIconByName(
                        activity.activityIcon
                      );
                      const activityTitle = getActivityDisplayInfo(
                        activity.type
                      );
                      return (
                        <div
                          key={activity.id}
                          className="py-2.5 border-b border-divider last:border-b-0"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div
                                className="mt-1 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: `${activity.activityColor}`,
                                }}
                              >
                                <IconComponent size={16} />
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium text-sm text-text-high">
                                  {activityTitle}
                                </p>
                                {activity.taskSnapshot &&
                                  activity.taskSnapshot.title && (
                                    <div className="mt-1.5">
                                      <TaskCardSmall
                                        task={activity.taskSnapshot as Task}
                                      />
                                    </div>
                                  )}
                              </div>
                            </div>
                            <span className="text-xs text-text-gray flex-shrink-0 ml-2 pt-1">
                              {formatDistanceToNowStrict(
                                new Date(activity.timestamp),
                                { addSuffix: true }
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3
                      size={32}
                      className="mx-auto text-text-medium mb-2"
                    />
                    <p className="text-text-medium text-sm">
                      No recent activity to display.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {activeTab === "settings" && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Bell size={20} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-text-high">
                  Notification Settings
                </h3>
              </div>
              <div className="space-y-4">
                <Checkbox
                  id="taskReminders"
                  name="taskReminders"
                  label={
                    <div>
                      <p className="font-medium text-text-high">
                        Task Reminders
                      </p>
                      <p className="text-sm text-text-low">
                        Get notified about reminders on tasks that you&apos;ve
                        set
                      </p>
                    </div>
                  }
                  checked={user.notifyReminders}
                  onChange={async (e) => {
                    setIsLoading(true);
                    const res = await updateUserAction(user.uid, {
                      notifyReminders: e.target.checked,
                    });

                    handleToast(res);
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                />
                <Checkbox
                  id="achievementAlerts"
                  name="achievementAlerts"
                  label={
                    <div>
                      <p className="font-medium text-text-high">
                        Achievement Alerts
                      </p>
                      <p className="text-sm text-text-low">
                        Get notified about new achievements & weekly stats
                      </p>
                    </div>
                  }
                  checked={user.notifyAchievements}
                  onChange={async (e) => {
                    setIsLoading(true);
                    const res = await updateUserAction(user.uid, {
                      notifyAchievements: e.target.checked,
                    });

                    handleToast(res);
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                />
                <Checkbox
                  id="updateNotifications"
                  name="updateNotifications"
                  label={
                    <div>
                      <p className="font-medium text-text-high">
                        App Update Notifications
                      </p>
                      <p className="text-sm text-text-low">
                        Get notified when a new version of the app is available
                      </p>
                    </div>
                  }
                  checked={user.receiveUpdateNotifications ?? true}
                  onChange={async (e) => {
                    setIsLoading(true);
                    const res = await updateUserAction(user.uid, {
                      receiveUpdateNotifications: e.target.checked,
                    });

                    handleToast(res);
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Palette size={20} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-text-high">
                  Theme Settings
                </h3>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="theme-select"
                  className="block text-sm font-medium text-text-low"
                >
                  Choose a theme for your application.
                </label>
                <select
                  id="theme-select"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-full px-3 py-2 bg-background-625 border-background-500 rounded-lg text-text-high focus:ring-primary-500"
                >
                  <option value="default-blue">Default Blue</option>
                  <option value="dark-crt">Dark CRT</option>
                </select>
              </div>
            </div>

            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <HelpCircle size={20} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-text-high">
                  Help & Tutorial
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-text-low mb-3">
                    Need help getting started? Take the interactive tutorial to
                    learn about TaskFlow&apos;s key features.
                  </p>
                  <Button
                    onClick={showTutorial}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <HelpCircle size={16} />
                    Start Tutorial
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "subscription" && (
          <motion.div
            key="subscription"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Current Plan Card */}
            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard size={20} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-text-high">
                  Current Plan
                </h3>
              </div>
              {(() => {
                const effectivePlan = getEffectivePlan(
                  user.currentPlan || "base",
                  user.planExpiresAt
                );
                const isExpired =
                  user.planExpiresAt &&
                  user.planExpiresAt < Date.now() &&
                  user.currentPlan !== "base";
                return (
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-xl border ${
                        effectivePlan === "ultra"
                          ? "bg-amber-500/10 border-amber-500/30"
                          : effectivePlan === "pro"
                          ? "bg-primary-500/10 border-primary-500/30"
                          : "bg-background-500 border-warning"
                      }`}
                    >
                      <div className={PLAN_DETAILS[effectivePlan].color}>
                        {PLAN_DETAILS[effectivePlan].icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`text-xl font-bold ${PLAN_DETAILS[effectivePlan].color}`}
                      >
                        {PLAN_DETAILS[effectivePlan].name} Plan
                        {isExpired && (
                          <span className="ml-2 text-sm font-normal text-red-400">
                            (Expired)
                          </span>
                        )}
                      </h4>
                      {user.planExpiresAt && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-text-low">
                          <Calendar size={14} />
                          <span className={isExpired ? "text-red-400" : ""}>
                            {user.planExpiresAt > Date.now()
                              ? `Renews ${formatDate(user.planExpiresAt)}`
                              : `Expired ${formatDate(user.planExpiresAt)}`}
                          </span>
                        </div>
                      )}
                      <ul className="mt-3 space-y-1">
                        {PLAN_DETAILS[effectivePlan].features.map(
                          (feature, i) => (
                            <li
                              key={i}
                              className="text-sm text-text-low flex items-center gap-2"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                              {feature}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Manage Subscription */}
            <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <Settings size={20} className="text-primary-400" />
                <h3 className="text-lg font-semibold text-text-high">
                  Manage Subscription
                </h3>
              </div>

              {user.stripeCustomerId ? (
                <div className="space-y-4">
                  <p className="text-sm text-text-low">
                    Manage your billing, update payment methods, view invoices,
                    or cancel your subscription through the Stripe customer
                    portal.
                  </p>
                  <Button
                    onClick={async () => {
                      setIsSubscriptionLoading(true);
                      try {
                        const res = await fetch("/api/stripe/portal", {
                          method: "POST",
                        });
                        const data = await res.json();
                        if (data.url) {
                          window.location.href = data.url;
                        } else {
                          handleToast({
                            success: false,
                            error: data.error || "Failed to open portal",
                          });
                        }
                      } catch {
                        handleToast({
                          success: false,
                          error: "Failed to open billing portal",
                        });
                      } finally {
                        setIsSubscriptionLoading(false);
                      }
                    }}
                    variant="secondary"
                    className="flex items-center gap-2"
                    disabled={isSubscriptionLoading}
                  >
                    {isSubscriptionLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ExternalLink size={16} />
                    )}
                    Open Billing Portal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-text-low">
                    You&apos;re currently on the free plan. Upgrade to unlock
                    more AI prompts, analytics dashboard, and premium features.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={async () => {
                        setIsSubscriptionLoading(true);
                        try {
                          const res = await fetch("/api/stripe/checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ plan: "pro" }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            handleToast({
                              success: false,
                              error: data.error || "Failed to start checkout",
                            });
                          }
                        } catch {
                          handleToast({
                            success: false,
                            error: "Failed to start checkout",
                          });
                        } finally {
                          setIsSubscriptionLoading(false);
                        }
                      }}
                      variant="primary"
                      className="flex items-center gap-2"
                      disabled={isSubscriptionLoading}
                    >
                      {isSubscriptionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {user.freeTrialUsed
                        ? "Upgrade to Pro - $4.99/mo"
                        : "Start Free Trial - Pro"}
                    </Button>
                    <Button
                      onClick={async () => {
                        setIsSubscriptionLoading(true);
                        try {
                          const res = await fetch("/api/stripe/checkout", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ plan: "ultra" }),
                          });
                          const data = await res.json();
                          if (data.url) {
                            window.location.href = data.url;
                          } else {
                            handleToast({
                              success: false,
                              error: data.error || "Failed to start checkout",
                            });
                          }
                        } catch {
                          handleToast({
                            success: false,
                            error: "Failed to start checkout",
                          });
                        } finally {
                          setIsSubscriptionLoading(false);
                        }
                      }}
                      variant="secondary"
                      className="flex items-center gap-2 border-amber-500/30 hover:border-amber-500/50"
                      disabled={isSubscriptionLoading}
                    >
                      {isSubscriptionLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Crown size={16} className="text-amber-400" />
                      )}
                      Upgrade to Ultra - $14.99/mo
                    </Button>
                  </div>
                  <p className="text-xs text-text-gray">
                    {user.freeTrialUsed
                      ? "Cancel anytime."
                      : "Pro plan includes a 7-day free trial. Cancel anytime."}
                  </p>
                </div>
              )}
            </div>

            {/* Usage Stats */}
            {(() => {
              const effectivePlan = getEffectivePlan(
                user.currentPlan || "base",
                user.planExpiresAt
              );
              const limit =
                effectivePlan === "ultra"
                  ? Infinity
                  : effectivePlan === "pro"
                  ? 10
                  : 1;
              return (
                <div className="bg-background-600 rounded-lg p-4 sm:p-6 border border-divider shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 size={20} className="text-primary-400" />
                    <h3 className="text-lg font-semibold text-text-high">
                      Today&apos;s Usage
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-low">
                        AI Prompts Used
                      </span>
                      <span className="text-sm font-medium text-text-high">
                        {user.aiPromptsToday || 0} /{" "}
                        {limit === Infinity ? "∞" : limit}
                      </span>
                    </div>
                    <div className="w-full bg-background-500 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            ((user.aiPromptsToday || 0) /
                              (limit === Infinity ? 100 : limit)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
