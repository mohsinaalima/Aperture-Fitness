"use client";

import React, { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { NumericStepper } from "@/components/ui/numeric-stepper";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

export default function Home() {
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(8);
  const [progress, setProgress] = useState(65);

  return (
    <AppShell>
      <div className='space-y-6'>
        <div>
          <h1 className='font-display text-[36px] font-semibold tracking-tight text-[var(--color-text-primary)]'>
            Instrument Graphite System
          </h1>

          <p className='text-[15px] text-[var(--color-text-secondary)] mt-1'>
            Component verification and brand token test harness.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Card>
            <CardHeader>
              <CardTitle>Aperture Iris Motif</CardTitle>

              <CardDescription>
                Mechanical progress indicator (currently at {progress}%)
              </CardDescription>
            </CardHeader>

            <CardContent className='flex flex-col items-center gap-4'>
              <ApertureIrisProgress value={progress} size={80} />

              <div className='flex gap-2'>
                <Button
                  variant='secondary'
                  onClick={() => setProgress(Math.max(0, progress - 15))}
                >
                  Open Iris
                </Button>

                <Button
                  variant='secondary'
                  onClick={() => setProgress(Math.min(100, progress + 15))}
                >
                  Close Iris
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Numeric Steppers</CardTitle>

              <CardDescription>
                56px touch targets with tabular mono readout
              </CardDescription>
            </CardHeader>

            <CardContent className='space-y-4'>
              <NumericStepper
                label='Weight'
                value={weight}
                onChange={setWeight}
                unit='kg'
                step={2.5}
              />

              <NumericStepper
                label='Target Reps'
                value={reps}
                onChange={setReps}
                unit='reps'
                step={1}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
