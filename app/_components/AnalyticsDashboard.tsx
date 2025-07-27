"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  BarChart3,
  Target,
  Eye,
  Activity,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react";
import { AnalyticsData, AppUser } from "../_types/types";
import { getAnalyticsDataAction } from "../_lib/actions";
import { formatDateTime, formatDuration, formatHour } from "../_utils/utils";
import { format, subDays, isToday } from "date-fns";
import { Tooltip } from "react-tooltip";

interface DayData {
  date: Date;
  dayNumber: number;
  dayName: string;
  tasksCompleted: number;
  isToday: boolean;
}

const WeeklyCompletionsChart = ({ data }: { data: number[] }) => {
  const maxVal = Math.max(...data, 1); // Avoid division by zero
  return (
    <div className="bg-background-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
        Weekly Completions
      </h3>
      <div className="flex justify-between items-end h-32 space-x-2">
        {data.map((value, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-purple-400/50 rounded-t-md"
              style={{
                height: `${(value / maxVal) * 100}%`,
                transition: "height 0.5s ease-in-out",
              }}
            ></div>
            <span className="text-xs text-text-low mt-2">Week {index + 1}</span>
            <span className="text-sm font-bold text-text-high">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsDashboard({ user }: { user: AppUser }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, startTransition] = useTransition();
  const today = new Date();

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

  const days: DayData[] = [];

  for (let i = 13; i >= 0; i--) {
    const date = subDays(today, i);
    const tasksCompleted = analyticsData.dailyTaskCompletions[13 - i] || 0;

    days.push({
      date,
      dayNumber: date.getDate(),
      dayName: format(date, "EEE"),
      tasksCompleted,
      isToday: isToday(date),
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Session Duration"
          value={formatDuration(analyticsData.sessionDuration)}
          icon={<Activity className="text-blue-400" size={24} />}
          subtitle={`${analyticsData.pageViews} page views`}
          trend={analyticsData.trends.sessionDurationTrend}
        />
        <AnalyticsCard
          title="Active Time"
          value={formatDuration(analyticsData.activeTime)}
          icon={<Zap className="text-teal-400" size={24} />}
          subtitle="Focused engagement"
          trend={
            analyticsData.trends.sessionDurationTrend
          } /* Trend for active time can be similar to session duration */
        />
        <AnalyticsCard
          title="Productivity Score"
          value={`${analyticsData.productivityScore}%`}
          icon={<Target className="text-green-400" size={24} />}
          subtitle="Based on completion patterns"
          trend={analyticsData.trends.productivityTrend}
        />
        <AnalyticsCard
          title="Consistency Score"
          value={`${analyticsData.consistencyScore}%`}
          icon={<Zap className="text-yellow-400" size={24} />}
          subtitle="Daily engagement level"
          trend={analyticsData.trends.consistencyTrend}
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
          {Object.entries(analyticsData.pagesVisited)
            .filter(([, usage]) => usage > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([feature, usage]) => (
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
                            ...Object.values(analyticsData.pagesVisited).filter(
                              (v) => v > 0
                            )
                          )) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      <WeeklyCompletionsChart data={analyticsData.weeklyTaskCompletions} />

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                🔥 {analyticsData.achievementsByType.streak_milestone || 0}
              </span>
              <span>
                🏆 {analyticsData.achievementsByType.points_milestone || 0}
              </span>
              <span>
                ✅ {analyticsData.achievementsByType.task_completionist || 0}
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
            description="Your highest completion day in the last 14 days"
            icon="🏆"
          />
          <InsightCard
            title="Productive Hour"
            value={formatHour(analyticsData.mostProductiveHour)}
            description="Best time to focus"
            icon="💡"
          />
          <InsightCard
            title="Avg. Completion"
            value={formatDuration(analyticsData.averageCompletionTime)}
            description="From creation to completion"
            icon="⏱️"
          />
          <InsightCard
            title="Weekly Growth"
            value={`+${
              analyticsData.weeklyTaskCompletions[
                analyticsData.weeklyTaskCompletions.length - 1
              ] - analyticsData.weeklyTaskCompletions[0]
            }`}
            description="Tasks improvement this month"
            icon="📈"
          />
        </div>
      </div>
      <div className="bg-background-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-text-low">
            14-Day Overview
          </h2>
          <div className="text-right tooltip-container">
            <div className="text-sm text-text-gray">Current Streak</div>
            <span
              className="text-lg font-bold text-primary"
              data-tooltip-id="current-streak-tooltip"
              data-tooltip-content="Streak is preserved if you were logged in for that day"
            >
              {user.currentStreak} day{user.currentStreak !== 1 ? "s" : ""}
            </span>
            <Tooltip
              id="current-streak-tooltip"
              className="tooltip-diff-arrow"
              classNameArrow="tooltip-arrow"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-3">
          {days.map((day, index) => (
            <DayBox key={index} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}
function DayBox({ day }: { day: DayData }) {
  const hasCompletedTasks = day.tasksCompleted > 0;

  return (
    <div
      className={`
        relative rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-between
        ${
          hasCompletedTasks
            ? "bg-green-500/10 border border-green-500/30"
            : "bg-background-600 border border-background-500"
        }
        ${day.isToday ? "ring-2 ring-blue-400/50" : ""}
        transition-all duration-200 hover:bg-opacity-80
      `}
    >
      <div className="text-xs text-text-gray font-medium mb-1">
        {day.dayName}
      </div>

      <div
        className={`
          text-xl font-bold mb-1
          ${hasCompletedTasks ? "text-green-400" : "text-text-low"}
        `}
      >
        {day.dayNumber}
      </div>

      {hasCompletedTasks && (
        <div className="text-xs text-green-400 font-medium leading-tight">
          {day.tasksCompleted} task{day.tasksCompleted !== 1 ? "s" : ""}
          <br />
          completed
        </div>
      )}

      {day.isToday && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></div>
      )}
    </div>
  );
}
interface AnalyticsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  trend: number;
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
        {trend !== 0 && (
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
