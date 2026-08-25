"use client";

import React, { useState } from "react";
import { Lock, Mail, Shield, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAuth, UserRole } from "@/context/auth-context";

export default function LoginPage() {
  const { loginAs } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("member");
  const [email, setEmail] = useState("athlete@aperture.fit");
  const [password, setPassword] = useState("••••••••••••");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "owner") setEmail("owner@aperture.fit");
    else if (role === "trainer") setEmail("trainer@aperture.fit");
    else setEmail("athlete@aperture.fit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs(selectedRole);
  };

  return (
    <div className='min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4'>
      {/* Brand Header */}
      <div className='flex items-center gap-2.5 mb-8'>
        <ApertureIrisProgress value={65} size={36} />
        <span className='font-display text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]'>
          APERTURE
        </span>
      </div>

      <Card className='w-full max-w-[420px] border-[var(--color-border-default)]'>
        <CardHeader className='text-center pb-2'>
          <CardTitle className='text-[22px]'>Sign in to Portal</CardTitle>
          <p className='text-[13px] text-[var(--color-text-secondary)] mt-1'>
            Select your account access role below
          </p>
        </CardHeader>

        <CardContent className='pt-4 space-y-4'>
          {/* Role Selector Segment Tabs */}
          <div className='grid grid-cols-3 gap-1.5 p-1 bg-[var(--color-bg-secondary)] rounded-sm border border-[var(--color-border-default)]'>
            <button
              type='button'
              onClick={() => handleRoleSelect("member")}
              className={`py-2 px-1 rounded-sm text-[12px] font-mono transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                selectedRole === "member"
                  ? "bg-[var(--color-surface-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <User className='h-3.5 w-3.5' />
              <span>Member</span>
            </button>

            <button
              type='button'
              onClick={() => handleRoleSelect("trainer")}
              className={`py-2 px-1 rounded-sm text-[12px] font-mono transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                selectedRole === "trainer"
                  ? "bg-[var(--color-surface-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Shield className='h-3.5 w-3.5' />
              <span>Trainer</span>
            </button>

            <button
              type='button'
              onClick={() => handleRoleSelect("owner")}
              className={`py-2 px-1 rounded-sm text-[12px] font-mono transition-colors flex flex-col items-center gap-1 cursor-pointer ${
                selectedRole === "owner"
                  ? "bg-[var(--color-surface-elevated)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)] font-semibold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <Building2 className='h-3.5 w-3.5' />
              <span>Owner</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className='space-y-4 pt-1'>
            {/* Email Field */}
            <div className='space-y-1.5'>
              <label className='text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
                {selectedRole.toUpperCase()} Portal ID
              </label>
              <div className='relative'>
                <Mail className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-1.5'>
              <label className='text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
                Password
              </label>
              <div className='relative'>
                <Lock className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
            </div>

            <Button
              type='submit'
              size='logger'
              className='w-full mt-2 text-[15px]'
            >
              Log In as {selectedRole.toUpperCase()}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
