"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

type Draft = { context: string | null; experience_level: string | null; primary_goal: string | null; preferred_split: string | null };

export default function MemberOnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [draft, setDraft] = useState({ experience_level: "", primary_goal: "", preferred_split: "" });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    fetchApi<Draft>("/api/onboarding/status").then((data) => {
      if (data.context !== "member" && data.context !== "member_with_trainer") { router.replace("/onboarding"); return; }
      setDraft({ experience_level: data.experience_level || "", primary_goal: data.primary_goal || "", preferred_split: data.preferred_split || "" });
      setLoaded(true);
    }).catch(() => { setError("Could not load your saved answers."); setLoaded(true); });
  }, [router, user]);

  useEffect(() => {
    if (!loaded || !Object.values(draft).some((value) => value.trim())) return;
    const timer = window.setTimeout(() => {
      void fetchApi("/api/onboarding/member", { method: "PUT", body: JSON.stringify({
        experience_level: draft.experience_level.trim() || undefined,
        primary_goal: draft.primary_goal.trim() || undefined,
        preferred_split: draft.preferred_split.trim() || undefined,
        complete: false,
      }) })
        .catch(() => setError("Your latest answers could not be saved. Check your connection and try again."));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [draft, loaded]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true); setError(null);
    try {
      await fetchApi("/api/onboarding/member", { method: "PUT", body: JSON.stringify({ ...draft, complete: true }) });
      router.push("/onboarding/handoff");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your setup. Please try again.");
    } finally { setSaving(false); }
  };

  if (isLoading || !user || !loaded) return <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-text-secondary)]">Loading your setup…</div>;
  const update = (key: keyof typeof draft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <AppShell>
      <Card className="mx-auto max-w-xl">
        <CardHeader><p className="font-mono text-xs uppercase text-[var(--color-accent-primary)]">Member setup · 3 questions</p><CardTitle className="text-2xl">Set your training starting point</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-5">
            <label className="block space-y-2 text-sm">Experience level<input required minLength={2} maxLength={40} value={draft.experience_level} onChange={(e) => update("experience_level", e.target.value)} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" placeholder="For example, new to strength training" /></label>
            <label className="block space-y-2 text-sm">Primary goal<input required minLength={2} maxLength={100} value={draft.primary_goal} onChange={(e) => update("primary_goal", e.target.value)} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" placeholder="For example, build strength" /></label>
            <label className="block space-y-2 text-sm">Preferred workout split<input required minLength={2} maxLength={100} value={draft.preferred_split} onChange={(e) => update("preferred_split", e.target.value)} className="w-full rounded-sm border border-[var(--color-border-default)] bg-[var(--color-bg-secondary)] px-3 py-2.5" placeholder="For example, three full-body days" /></label>
            {error && <p role="alert" className="text-sm text-[var(--color-error)]">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">{saving ? "Saving…" : "Continue"}</Button>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  );
}
