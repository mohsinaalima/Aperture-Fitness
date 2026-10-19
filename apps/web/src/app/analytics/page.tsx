"use client";

import React, { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { fetchApi } from "@/lib/api";

interface AnalyticsData {
  exercise_name: string;
  current_e1rm: number;
  consistency_score: number;
  volume_data: typeof VOLUME_DATA;
  strength_data: typeof STRENGTH_DATA;
  pr_history: typeof PR_HISTORY;
}

// Sample Datasets (Instrument Graphite single-series rules)
const VOLUME_DATA = [
  { week: "W1", volume: 22400 },
  { week: "W2", volume: 24100 },
  { week: "W3", volume: 23800 },
  { week: "W4", volume: 26500 },
  { week: "W5", volume: 25900 },
  { week: "W6", volume: 28200 },
  { week: "W7", volume: 27800 },
  { week: "W8", volume: 31000 },
];

const STRENGTH_DATA = [
  { month: "Mar", e1rm: 110, isPR: false },
  { month: "Apr", e1rm: 112.5, isPR: false },
  { month: "May", e1rm: 115, isPR: false },
  { month: "Jun", e1rm: 115, isPR: false },
  { month: "Jul", e1rm: 118, isPR: false },
  { month: "Aug", e1rm: 122.5, isPR: true }, // Accent reserved exclusively for latest PR
];

const PR_HISTORY = [
  { exercise: "Barbell Back Squat", metric: "142.5 kg x 5", date: "Aug 22, 2026", delta: "+5.0 kg" },
  { exercise: "Barbell Bench Press", metric: "105.0 kg x 4", date: "Aug 18, 2026", delta: "+2.5 kg" },
  { exercise: "Romanian Deadlift", metric: "160.0 kg x 8", date: "Aug 10, 2026", delta: "+10.0 kg" },
];

export default function AnalyticsPage() {
  const [selectedExercise, setSelectedExercise] = useState("Barbell Bench Press");
  const [timeframe, setTimeframe] = useState("12 Weeks");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    const query = new URLSearchParams({ exercise: selectedExercise, timeframe });
    fetchApi<AnalyticsData>(`/analytics?${query.toString()}`)
      .then((data) => { if (isCurrent) { setAnalytics(data); setAnalyticsError(null); } })
      .catch((error: unknown) => { if (isCurrent) setAnalyticsError(error instanceof Error ? error.message : "Analytics could not be loaded."); });
    return () => { isCurrent = false; };
  }, [selectedExercise, timeframe]);

  const strengthData = analytics?.strength_data ?? STRENGTH_DATA;
  const allVolumeData = analytics?.volume_data ?? VOLUME_DATA;
  const volumeLimit = timeframe === "4 Weeks" ? 4 : timeframe === "12 Weeks" ? 12 : timeframe === "6 Months" ? 26 : allVolumeData.length;
  const volumeData = allVolumeData.slice(-volumeLimit);
  const personalRecords = analytics?.pr_history ?? PR_HISTORY;
  const currentE1rm = analytics?.current_e1rm ?? strengthData.at(-1)?.e1rm ?? 0;
  const consistencyScore = analytics?.consistency_score ?? 92;
  const latestVolume = volumeData.at(-1)?.volume ?? 0;
  const priorVolumes = volumeData.slice(0, -1).map((point) => point.volume);
  const averagePriorVolume = priorVolumes.length ? priorVolumes.reduce((sum, value) => sum + value, 0) / priorVolumes.length : 0;
  const volumeChange = averagePriorVolume ? ((latestVolume - averagePriorVolume) / averagePriorVolume) * 100 : 0;
  const chartMin = Math.min(...strengthData.map((point) => point.e1rm), currentE1rm) - 5;
  const chartMax = Math.max(...strengthData.map((point) => point.e1rm), currentE1rm) + 5;
  const chartPoints = strengthData.map((point, index) => ({
    ...point,
    x: strengthData.length < 2 ? 250 : 20 + index * (440 / (strengthData.length - 1)),
    y: 130 - ((point.e1rm - chartMin) / Math.max(1, chartMax - chartMin)) * 100,
  }));
  const chartPath = chartPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--color-border-default)] pb-4">
          <div>
            <span className="text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Performance Diagnostic
            </span>
            <h1 className="font-display text-[32px] font-semibold text-[var(--color-text-primary)]">
              Progress Analytics
            </h1>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[var(--color-text-muted)] font-mono">Range:</span>
            <div className="flex bg-[var(--color-surface-elevated)] p-1 rounded-sm border border-[var(--color-border-default)]">
              {["4 Weeks", "12 Weeks", "6 Months", "All Time"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  aria-pressed={timeframe === tf}
                  className={`px-3 py-1 rounded-sm text-[12px] font-mono transition-colors cursor-pointer ${
                    timeframe === tf
                      ? "bg-[var(--color-accent-subtle)] text-[var(--color-accent-primary)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {analyticsError && <p role='status' className='rounded-sm border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-3 py-2 text-[12px] text-[var(--color-warning)]'>Live analytics are unavailable. Showing sample training data.</p>}

        {/* Layout: Desktop Left Filter Rail + Main Analytical Cards (Section 14 & 18.10) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Rail Controls (Desktop Filter Rail) */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-[15px] flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[var(--color-text-secondary)]" />
                  <span>Metric Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
                    Target Exercise
                  </label>
                  <select
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2 text-[13px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  >
                    <option value="Barbell Bench Press">Barbell Bench Press</option>
                    <option value="Barbell Back Squat">Barbell Back Squat</option>
                    <option value="Conventional Deadlift">Conventional Deadlift</option>
                    <option value="Overhead Press">Overhead Press</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-[var(--color-border-default)] space-y-2">
                  <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
                    Formula Specification
                  </span>
                  <div className="p-2.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[12px] text-[var(--color-text-secondary)]">
                    Epley 1RM Model: <br />
                    <span className="font-mono text-[var(--color-text-primary)]">w × (1 + r / 30)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consistency Score Card (Section 12.5) */}
            <Card className="border-[var(--color-accent-primary)]/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-[15px]">Consistency Score</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <ApertureIrisProgress value={consistencyScore} size={64} />
                <div>
                  <div className="tabular-nums text-[32px] font-medium leading-none text-[var(--color-text-primary)]">
                    {consistencyScore}%
                  </div>
                  <span className="text-[12px] text-[var(--color-accent-primary)] font-medium mt-1 inline-block">
                    High Adherence
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Analytics Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. Strength Progression Line Chart (Section 12.2) */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-[18px]">
                    Strength Progression ({selectedExercise})
                  </CardTitle>
                  <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
                    Estimated 1RM by training history
                  </p>
                </div>
                <div className="text-right">
                  <span className="tabular-nums text-[24px] font-medium text-[var(--color-accent-primary)]">
                    {currentE1rm.toLocaleString("en-US")} kg
                  </span>
                  <p className="text-[11px] font-mono text-[var(--color-text-muted)]">Current Est. 1RM</p>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                {/* SVG Line Sparkline Chart with Single PR Accent Point */}
                <div className="h-[200px] w-full relative flex items-end pt-6">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                    {/* Grid Hairlines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="var(--color-border-default)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="var(--color-border-default)" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="0" y1="130" x2="500" y2="130" stroke="var(--color-border-default)" strokeWidth="1" strokeDasharray="3 3" />

                    {/* Chart Hairline Path (Default text-secondary color per Section 12) */}
                    <path
                      d={chartPath}
                      fill="none"
                      stroke="var(--color-text-secondary)"
                      strokeWidth="2"
                    />

                    {/* Points */}
                    {chartPoints.map((pt, i) => {
                      const { x, y } = pt;
                      return (
                        <g key={i}>
                          <circle
                            cx={x}
                            cy={y}
                            r={pt.isPR ? "6" : "3.5"}
                            fill={pt.isPR ? "var(--color-accent-primary)" : "var(--color-surface-elevated)"}
                            stroke={pt.isPR ? "var(--color-accent-primary)" : "var(--color-text-secondary)"}
                            strokeWidth="2"
                          />
                          {/* PR Marker Badge */}
                          {pt.isPR && (
                            <g transform={`translate(${x - 18}, ${y - 28})`}>
                              <rect width="36" height="18" rx="3" fill="var(--color-accent-primary)" />
                              <text x="18" y="12" textAnchor="middle" fill="#0E1113" fontSize="10" fontWeight="bold">
                                PR!
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* X Axis Labels */}
                <div className="flex justify-between pt-3 border-t border-[var(--color-border-default)] mt-2">
                  {strengthData.map((pt, i) => (
                    <span key={i} className="text-[12px] font-mono text-[var(--color-text-muted)]">
                      {pt.month}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 2. Volume Trend & Frequency Heatmap Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Volume Trend Card (Section 12.1) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[16px]">Volume Trend ({timeframe})</CardTitle>
                  <p className="text-[12px] text-[var(--color-text-secondary)]">
                    Total load accumulated per week
                  </p>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-baseline justify-between mb-4">
                    <span className="tabular-nums text-[28px] font-medium text-[var(--color-text-primary)]">
                      {latestVolume.toLocaleString("en-US")} kg
                    </span>
                    <span className="text-[12px] text-[var(--color-accent-primary)] font-mono">
                      {volumeChange >= 0 ? "+" : ""}{volumeChange.toFixed(1)}% vs avg
                    </span>
                  </div>

                  {/* Hairline Bar Chart */}
                  <div className="h-[90px] flex items-end gap-2 pt-2">
                    {volumeData.map((v, i) => {
                      const maxVolume = Math.max(...volumeData.map((point) => point.volume), 1);
                      const heightPct = (v.volume / maxVolume) * 100;
                      const isLatest = i === volumeData.length - 1;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div
                            style={{ height: `${heightPct}%` }}
                            className={`w-full rounded-xs transition-all ${
                              isLatest
                                ? "bg-[var(--color-accent-primary)]"
                                : "bg-[var(--color-surface-elevated-2)] border border-[var(--color-border-default)]"
                            }`}
                          />
                          <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                            {v.week}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Personal Records List (Section 12.4) */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-[16px]">Recent Personal Records</CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                  {personalRecords.map((pr, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-[13px] font-semibold text-[var(--color-text-primary)]">
                          {pr.exercise}
                        </h4>
                        <span className="tabular-nums text-[12px] font-mono text-[var(--color-accent-primary)]">
                          {pr.metric}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[12px] font-mono text-[var(--color-accent-primary)] font-semibold">
                          {pr.delta}
                        </span>
                        <p className="text-[11px] text-[var(--color-text-muted)]">{pr.date}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
