"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter a valid email and password.");
      return;
    }
    setError(null);
    window.location.href = "/dashboard";
  };

  return (
    <div className='min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4'>
      {/* Brand Header */}
      <div className='flex items-center gap-2.5 mb-8'>
        <ApertureIrisProgress value={60} size={36} />
        <span className='font-display text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]'>
          APERTURE
        </span>
      </div>

      {/* Centered Login Card (Max-width 400px per Section 18.2) */}
      <Card className='w-full max-w-[400px] border-[var(--color-border-default)]'>
        <CardHeader className='text-center pb-2'>
          <CardTitle className='text-[22px]'>Log in to Aperture</CardTitle>
          <p className='text-[13px] text-[var(--color-text-secondary)] mt-1'>
            Precision strength training readout
          </p>
        </CardHeader>

        <CardContent className='pt-4 space-y-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Email Field */}
            <div className='space-y-1.5'>
              <label className='text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
                Email Address
              </label>
              <div className='relative'>
                <Mail className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='athlete@aperture.fit'
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <label className='text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
                  Password
                </label>
                <a
                  href='#'
                  className='text-[11px] text-[var(--color-accent-primary)] hover:underline'
                >
                  Forgot?
                </a>
              </div>
              <div className='relative'>
                <Lock className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
                <input
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='••••••••••••'
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
            </div>

            {/* Inline Error State (Section 18.2) */}
            {error && (
              <div className='flex items-center gap-2 p-2.5 rounded-sm bg-[var(--color-bg-secondary)] border-l-2 border-[var(--color-error)] text-[12px] text-[var(--color-text-primary)]'>
                <AlertCircle className='h-4 w-4 text-[var(--color-error)] flex-shrink-0' />
                <span>{error}</span>
              </div>
            )}

            <Button type='submit' size='logger' className='w-full mt-2'>
              Log in
            </Button>
          </form>

          {/* Divider */}
          <div className='relative flex items-center justify-center my-4'>
            <div className='border-t border-[var(--color-border-default)] w-full' />
            <span className='bg-[var(--color-surface-elevated)] px-2 text-[11px] font-mono text-[var(--color-text-muted)] uppercase absolute'>
              OR SSO
            </span>
          </div>

          {/* Stacked SSO Options */}
          <div className='space-y-2'>
            <Button variant='secondary' className='w-full text-[13px]'>
              Continue with Google
            </Button>
            <Button variant='secondary' className='w-full text-[13px]'>
              Continue with Apple
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
