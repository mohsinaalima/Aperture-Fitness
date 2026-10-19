"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

type Draft = { context: string | null; trainer_bio: string | null; trainer_business_name: string | null };

export default function TrainerOnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [bio, setBio] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { if (!isLoading && !user) router.replace("/login"); }, [isLoading, router, user]);
  useEffect(() => {
    if (!user) return;
    fetchApi<Draft>("/api/onboarding/status").then((data) => {
      if (data.context !== "trainer") { router.replace("/onboarding"); return; }
      setBio(data.trainer_bio || ""); setBusinessName(data.trainer_business_name || ""); setLoaded(true);
    }).catch(() => { setError("Could not load your saved trainer setup."); setLoaded(true); });
  }, [router, user]);

  const saveDraft = async () => {
    try { await fetchApi("/api/onboarding/trainer/draft", { method: "PUT", body: JSON.stringify({ bio, business_name: businessName }) }); }
    catch { setError("Your details could not be saved. Check your connection and try again."); }
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(null);
    try {
      await fetchApi("/api/onboarding/trainer", { method: "PUT", body: JSON.stringify({ bio, business_name: businessName }) });
      router.push("/trainer");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not complete trainer setup."); }
    finally { setSaving(false); }
  };

  if (isLoading || !user || !loaded) return <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-text-secondary)]">Loading your setup…</div>;
  return <AppShell><Card className="mx-auto max-w-xl"><CardHeader><p className="font-mono text-xs uppercase text-[var(--color-accent-primary)]">Trainer setup</p><CardTitle className="text-2xl">Create your trainer profile</CardTitle></CardHeader><CardContent><form onSubmit={submit} className="space-y-5"><label className="block space-y-2 text-sm">Bio <span className="text-[var(--color-text-muted)]">(optional)</span><textarea maxLength={2000} rows={5} value={bio} onChange={(event) => setBio(event.target.value)} onBlur={() => void saveDraft()} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" /></label><label className="block space-y-2 text-sm">Business name <span className="text-[var(--color-text-muted)]">(optional)</span><input maxLength={150} value={businessName} onChange={(event) => setBusinessName(event.target.value)} onBlur={() => void saveDraft()} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" /></label><p className="text-sm text-[var(--color-text-secondary)]">You can invite an existing Aperture member after setup. They will need to accept before a trainer-client relationship becomes active.</p>{error && <p role="alert" className="text-sm text-[var(--color-error)]">{error}</p>}<Button type="submit" disabled={saving} className="w-full">{saving ? "Saving…" : "Create trainer profile"}</Button></form></CardContent></Card></AppShell>;
}
