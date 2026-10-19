"use client";

import React, { useEffect, useState } from "react";
import { 
  UserPlus,
  Search, 
  CheckCircle2, 
  Clock,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";

type TrainerRosterItem = {
  id: string;
  name: string;
  specialization: string;
  presentToday: boolean;
  checkInTime: string;
  assignedClients: number;
  feeStatus: string;
  monthlyRevenue: string;
};

export default function OwnerDashboardPage() {
  const [search, setSearch] = useState("");
  const [trainers, setTrainers] = useState<TrainerRosterItem[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"trainer" | "staff">("trainer");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchApi<{ roster: TrainerRosterItem[] }>("/api/owner/dashboard")
      .then(({ roster }) => { if (active) setTrainers(roster); })
      .catch((error: unknown) => {
        if (active) console.error("Could not load owner dashboard:", error);
      });
    return () => { active = false; };
  }, []);

  const filteredTrainers = trainers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const totalTrainers = trainers.length;
  const presentToday = trainers.filter((t) => t.presentToday).length;
  const paidCount = trainers.filter((t) => t.feeStatus === "Paid").length;
  const totalManagedMembers = trainers.reduce((sum, trainer) => sum + trainer.assignedClients, 0);

  const handleInviteTrainer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setInviteError(null);
    setIsInviting(true);
    try {
      await fetchApi("/api/onboarding/gym/invitations", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const dashboard = await fetchApi<{ roster: TrainerRosterItem[] }>("/api/owner/dashboard");
      setTrainers(dashboard.roster);
      setInviteEmail("");
      setIsInviteOpen(false);
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Could not invite trainer. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

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

          <Button className="gap-2 text-[13px]" onClick={() => { setInviteError(null); setIsInviteOpen(true); }}>
            <UserPlus className="h-4 w-4" />
            <span>Invite Trainer or Staff</span>
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
              {totalTrainers ? Math.round((presentToday / totalTrainers) * 100) : 0}% Check-in rate
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
              {totalTrainers - paidCount} Pending Invoice{totalTrainers - paidCount === 1 ? "" : "s"}
            </p>
          </Card>

          {/* Total Active Clients */}
          <Card className="p-4 space-y-1">
            <span className="text-[12px] font-mono text-[var(--color-text-muted)] uppercase">
              Managed Members
            </span>
            <div className="tabular-nums text-[36px] font-medium font-mono text-[var(--color-text-primary)] leading-none pt-1">
              {totalManagedMembers}
            </div>
            <p className="text-[12px] text-[var(--color-text-secondary)] pt-1">
              Across all {totalTrainers} trainers
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
      {isInviteOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#0e1113]/80 p-4 backdrop-blur-sm'>
          <form onSubmit={handleInviteTrainer} className='w-full max-w-[420px] space-y-4 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'>
              <h2 className='font-display text-[20px] font-semibold'>Invite a trainer or staff member</h2>
              <button type='button' aria-label='Close invitation form' onClick={() => setIsInviteOpen(false)} className='text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'>×</button>
            </div>
            <p className='text-[13px] text-[var(--color-text-secondary)]'>The person must already have an Aperture account to receive this in-app invitation.</p>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>Account email<input required type='email' value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className='w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5 font-body text-[14px] normal-case text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none' /></label>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>Gym role<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as "trainer" | "staff")} className='w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5 font-body text-[14px] normal-case text-[var(--color-text-primary)]'><option value='trainer'>Trainer</option><option value='staff'>Staff</option></select></label>
            {inviteError && <p role='alert' className='text-[13px] text-[var(--color-error)]'>{inviteError}</p>}
            <Button type='submit' disabled={isInviting} className='w-full'>{isInviting ? "Sending invitation…" : "Send invitation"}</Button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
