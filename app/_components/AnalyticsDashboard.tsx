"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { BarChart3, Target, Eye, Activity, Zap, Award } from "lucide-react";
import { AnalyticsData, AppUser } from "../_types/types";
// Removed server action imports - using API routes instead
import { formatDuration, formatHour, formatDate } from "../_utils/utils";
import { subDays, isToday, format } from "date-fns";
import { Tooltip } from "react-tooltip";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import { AnalyticsLoadingSkeleton } from "./skeleton/AnalyticsLoadingSkeleton";

export default function AnalyticsDashboard({ user }: { user: AppUser }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const fetchAnalyticsData = useCallback(async () => {
    try {
      if (!user.uid) {
        return;
      }

      setHasError(false);
      startTransition(async () => {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const analyticsResponse = await fetch(
            `/api/analytics?tz=${encodeURIComponent(tz)}`,
            {
              cache: "no-store",
              headers: { "x-timezone": tz },
            },
          );
          if (!analyticsResponse.ok) {
            throw new Error(
              `Analytics API failed: ${analyticsResponse.status}`,
            );
          }
          const data = await analyticsResponse.json();
          setAnalyticsData(data);
        } catch (innerError) {
          console.error("Error in transition:", innerError);
          setHasError(true);
        }
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setHasError(true);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (isLoading || (!analyticsData && !hasError)) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!analyticsData) {
    return <AnalyticsErrorState onRetry={fetchAnalyticsData} />;
  }

  const days: DayData[] = [];
  const today = new Date();

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

  const { hourDistribution, mostProductiveHour } = hourStatsFromTimestamps(
    analyticsData.recentCompletionTimestamps,
    analyticsData.hourDistribution,
    analyticsData.mostProductiveHour,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap gap-3">
        <AnalyticsCard
          title="Avg Session Duration"
          value={formatDuration(analyticsData.sessionDuration)}
          icon={<Activity className="text-blue-400" size={24} />}
          subtitle={`${analyticsData.pageViews} page views`}
          trend={analyticsData.trends.sessionDurationTrend}
          tooltip="Average active time per session over the last 30 days. Updated on navigation and when the session ends."
        />
        <AnalyticsCard
          title="Active Time"
          value={formatDuration(analyticsData.activeTime)}
          icon={<Zap className="text-teal-400" size={24} />}
          subtitle="Time in the last 30 days"
          trend={null}
          tooltip="Total active time across all sessions in the last 30 days. Updated on navigation and when the session ends."
        />
        <AnalyticsCard
          title="Productivity Score"
          value={`${analyticsData.productivityScore}%`}
          icon={<Target className="text-green-400" size={24} />}
          subtitle="Based on completion patterns"
          trend={analyticsData.trends.productivityTrend}
          tooltip="(Task completion rate × 60%) + (Consistency Score × 40%) over the last 30 days. Completion rate is capped at 100% so repeating tasks don't inflate the score."
        />
        <AnalyticsCard
          title="Consistency Score"
          value={`${analyticsData.consistencyScore}%`}
          icon={<Zap className="text-yellow-400" size={24} />}
          subtitle="Daily engagement level"
          trend={analyticsData.trends.consistencyTrend}
          tooltip="Days with at least one session ÷ the last 30 days (or days since you signed up, if fewer). Measures how regularly you open the app."
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
                              (v) => v > 0,
                            ),
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

      <WeeklyPointsGrowthChart data={analyticsData.pointsGrowth} />
      {/* Achievement Analytics */}
      <div className="bg-background-700 rounded-lg p-6 relative">
        <h3 className="sm:mt-0 mt-3 text-lg font-semibold text-text-high mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-400" />
          All Achievements
        </h3>
        {analyticsData.allAchievements.length > 0 ? (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {analyticsData.allAchievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex sm:gap-0 flex-wrap gap-1 items-center justify-between py-2 px-3 rounded-lg bg-background-600 hover:bg-background-500 transition-colors"
                >
                  <span className="text-nowrap flex items-center space-x-3">
                    <span className="text-2xl">
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
                  </span>
                  <span className="text-xs text-text-low">
                    {formatDate(achievement.unlockedAt)}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-2 right-2 flex items-center gap-2 text-sm">
              Total:
              <span
                className="flex items-center gap-1"
                data-tooltip-id="streak-milestone-tooltip"
                data-tooltip-content="Streak milestone"
              >
                🔥 {analyticsData.achievementsByType.streak_milestone || 0}
              </span>
              <Tooltip
                id="streak-milestone-tooltip"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
              <span
                className="flex items-center gap-1"
                data-tooltip-id="points-milestone-tooltip"
                data-tooltip-content="Points milestone"
              >
                🏆 {analyticsData.achievementsByType.points_milestone || 0}
              </span>
              <Tooltip
                id="points-milestone-tooltip"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
              <span
                className="flex items-center gap-1"
                data-tooltip-id="task-completionist-tooltip"
                data-tooltip-content="Task completionist"
              >
                ✅ {analyticsData.achievementsByType.task_completionist || 0}
              </span>
              <Tooltip
                id="task-completionist-tooltip"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
            </div>
          </>
        ) : (
          <p className="text-text-low text-sm">
            No achievements yet. Complete tasks to unlock achievements!
          </p>
        )}
      </div>
      {/* Quick Insights */}
      <div className="bg-background-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InsightCard
            title="Best Day"
            value={`${Math.max(...analyticsData.dailyTaskCompletions)} tasks`}
            description="Your highest completion day in the last 14 days"
            icon="🏆"
          />
          <InsightCard
            title="Productive Hour"
            value={formatHour(mostProductiveHour)}
            description="Hour with the most completions in the last 30 days"
            icon="💡"
          />
        </div>
        {hourDistribution.some((count) => count > 0) && (
          <HourDistribution
            distribution={hourDistribution}
            mostProductiveHour={mostProductiveHour}
          />
        )}
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
interface DayData {
  date: Date;
  dayNumber: number;
  dayName: string;
  tasksCompleted: number;
  isToday: boolean;
}

function hourStatsFromTimestamps(
  timestamps: number[] | undefined,
  fallbackDistribution: number[] | undefined,
  fallbackHour: number,
): { hourDistribution: number[]; mostProductiveHour: number } {
  if (!timestamps?.length) {
    return {
      hourDistribution: fallbackDistribution ?? Array.from({ length: 24 }, () => 0),
      mostProductiveHour: fallbackHour,
    };
  }

  const hourDistribution = Array.from({ length: 24 }, () => 0);
  const latestByHour = Array.from({ length: 24 }, () => 0);
  timestamps.forEach((ts) => {
    const hour = new Date(ts).getHours();
    if (hour < 0 || hour > 23) return;
    hourDistribution[hour]++;
    if (ts > latestByHour[hour]) latestByHour[hour] = ts;
  });

  let mostProductiveHour = -1;
  let bestCount = 0;
  let bestLatest = 0;
  hourDistribution.forEach((count, hour) => {
    if (
      count > bestCount ||
      (count === bestCount && count > 0 && latestByHour[hour] > bestLatest)
    ) {
      bestCount = count;
      bestLatest = latestByHour[hour];
      mostProductiveHour = hour;
    }
  });

  return { hourDistribution, mostProductiveHour };
}

const WeeklyPointsGrowthChart = ({ data }: { data: number[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-background-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-accent" />
          Weekly Points Growth
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-text-high font-semibold">No data available</p>
        </div>
      </div>
    );
  }

  // Strip oldest empty weeks; keep the current week even if it's 0
  const firstNonZero = data.findIndex((value) => value > 0);
  const meaningfulData =
    firstNonZero === -1 ? [] : data.slice(firstNonZero);

  if (meaningfulData.length === 0 || meaningfulData.every((value) => value === 0)) {
    return (
      <div className="bg-background-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-high mb-4 flex items-center">
          <Award className="w-5 h-5 mr-2 text-accent" />
          Weekly Points Growth
        </h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-text-high font-semibold">No data available</p>
        </div>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = meaningfulData.map((points, index) => {
    const weeksFromEnd = meaningfulData.length - 1 - index;
    const week =
      weeksFromEnd === 0
        ? "This week"
        : weeksFromEnd === 1
          ? "Last week"
          : `${weeksFromEnd}w ago`;
    return { week, points };
  });

  return (
    <div className="bg-background-700 rounded-lg sm:p-6 py-6 px-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Award className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-high">
              Weekly Points Growth
            </h2>
            <p className="text-text-low text-sm">Points earned over time</p>
          </div>
        </div>
      </div>

      <div className="h-80 relative">
        <ResponsiveContainer width="100%" height="100%" className="-ml-6">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <ChartTooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#f9fafb",
              }}
            />
            <Line
              type="monotone"
              dataKey="points"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
              activeDot={{
                r: 6,
                stroke: "#f59e0b",
                strokeWidth: 2,
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

function DayBox({ day }: { day: DayData }) {
  const hasCompletedTasks = day.tasksCompleted > 0;
  const hasActivity = hasCompletedTasks;

  return (
    <div
      className={`
        relative rounded-lg p-3 text-center min-h-[80px] flex flex-col justify-between
        ${
          hasActivity
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
          ${hasActivity ? "text-green-400" : "text-text-low"}
        `}
      >
        {day.dayNumber}
      </div>

      {hasCompletedTasks && (
        <div className="text-xs font-medium leading-tight space-y-1">
          {hasCompletedTasks && (
            <div className="text-green-400">{day.tasksCompleted} completed</div>
          )}
        </div>
      )}

      {day.isToday && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></div>
      )}
    </div>
  );
}

function AnalyticsCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  tooltip,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle: string;
  trend: number | null;
  tooltip: string;
}) {
  const tooltipId = `analytics-card-${title
    .toLowerCase()
    .replace(/\s+/g, "-")}`;

  return (
    <>
      <div
        className="bg-background-700 rounded-lg p-6 hover:bg-background-600 transition-colors duration-200"
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltip}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-text-low">{title}</h3>
          </div>
          {icon}
        </div>
        <p className="text-2xl font-bold text-text-high">{value}</p>
        <div className="flex items-center justify-between mt-2 tooltip-container">
          <p className="text-sm text-text-low">{subtitle}</p>
          {trend != null && trend !== 0 && (
            <>
              <span
                data-tooltip-id="trend-tooltip"
                data-tooltip-content="Trend is calculated by comparing current period (last 15 days) to previous period (15-30 days ago)"
                className={`text-xs px-2 py-1 rounded-full ${
                  trend > 0
                    ? "bg-success/20 text-success"
                    : "bg-error/20 text-error"
                }`}
              >
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>
              <Tooltip
                id="trend-tooltip"
                className="tooltip-diff-arrow"
                classNameArrow="tooltip-arrow"
              />
            </>
          )}
        </div>
      </div>
      <Tooltip
        id={tooltipId}
        className="tooltip-diff-arrow max-w-xs"
        classNameArrow="tooltip-arrow"
      />
    </>
  );
}

function HourDistribution({
  distribution,
  mostProductiveHour,
}: {
  distribution: number[];
  mostProductiveHour: number;
}) {
  const max = Math.max(...distribution, 0);
  if (max === 0) return null;

  const chartHeight = 96;

  return (
    <div className="mt-6">
      <p className="text-sm text-text-low mb-3">
        Completions by hour (last 30 days)
      </p>
      <div
        className="flex items-end gap-px"
        style={{ height: chartHeight }}
      >
        {distribution.map((count, hour) => {
          const isPeak = hour === mostProductiveHour;
          const barHeight =
            count > 0
              ? Math.max(Math.round((count / max) * chartHeight), 8)
              : 3;
          return (
            <div
              key={hour}
              className="flex-1 h-full flex flex-col justify-end min-w-0"
              data-tooltip-id="hour-bar-tooltip"
              data-tooltip-content={`${formatHour(hour)} · ${count} completion${
                count !== 1 ? "s" : ""
              }`}
            >
              <div
                className={`w-full rounded-t ${
                  isPeak ? "bg-primary-400" : "bg-background-500"
                }`}
                style={{ height: barHeight }}
              />
            </div>
          );
        })}
      </div>
      <Tooltip
        id="hour-bar-tooltip"
        className="tooltip-diff-arrow"
        classNameArrow="tooltip-arrow"
      />
      <div className="flex justify-between text-[10px] text-text-low mt-1">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>11 PM</span>
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
