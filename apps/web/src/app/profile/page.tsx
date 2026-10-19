"use client";

import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { fetchApi } from "@/lib/api";

type ProfileData = { initials: string; membershipTier: string; preferences: { unitSystem: string; unitDescription: string; restIntervalSeconds: number }; billing: { planName: string; renewalDateFormatted: string; monthlyPriceFormatted: string } };

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  useEffect(() => {
    let active = true;
    fetchApi<ProfileData>("/api/profile")
      .then((data) => { if (active) setProfile(data); })
      .catch((error: unknown) => console.error("Could not load profile preferences:", error));
    return () => { active = false; };
  }, []);
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AF";

  return (
    <AppShell>
      <div className='max-w-[640px] mx-auto space-y-6'>
        {/* Header */}
        <div className='border-b border-[var(--color-border-default)] pb-4'>
          <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
            Account Preferences
          </span>
          <h1 className='font-display text-[32px] font-semibold text-[var(--color-text-primary)]'>
            User Profile
          </h1>
        </div>

        {/* User Identity Banner */}
        <Card className='flex items-center gap-4 p-4'>
          <div className='h-12 w-12 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-primary)] flex items-center justify-center text-[var(--color-accent-primary)] font-bold text-[18px]'>
            {profile?.initials || initials}
          </div>
          <div className='flex-1'>
            <h2 className='text-[16px] font-semibold text-[var(--color-text-primary)]'>
              {user?.name || "Aperture member"}
            </h2>
            <p className='text-[13px] text-[var(--color-text-secondary)] font-mono'>
              {user?.email || ""}
            </p>
          </div>
          <span className='px-2.5 py-1 rounded-sm bg-[var(--color-surface-elevated-2)] border border-[var(--color-border-default)] text-[12px] font-mono text-[var(--color-accent-primary)] font-semibold'>
            {profile?.membershipTier || (user?.role || "member").toUpperCase()}
          </span>
        </Card>

        {/* Sectioned Settings List */}
        <div className='space-y-4'>
          {/* Section 1: Preferences */}
          <Card className='p-0 overflow-hidden'>
            <div className='p-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]'>
              <h3 className='text-[14px] font-semibold text-[var(--color-text-primary)] uppercase tracking-wider font-mono'>
                System Preferences
              </h3>
            </div>
            <div className='divide-y divide-[var(--color-border-default)]'>
              <div className='flex items-center justify-between p-4 hover:bg-[var(--color-surface-elevated-2)] transition-colors'>
                <div>
                  <h4 className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                    Default Unit System
                  </h4>
                  <p className='text-[12px] text-[var(--color-text-muted)]'>
                    {profile?.preferences.unitDescription || "Kilograms (kg) with 2.5kg steppers"}
                  </p>
                </div>
                <span className='text-[13px] font-mono text-[var(--color-accent-primary)] font-semibold'>
                  {profile?.preferences.unitSystem || "Metric (KG)"}
                </span>
              </div>

              <div className='flex items-center justify-between p-4 hover:bg-[var(--color-surface-elevated-2)] transition-colors'>
                <div>
                  <h4 className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                    Default Rest Interval
                  </h4>
                  <p className='text-[12px] text-[var(--color-text-muted)]'>
                    Uses the rest interval configured for each set
                  </p>
                </div>
                <span className='text-[13px] font-mono text-[var(--color-text-primary)]'>
                  {profile ? `${profile.preferences.restIntervalSeconds} seconds` : "Plan based"}
                </span>
              </div>
            </div>
          </Card>

          {/* Account information */}
          <Card className='p-0 overflow-hidden'>
            <div className='p-4 border-b border-[var(--color-border-default)] bg-[var(--color-bg-secondary)]'>
              <h3 className='text-[14px] font-semibold text-[var(--color-text-primary)] uppercase tracking-wider font-mono'>
                Account
              </h3>
            </div>
            <div className='divide-y divide-[var(--color-border-default)]'>
              <div className='flex items-center justify-between p-4'>
                <div>
                  <h4 className='text-[14px] font-medium text-[var(--color-text-primary)]'>
                    Training facility
                  </h4>
                  <p className='text-[12px] text-[var(--color-text-muted)]'>
                    Your account workspace
                  </p>
                </div>
                <span className='tabular-nums text-[14px] font-mono text-[var(--color-text-primary)]'>
                  {user?.gymName || "Aperture Fitness"}
                </span>
              </div>
            </div>
          </Card>

          {/* Section 3: Logout Action */}
          <div className='pt-2'>
              <Button
                variant='secondary'
                className='w-full gap-2 text-[14px] text-[var(--color-error)] border-[var(--color-error)]/30 hover:bg-[var(--color-error)]/10'
                onClick={() => void logout()}
              >
                <LogOut className='h-4 w-4' />
                <span>Log Out of Account</span>
              </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
