"use client";

import React, { useState, useEffect } from "react";
import { SkipForward } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";

export const FloatingRestTimer: React.FC = () => {
  const activeWorkout = useAppStore((s) => s.activeWorkout);
  const cancelRestTimer = useAppStore((s) => s.cancelRestTimer);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const timerInfo = activeWorkout?.activeRestTimer;

  // Synthesize Web Audio Beep & Haptic Vibration on completion
  const triggerCompletionAlert = () => {
    // 1. Mobile Vibration API
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // 2. Web Audio Synthesizer Beep
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio context fallback ignored
    }
  };

  useEffect(() => {
    if (!timerInfo) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const diff = Math.max(
        0,
        Math.ceil((timerInfo.endTime - Date.now()) / 1000),
      );
      setRemainingSeconds(diff);
      if (diff === 0) {
        triggerCompletionAlert();
        cancelRestTimer();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [timerInfo, cancelRestTimer]);

  if (!timerInfo || remainingSeconds <= 0) return null;

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      ((timerInfo.duration - remainingSeconds) / timerInfo.duration) * 100,
    ),
  );

  return (
    <div className='fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 bg-[var(--color-surface-elevated)] border border-[var(--color-accent-primary)] p-3 rounded-md shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200'>
      <ApertureIrisProgress value={progressPercent} size={40} />
      <div>
        <span className='text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] block'>
          Rest Interval
        </span>
        <div className='tabular-nums font-mono text-[22px] font-semibold leading-none text-[var(--color-text-primary)]'>
          {Math.floor(remainingSeconds / 60)}:
          {String(remainingSeconds % 60).padStart(2, "0")}
        </div>
      </div>

      <div className='flex items-center gap-1 border-l border-[var(--color-border-default)] pl-3'>
        <button
          onClick={() => cancelRestTimer()}
          title='Skip Rest'
          className='p-2 rounded-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer'
        >
          <SkipForward className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
};
