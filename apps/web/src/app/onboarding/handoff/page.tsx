"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingHandoffPage() {
  return (
    <AppShell>
      <Card className="mx-auto max-w-xl">
        <CardHeader><p className="font-mono text-xs uppercase text-[var(--color-accent-primary)]">Setup complete</p><CardTitle className="text-2xl">Choose how you want to start</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Link href="/plans" className="flex-1"><Button className="w-full">Browse a template</Button></Link>
          <Link href="/plans/builder" className="flex-1"><Button variant="secondary" className="w-full">Build my own plan</Button></Link>
        </CardContent>
      </Card>
    </AppShell>
  );
}
