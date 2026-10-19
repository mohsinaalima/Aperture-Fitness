"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  X,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAppStore } from "@/store/app-store";

interface Client {
  id: string;
  name: string;
  assignedPlan: string;
  lastActive: string;
  compliance: number;
  status: "On Track" | "Needs Review";
  recentPR: string | null;
}

export default function TrainerDashboardPage() {
  const plans = useAppStore((state) => state.plans);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || "");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    let active = true;
    fetchApi<Client[]>("/trainer/clients")
      .then((roster) => {
        if (!active) return;
        setClients(roster);
        setSelectedClient(roster[0] ?? null);
      })
      .catch((error: unknown) => {
        if (active) setAssignError(error instanceof Error ? error.message : "Could not load trainer clients.");
      });
    return () => { active = false; };
  }, []);

  const assignPlan = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const plan = plans.find((item) => item.id === selectedPlanId);
    const client = selectedClient;
    if (!plan || !client) return;
    setAssignError(null);
    try {
      const updatedClient = await fetchApi<Client>(`/trainer/clients/${encodeURIComponent(client.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ assignedPlan: plan.name }),
      });
      setSelectedClient(updatedClient);
      setClients((current) => current.map((client) => client.id === updatedClient.id ? updatedClient : client));
      setIsAssignOpen(false);
    } catch (error) {
      setAssignError(error instanceof Error ? error.message : "Could not assign this plan.");
    }
  };

  const inviteClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setInviteError(null); setIsInviting(true);
    try {
      await fetchApi("/api/onboarding/trainer/invitations", {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      setInviteSent(true);
      setInviteEmail("");
    } catch (error) {
      setInviteError(error instanceof Error ? error.message : "Could not send this invitation.");
    } finally { setIsInviting(false); }
  };

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
                <div className="flex items-center gap-3">
                  <h2 className='font-display text-[18px] font-semibold'>Client Roster</h2>
                  <Button variant="secondary" onClick={() => { setInviteError(null); setInviteSent(false); setIsInviteOpen(true); }}><UserPlus className="mr-1 h-4 w-4" />Invite client</Button>
                </div>
                <span className='tabular-nums text-[12px] font-mono text-[var(--color-text-muted)]'>
                  {clients.length} Active Clients
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
                    {clients.map((client) => {
                      const isSelected = selectedClient?.id === client.id;
                      return (
                        <tr
                          key={client.id}
                          onClick={() => {
                            setSelectedClient(client);
                            setIsDrawerOpen(true);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedClient(client);
                              setIsDrawerOpen(true);
                            }
                          }}
                          tabIndex={0}
                          aria-selected={isSelected}
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
              {clients.length === 0 && <p className='p-6 text-center text-[13px] text-[var(--color-text-secondary)]'>No clients have been added yet.</p>}
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
                    <Button
                      variant='secondary'
                      className='w-full gap-2 text-[13px]'
                      onClick={() => { setSelectedPlanId(plans[0]?.id || ""); setAssignError(null); setIsAssignOpen(true); }}
                    >
                      <Calendar className='h-4 w-4' />
                      <span>Assign Plan</span>
                    </Button>
                    <Link href='/plans/builder' className='block text-center text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'>Manage training plans</Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {isAssignOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#0e1113]/80 p-4 backdrop-blur-sm'>
          <form onSubmit={assignPlan} className='w-full max-w-[420px] space-y-4 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'><h2 className='font-display text-[20px] font-semibold'>Assign a plan</h2><button type='button' aria-label='Close plan assignment' onClick={() => setIsAssignOpen(false)} className='text-[var(--color-text-muted)] hover:text-white'>×</button></div>
            <p className='text-[13px] text-[var(--color-text-secondary)]'>Choose a training plan for {selectedClient?.name}.</p>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>Training plan<select required value={selectedPlanId} onChange={(event) => setSelectedPlanId(event.target.value)} className='w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5 font-body text-[14px] normal-case text-[var(--color-text-primary)]'>{plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label>
            {assignError && <p role='alert' className='text-[13px] text-[var(--color-error)]'>{assignError}</p>}
            <Button type='submit' disabled={plans.length === 0} className='w-full'>Assign plan</Button>
          </form>
        </div>
      )}
      {isInviteOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#0e1113]/80 p-4 backdrop-blur-sm'>
          <form onSubmit={inviteClient} className='w-full max-w-[420px] space-y-4 rounded-md border border-[var(--color-border-default)] bg-[var(--color-surface-elevated)] p-5'>
            <div className='flex items-center justify-between border-b border-[var(--color-border-default)] pb-3'><h2 className='font-display text-[20px] font-semibold'>Invite a client</h2><button type='button' aria-label='Close invitation form' onClick={() => setIsInviteOpen(false)} className='text-[var(--color-text-muted)] hover:text-white'>×</button></div>
            <p className='text-[13px] text-[var(--color-text-secondary)]'>The client needs an Aperture account. Their access starts only after they accept.</p>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>Client account email<input required type='email' value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className='w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5 font-body text-[14px] normal-case text-[var(--color-text-primary)]' /></label>
            {inviteError && <p role='alert' className='text-[13px] text-[var(--color-error)]'>{inviteError}</p>}
            {inviteSent && <p role='status' className='text-[13px] text-[var(--color-accent-primary)]'>Invitation sent. The client will appear after accepting it.</p>}
            <Button type='submit' disabled={isInviting} className='w-full'>{isInviting ? "Sending invitation…" : "Send invitation"}</Button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
