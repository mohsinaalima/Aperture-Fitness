"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

type Draft = { context: string | null; gym_name: string | null; gym_address: string | null };

export default function GymOnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!isLoading && !user) router.replace("/login"); }, [isLoading, router, user]);
  useEffect(() => {
    if (!user) return;
    fetchApi<Draft>("/api/onboarding/status").then((data) => {
      if (data.context !== "gym_owner") { router.replace("/onboarding"); return; }
      setName(data.gym_name || ""); setAddress(data.gym_address || ""); setLoaded(true);
    }).catch(() => { setError("Could not load your saved gym setup."); setLoaded(true); });
  }, [router, user]);

  const saveDraft = async () => {
    try { await fetchApi("/api/onboarding/gym/draft", { method: "PUT", body: JSON.stringify({ name, address }) }); }
    catch { setError("Your details could not be saved. Check your connection and try again."); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(null);
    try {
      await fetchApi("/api/onboarding/gym", { method: "POST", body: JSON.stringify({ name, address }) });
      router.push("/owner");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not complete gym setup."); }
    finally { setSaving(false); }
  };

  if (isLoading || !user || !loaded) return <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-text-secondary)]">Loading your setup…</div>;
  return <AppShell><Card className="mx-auto max-w-xl"><CardHeader><p className="font-mono text-xs uppercase text-[var(--color-accent-primary)]">Gym owner setup</p><CardTitle className="text-2xl">Set up your gym</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><label className="block space-y-2 text-sm">Gym name<input required minLength={2} maxLength={150} value={name} onChange={(event) => setName(event.target.value)} onBlur={() => void saveDraft()} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" /></label><label className="block space-y-2 text-sm">Address<input required minLength={3} maxLength={300} value={address} onChange={(event) => setAddress(event.target.value)} onBlur={() => void saveDraft()} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" /></label><p className="text-sm text-[var(--color-text-secondary)]">Your account will own this gym. You can invite a trainer or staff member from the owner workspace.</p>{error && <p role="alert" className="text-sm text-[var(--color-error)]">{error}</p>}<Button type="submit" disabled={saving} className="w-full">{saving ? "Saving…" : "Create gym"}</Button></form></CardContent></Card></AppShell>;
}
