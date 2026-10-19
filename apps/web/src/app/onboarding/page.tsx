"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

type Context = "member" | "member_with_trainer" | "trainer" | "gym_owner";
type Status = { context: Context | null; completed: boolean };
type Invitation = { id: string; trainer_name?: string; gym_name?: string; role?: string };

const choices: { value: Context; title: string; description: string; path: string }[] = [
  { value: "member", title: "I train alone", description: "Set your personal training preferences and get started.", path: "/onboarding/member" },
  { value: "member_with_trainer", title: "I train with a trainer", description: "Set your preferences and accept a trainer invitation when you have one.", path: "/onboarding/member" },
  { value: "gym_owner", title: "I run a gym", description: "Set up your gym and invite a trainer or staff member.", path: "/onboarding/gym" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [savedContext, setSavedContext] = useState<Context | null>(null);
  const [saving, setSaving] = useState<Context | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trainerInvitations, setTrainerInvitations] = useState<Invitation[]>([]);
  const [gymInvitations, setGymInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    fetchApi<Status>("/api/onboarding/status")
      .then((status) => setSavedContext(status.context))
      .catch(() => setError("Could not load your saved setup. Please try again."));
    fetchApi<Invitation[]>("/api/onboarding/trainer/invitations").then(setTrainerInvitations).catch(() => undefined);
    fetchApi<Invitation[]>("/api/onboarding/gym/invitations").then(setGymInvitations).catch(() => undefined);
  }, [user]);

  const acceptInvitation = async (path: string) => {
    setError(null);
    try {
      await fetchApi(path, { method: "POST" });
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not accept this invitation.");
    }
  };

  const choose = async (context: Context, path: string) => {
    setSaving(context);
    setError(null);
    try {
      await fetchApi("/api/onboarding/context", { method: "PUT", body: JSON.stringify({ context }) });
      router.push(path);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your choice. Please try again.");
      setSaving(null);
    }
  };

  const startTrainerSetup = () => void choose("trainer", "/onboarding/trainer");

  if (isLoading || !user) return <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-text-secondary)]">Checking your session…</div>;
  return (
    <AppShell>
      <section className="mx-auto max-w-2xl space-y-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-accent-primary)]">Account setup</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">How do you train?</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Do you train alone, with a trainer, or run a gym? You can add another workspace later.</p>
        </div>
        {error && <p role="alert" className="rounded border border-[var(--color-error)]/30 p-3 text-sm text-[var(--color-error)]">{error}</p>}
        {(trainerInvitations.length > 0 || gymInvitations.length > 0) && <Card><CardHeader><CardTitle className="text-lg">Invitations</CardTitle></CardHeader><CardContent className="space-y-3">
          {trainerInvitations.map((invite) => <div key={invite.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] pb-3"><p className="text-sm">Trainer invitation from {invite.trainer_name}</p><Button onClick={() => void acceptInvitation(`/api/onboarding/trainer/invitations/${invite.id}/accept`)}>Accept</Button></div>)}
          {gymInvitations.map((invite) => <div key={invite.id} className="flex items-center justify-between gap-3 border-b border-[var(--color-border-default)] pb-3"><p className="text-sm">{invite.role} invitation to {invite.gym_name}</p><Button onClick={() => void acceptInvitation(`/api/onboarding/gym/invitations/${invite.id}/accept`)}>Accept</Button></div>)}
        </CardContent></Card>}
        <div className="space-y-3">
          {choices.map((choice) => (
            <Card key={choice.value} className={savedContext === choice.value ? "border-[var(--color-accent-primary)]" : ""}>
              <CardHeader className="pb-2"><CardTitle className="text-lg">{choice.title}</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--color-text-secondary)]">{choice.description}</p>
                <Button disabled={saving !== null} onClick={() => void choose(choice.value, choice.path)}>
                  {saving === choice.value ? "Saving…" : savedContext === choice.value ? "Continue" : "Choose"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="border-t border-[var(--color-border-default)] pt-4 text-sm">
          <span className="text-[var(--color-text-secondary)]">Do you train other people?</span>{" "}
          <Button variant="ghost" disabled={saving !== null} onClick={startTrainerSetup}>Set up a personal trainer profile</Button>
        </div>
      </section>
    </AppShell>
  );
}
