"use client";

import React, { useEffect, useState } from "react";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAuth } from "@/context/auth-context";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const { loginAs, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reason = new URLSearchParams(window.location.search).get("error");
    if (reason === "account_exists") {
      setError("An account already uses this email. Sign in with that account; Google accounts are not linked automatically.");
    } else if (reason === "google_not_configured") {
      setError("Google sign-in is not configured yet. Use your email and password.");
    } else if (reason === "google_signin_failed") {
      setError("Google sign-in could not be completed. Please try again.");
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    void loginAs(email.trim(), password).catch((loginError: unknown) => {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in. Please try again.");
    });
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
            Sign in with your account details
          </p>
        </CardHeader>

        <CardContent className='pt-4 space-y-4'>
          <form onSubmit={handleSubmit} className='space-y-4 pt-1'>
            {/* Email Field */}
            <div className='space-y-1.5'>
              <label className='text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
                Email address
              </label>
              <div className='relative'>
                <Mail className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
                <input
                  type='email'
                  autoComplete='username'
                  required
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
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
                />
              </div>
            </div>

            {error && <p role='alert' className='rounded-sm border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-3 py-2 text-[13px] text-[var(--color-error)]'>{error}</p>}

            <Button
              type='submit'
              size='logger'
              disabled={isLoading}
              className='w-full mt-2 text-[15px]'
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <a
            href={`${API_BASE_URL}/api/auth/google`}
            className='flex w-full items-center justify-center rounded-sm border border-[var(--color-border-default)] px-4 py-2.5 text-[13px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]'
          >
            Continue with Google
          </a>
          <p className='text-center text-[13px] text-[var(--color-text-secondary)]'>
            Need an account? <Link className='text-[var(--color-accent-primary)] hover:underline' href='/register'>Create one</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
