"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { useAuth } from "@/context/auth-context";
import { API_BASE_URL } from "@/lib/api";

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (new TextEncoder().encode(password).length > 72) {
      setError("Password must be no more than 72 bytes when encoded.");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } catch (registrationError) {
      setError(registrationError instanceof Error ? registrationError.message : "Could not create your account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4'>
      <Link href='/' className='flex items-center gap-2.5 mb-8'>
        <ApertureIrisProgress value={65} size={36} />
        <span className='font-display text-[22px] font-semibold tracking-tight text-[var(--color-text-primary)]'>APERTURE</span>
      </Link>

      <Card className='w-full max-w-[460px] border-[var(--color-border-default)]'>
        <CardHeader className='text-center pb-2'>
          <CardTitle className='text-[22px]'>Create your account</CardTitle>
          <p className='text-[13px] text-[var(--color-text-secondary)] mt-1'>Create one account, then choose how you train.</p>
        </CardHeader>
        <CardContent className='pt-4'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
              Name
              <span className='relative block'><User className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' /><input required minLength={1} maxLength={100} autoComplete='name' value={name} onChange={(event) => setName(event.target.value)} className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]' /></span>
            </label>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
              Username
              <input required minLength={3} maxLength={50} autoComplete='username' value={username} onChange={(event) => setUsername(event.target.value)} className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm px-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]' />
            </label>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
              Email address
              <span className='relative block'><Mail className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' /><input required type='email' autoComplete='email' value={email} onChange={(event) => setEmail(event.target.value)} className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]' /></span>
            </label>
            <label className='block space-y-1.5 text-[12px] font-mono uppercase text-[var(--color-text-secondary)]'>
              Password
              <span className='relative block'><Lock className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' /><input required type='password' minLength={8} maxLength={72} autoComplete='new-password' value={password} onChange={(event) => setPassword(event.target.value)} className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2.5 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]' /></span>
              <span className='block normal-case text-[11px] text-[var(--color-text-muted)]'>Use at least 8 characters with an uppercase letter, lowercase letter, and number.</span>
            </label>
            {error && <p role='alert' className='rounded-sm border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-3 py-2 text-[13px] text-[var(--color-error)]'>{error}</p>}
            <Button type='submit' size='logger' disabled={isSubmitting || isLoading} className='w-full mt-2 text-[15px]'>
              {isSubmitting || isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>
          <a href={`${API_BASE_URL}/api/auth/google`} className='mt-3 flex w-full items-center justify-center rounded-sm border border-[var(--color-border-default)] px-4 py-2.5 text-[13px] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-bg-secondary)]'>Continue with Google</a>
          <p className='mt-4 text-center text-[13px] text-[var(--color-text-secondary)]'>
            Already registered? <Link className='text-[var(--color-accent-primary)] hover:underline' href='/login'>Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
