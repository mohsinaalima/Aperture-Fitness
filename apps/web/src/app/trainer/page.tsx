"use client";

import React, { useState } from "react";
import {
  Users,
  MessageSquare,
  Calendar,
  PlusCircle,
  CheckCircle2,
  Clock,
  X,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

interface Client {
  id: string;
  name: string;
  assignedPlan: string;
  lastActive: string;
  compliance: number;
  status: "On Track" | "Needs Review";
  recentPR: string;
}

const CLIENT_ROSTER: Client[] = [
  {
    id: "cl-1",
    name: "Alex Foster",
    assignedPlan: "Hypertrophy Block A",
    lastActive: "Today 08:30 AM",
    compliance: 92,
    status: "On Track",
    recentPR: "Squat 142.5kg x 5",
  },
  {
    id: "cl-2",
    name: "Sarah Jenkins",
    assignedPlan: "Strength Peaking Phase 1",
    lastActive: "Yesterday",
    compliance: 85,
    status: "On Track",
    recentPR: "Bench 80kg x 3",
  },
  {
    id: "cl-3",
    name: "Jordan Lee",
    assignedPlan: "Engine & Capacity Deload",
    lastActive: "4 days ago",
    compliance: 60,
    status: "Needs Review",
    recentPR: "Deadlift 180kg x 1",
  },
];

export default function TrainerDashboardPage() {
  const [selectedClient, setSelectedClient] = useState<Client>(
    CLIENT_ROSTER[0],
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='border-b border-[var(--color-border-default)] pb-4'>
          <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
            Coach Portal
          </span>
          <h1 className='font-display text-[32px] font-semibold text-[var(--color-text-primary)]'>
            Trainer Workspace
          </h1>
        </div>

        {/* Desktop 2-Pane Roster & Detail Drawer (Section 14 & 18.14) */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Client Roster Table (2/3 width on desktop) */}
          <div className='lg:col-span-2'>
            <Card className='p-0 overflow-hidden'>
              <div className='p-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] flex items-center justify-between'>
                <h2 className='font-display text-[18px] font-semibold'>
                  Client Roster
                </h2>
                <span className='tabular-nums text-[12px] font-mono text-[var(--color-text-muted)]'>
                  3 Active Clients
                </span>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full text-left text-[14px]'>
                  <thead>
                    <tr className='border-b border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                      <th className='p-4'>Client Name</th>
                      <th className='p-4'>Assigned Plan</th>
                      <th className='p-4 text-right'>Compliance</th>
                      <th className='p-4'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-[var(--color-border-default)]'>
                    {CLIENT_ROSTER.map((client) => {
                      const isSelected = selectedClient.id === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDrawerOpen(true);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[var(--color-accent-subtle)]"
                              : "hover:bg-[var(--color-surface-elevated-2)]"
                          }`}
                        >
                          <td className='p-4 font-medium text-[var(--color-text-primary)]'>
                            {client.name}
                          </td>
                          <td className='p-4 text-[var(--color-text-secondary)]'>
                            {client.assignedPlan}
                          </td>
                          <td className='p-4 text-right font-mono font-medium text-[var(--color-accent-primary)]'>
                            {client.compliance}%
                          </td>
                          <td className='p-4'>
                            {client.status === "On Track" ? (
                              <span className='text-[12px] font-mono text-[var(--color-accent-primary)] font-semibold'>
                                On Track
                              </span>
                            ) : (
                              <span className='text-[12px] font-mono text-[var(--color-warning)] font-semibold'>
                                Needs Review
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right-side Detail Drawer Pane (Section 14 & 18.14) */}
          <div className='lg:col-span-1'>
            {isDrawerOpen && selectedClient && (
              <Card className='border-[var(--color-border-strong)] sticky top-20 space-y-4'>
                <CardHeader className='flex flex-row items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
                  <div>
                    <CardTitle className='text-[20px]'>
                      {selectedClient.name}
                    </CardTitle>
                    <p className='text-[12px] font-mono text-[var(--color-text-muted)] mt-0.5'>
                      Last Active: {selectedClient.lastActive}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className='lg:hidden'
                  >
                    <X className='h-4 w-4 text-[var(--color-text-muted)]' />
                  </button>
                </CardHeader>

                <CardContent className='space-y-4 pt-1'>
                  {/* Iris Compliance Metric */}
                  <div className='flex items-center gap-4 p-3 rounded-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)]'>
                    <ApertureIrisProgress
                      value={selectedClient.compliance}
                      size={48}
                    />
                    <div>
                      <span className='text-[11px] font-mono text-[var(--color-text-muted)] uppercase'>
                        Program Adherence
                      </span>
                      <div className='tabular-nums text-[22px] font-mono font-medium text-[var(--color-text-primary)] leading-none mt-0.5'>
                        {selectedClient.compliance}%
                      </div>
                    </div>
                  </div>

                  {/* Active Plan Detail */}
                  <div className='space-y-1'>
                    <span className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                      Current Plan
                    </span>
                    <p className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                      {selectedClient.assignedPlan}
                    </p>
                  </div>

                  {/* Latest Breakthrough */}
                  <div className='space-y-1'>
                    <span className='text-[12px] font-mono text-[var(--color-text-muted)] uppercase'>
                      Latest Breakthrough
                    </span>
                    <p className='text-[13px] font-mono text-[var(--color-accent-primary)]'>
                      {selectedClient.recentPR}
                    </p>
                  </div>

                  {/* Primary Drawer Actions (Section 14 & 18.14) */}
                  <div className='pt-2 space-y-2'>
                    <Button className='w-full gap-2 text-[13px]'>
                      <MessageSquare className='h-4 w-4' />
                      <span>Message Client</span>
                    </Button>
                    <Button
                      variant='secondary'
                      className='w-full gap-2 text-[13px]'
                    >
                      <Calendar className='h-4 w-4' />
                      <span>Assign Plan</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
