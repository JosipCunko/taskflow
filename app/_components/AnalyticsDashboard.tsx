"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  BarChart3,
  TrendingUp,
  Target,
  Eye,
  Activity,
  Zap,
  Award,
  Clock,
} from "lucide-react";
import { AnalyticsData, AppUser } from "../_types/types";
import { getAnalyticsDataAction } from "../_lib/actions";
import { formatDateTime } from "../_utils/utils";

export default function AnalyticsDashboard({ user }: { user: AppUser }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, startTransition] = useTransition();

  const fetchAnalyticsData = useCallback(async () => {
    try {
      if (!user.uid) {
        return;
      }
      startTransition(async () => {
        const data = await getAnalyticsDataAction();
        setAnalyticsData(data);
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (isLoading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!analyticsData) {
    return <AnalyticsErrorState onRetry={fetchAnalyticsData} />;
  }

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="App Usage"
          value={`${Math.round(analyticsData.sessionDuration / 60)}m`}
          icon={<Activity className="text-blue-400" size={24} />}
          subtitle={`${analyticsData.pageViews} page views`}
          trend={12}
        />
        <AnalyticsCard
          title="Productivity Score"
          value={`${analyticsData.productivityScore}%`}
          icon={<Target className="text-green-400" size={24} />}
          subtitle="Based on completion patterns"
          trend={5}
        />
        <AnalyticsCard
          title="Consistency Score"
          value={`${analyticsData.consistencyScore}%`}
          icon={<Zap className="text-yellow-400" size={24} />}
          subtitle="Daily engagement level"
          trend={8}
        />
        <AnalyticsCard
          title="Most Productive Hour"
          value={formatHour(analyticsData.mostProductiveHour)}
          icon={<Clock className="text-purple-400" size={24} />}
          subtitle="Peak completion time"
          trend={null}
        />
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-high flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-400" />
            Feature Usage Analytics
          </h3>
          <span className="text-sm text-text-low">Last 30 days</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(analyticsData.featureUsage).map(
            ([feature, usage]) => (
              <div key={feature} className="text-center">
                <div className="text-2xl font-bold text-primary-400">
                  {usage}
                </div>
                <div className="text-sm text-text-low capitalize">
                  {feature}
                </div>
                <div className="w-full bg-background-600 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        (usage /
                          Math.max(
                            ...Object.values(analyticsData.featureUsage)
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
            Completion Rate Trend
          </h3>
          <div className="space-y-3">
            {analyticsData.completionRateHistory.map((rate, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-text-low">Day {index + 1}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-background-600 rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full transition-all duration-500"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-success">
                    {rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-accent" />
            Points Growth
          </h3>
          <div className="space-y-3">
            {user.gainedPoints.length > 0 ? (
              user.gainedPoints.map((points, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-text-low">Day {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-background-600 rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (points / Math.max(...user.gainedPoints)) * 100
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-accent">
                      {points}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-low text-sm">
                Your points history is empty
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Analytics */}
      <div className="bg-background-700 rounded-lg p-6 relative">
        <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-400" />
          Recent Achievements{" "}
          <span className="text-text-gray ml-2">( last 30 days )</span>
        </h3>
        {analyticsData.recentAchievements.length > 0 ? (
          <>
            <div className="space-y-3">
              {analyticsData.recentAchievements
                .slice(0, 5)
                .map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {achievement.type === "streak_milestone"
                          ? "🔥"
                          : achievement.type === "points_milestone"
                          ? "🏆"
                          : achievement.type === "task_completionist"
                          ? "✅"
                          : "🎯"}
                      </span>
                      <span className="text-sm text-text-low capitalize">
                        {achievement.id.replaceAll("_", " ")}
                      </span>
                    </div>
                    <span className="text-xs text-text-low">
                      {formatDateTime(achievement.unlockedAt)}
                    </span>
                  </div>
                ))}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-2 ">
              Total:
              <span>
                🔥 {analyticsData.achievementsByType.streak_milestone}
              </span>
              <span>
                🏆 {analyticsData.achievementsByType.streak_milestone}
              </span>
              <span>
                ✅ {analyticsData.achievementsByType.streak_milestone}
              </span>
            </div>
          </>
        ) : (
          <p className="text-text-low text-sm">No recent achievements</p>
        )}
      </div>

      {/* Quick Insights */}
      <div className="bg-background-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightCard
            title="Best Day"
            value={`${Math.max(...analyticsData.dailyTaskCompletions)} tasks`}
            description="Your highest completion day this week"
            icon="🏆"
          />
          <InsightCard
            title="Avg. Session"
            value={`${Math.round(analyticsData.sessionDuration / 60)}min`}
            description="Time spent in app per session"
            icon="⏱️"
          />
          <InsightCard
            title="Weekly Growth"
            value={`+${
              analyticsData.weeklyTaskTrends[
                analyticsData.weeklyTaskTrends.length - 1
              ] - analyticsData.weeklyTaskTrends[0]
            }`}
            description="Tasks improvement this month"
            icon="📈"
          />
        </div>
      </div>
    </div>
  );
}

interface AnalyticsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  trend: number | null;
}

function AnalyticsCard({
  title,
  value,
  icon,
  subtitle,
  trend,
}: AnalyticsCardProps) {
  return (
    <div className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-text-low">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-text-high">{value}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-sm text-text-low">{subtitle}</p>
        {trend !== null && trend !== 0 && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              trend > 0
                ? "bg-success/20 text-success"
                : "bg-error/20 text-error"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </span>
        )}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="bg-background-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-text-high">{title}</h4>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-lg font-bold text-primary-400">{value}</p>
      <p className="text-sm text-text-low">{description}</p>
    </div>
  );
}

export function AnalyticsLoadingSkeleton() {
  return (
    <>
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-48 bg-background-500 rounded"></div>
          </div>
          <div className="h-4 w-20 bg-background-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-12 bg-background-500 rounded mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-background-500 rounded mx-auto mb-2"></div>
              <div className="w-full bg-background-600 rounded-full h-2">
                <div className="bg-background-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-40 bg-background-500 rounded"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-12 bg-background-500 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-background-600 rounded-full h-2">
                    <div className="bg-background-500 h-2 rounded-full w-3/5"></div>
                  </div>
                  <div className="h-3 w-8 bg-background-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background-700 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
            <div className="h-6 w-32 bg-background-500 rounded"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-12 bg-background-500 rounded"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-background-600 rounded-full h-2">
                    <div className="bg-background-500 h-2 rounded-full w-4/5"></div>
                  </div>
                  <div className="h-3 w-6 bg-background-500 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="h-5 w-5 bg-background-500 rounded mr-2"></div>
          <div className="h-6 w-32 bg-background-500 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-background-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-16 bg-background-500 rounded"></div>
                <div className="h-6 w-6 bg-background-500 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-background-500 rounded mb-2"></div>
              <div className="h-3 w-full bg-background-500 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-background-500 rounded"></div>
          <div className="h-8 w-8 bg-background-500 rounded"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 w-full bg-background-500 rounded"></div>
          <div className="h-4 w-3/4 bg-background-500 rounded"></div>
          <div className="h-10 w-32 bg-background-500 rounded mt-4"></div>
        </div>
      </div>
    </>
  );
}

function AnalyticsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-background-700 rounded-lg p-6 text-center">
      <BarChart3 className="w-12 h-12 text-text-gray mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-text-high mb-2">
        Analytics Unavailable
      </h3>
      <p className="text-text-low mb-4">
        Unable to load analytics data at the moment.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
