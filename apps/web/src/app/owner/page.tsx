"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  UserPlus, 
  Building2, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

// Sample Data: Trainer Roster with Attendance & Fee Compliance
const TRAINERS_ROSTER = [
  {
    id: "tr-1",
    name: "Marcus Vance",
    specialization: "Hypertrophy & Power",
    presentToday: true,
    checkInTime: "06:15 AM",
    assignedClients: 24,
    feeStatus: "Paid",
    monthlyRevenue: "$2,400",
  },
  {
    id: "tr-2",
    name: "Elena Rostova",
    specialization: "Strength & Conditioning",
    presentToday: true,
    checkInTime: "07:30 AM",
    assignedClients: 19,
    feeStatus: "Paid",
    monthlyRevenue: "$1,900",
  },
  {
    id: "tr-3",
    name: "David Chen",
    specialization: "Olympic Weightlifting",
    presentToday: false,
    checkInTime: "—",
    assignedClients: 15,
    feeStatus: "Pending",
    monthlyRevenue: "$1,500",
  },
  {
    id: "tr-4",
    name: "Sarah Miller",
    specialization: "Endurance & GPP",
    presentToday: true,
    checkInTime: "08:00 AM",
    assignedClients: 28,
    feeStatus: "Paid",
    monthlyRevenue: "$2,800",
  },
];

export default function OwnerDashboardPage() {
  const [search, setSearch] = useState("");

  const filteredTrainers = TRAINERS_ROSTER.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const totalTrainers = TRAINERS_ROSTER.length;
  const presentToday = TRAINERS_ROSTER.filter((t) => t.presentToday).length;
  const paidCount = TRAINERS_ROSTER.filter((t) => t.feeStatus === "Paid").length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border-default)] pb-4">
          <div>
            <span className="text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase">
              Facility Management
            </span>
            <h1 className="font-display text-[32px] font-semibold text-[var(--color-text-primary)]">
              Gym Owner Portal
            </h1>
          </div>

          <Button className="gap-2 text-[13px]">
            <UserPlus className="h-4 w-4" />
            <span>Invite Trainer</span>
          </Button>
        </div>

        {/* Aggregate KPI Metric Row (Section 14 & 18.15) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Trainers */}
          <Card className="p-4 space-y-1">
            <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
              Total Gym Trainers
            </span>
            <div className="tabular-nums text-[36px] font-medium font-mono text-[var(--color-text-primary)] leading-none pt-1">
              {totalTrainers}
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)] pt-1">
              Active staff roster
            </p>
          </Card>

          {/* Today's Trainer Attendance */}
          <Card className="p-4 space-y-1">
            <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
              Present Today
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="tabular-nums text-[36px] font-medium font-mono text-[var(--color-accent-primary)] leading-none">
                {presentToday}
              </span>
              <span className="text-[14px] font-mono text-[var(--color-text-secondary)]">
                / {totalTrainers}
              </span>
            </div>
            <p className="text-[12px] text-[var(--color-accent-primary)] pt-1 font-medium">
              75% Check-in rate
            </p>
          </Card>

          {/* Fee Collection Status */}
          <Card className="p-4 space-y-1">
            <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
              Fee Compliance
            </span>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="tabular-nums text-[36px] font-medium font-mono text-[var(--color-text-primary)] leading-none">
                {paidCount}
              </span>
              <span className="text-[14px] font-mono text-[var(--color-text-secondary)]">
                Paid
              </span>
            </div>
            <p className="text-[12px] text-[var(--color-warning)] pt-1 font-medium">
              1 Pending Invoice
            </p>
          </Card>

          {/* Total Active Clients */}
          <Card className="p-4 space-y-1">
            <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
              Managed Members
            </span>
            <div className="tabular-nums text-[36px] font-medium font-mono text-[var(--color-text-primary)] leading-none pt-1">
              86
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)] pt-1">
              Across all 4 trainers
            </p>
          </Card>
        </div>

        {/* Drill-down Trainer Roster Table (Section 14 & 18.15) */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-[18px] font-semibold">
              Trainer Roster & Daily Attendance
            </h2>

            <div className="relative max-w-[320px] w-full">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                placeholder="Search trainer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-1.5 text-[13px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
                  <th className="p-4">Trainer Name</th>
                  <th className="p-4">Today&apos;s Attendance</th>
                  <th className="p-4">Check-in Time</th>
                  <th className="p-4 text-right">Clients</th>
                  <th className="p-4">Fee Status</th>
                  <th className="p-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-default)]">
                {filteredTrainers.map((tr) => (
                  <tr key={tr.id} className="hover:bg-[var(--color-surface-elevated-2)] transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[var(--color-text-primary)]">{tr.name}</div>
                      <span className="text-[12px] text-[var(--color-text-muted)]">{tr.specialization}</span>
                    </td>
                    <td className="p-4">
                      {tr.presentToday ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[var(--color-accent-subtle)] border border-[var(--color-accent-primary)] text-[12px] font-mono text-[var(--color-accent-primary)] font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[var(--color-surface-elevated-2)] border border-[var(--color-border-default)] text-[12px] font-mono text-[var(--color-text-muted)]">
                          <Clock className="h-3.5 w-3.5" /> Absent
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-[13px] text-[var(--color-text-secondary)]">
                      {tr.checkInTime}
                    </td>
                    <td className="p-4 text-right font-mono text-[14px] text-[var(--color-text-primary)]">
                      {tr.assignedClients}
                    </td>
                    <td className="p-4">
                      {tr.feeStatus === "Paid" ? (
                        <span className="text-[13px] font-mono text-[var(--color-accent-primary)] font-semibold">
                          Paid
                        </span>
                      ) : (
                        <span className="text-[13px] font-mono text-[var(--color-warning)] font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-mono text-[14px] text-[var(--color-text-primary)]">
                      {tr.monthlyRevenue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}