"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

type Exercise = { id: string; name: string; category: string; primaryMuscle: string; equipment: string };

export default function ExerciseLibraryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const query = new URLSearchParams({ category: activeCategory, search });
    fetchApi<{ categories: string[]; exercises: Array<Exercise & { primary_muscle?: string }> }>(`/exercises?${query}`)
      .then((data) => {
        if (!active) return;
        setCategories(["All", ...data.categories.filter((category) => category !== "All")]);
        setExercises(data.exercises.map((exercise) => ({ ...exercise, primaryMuscle: exercise.primary_muscle ?? exercise.primaryMuscle })));
        setLoadError(null);
      })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : "Could not load exercises."); });
    return () => { active = false; };
  }, [activeCategory, search]);
  const filtered = exercises;

  return (
    <AppShell>
      <div className='space-y-6'>
        {/* Header */}
        <div className='border-b border-[var(--color-border-default)] pb-4'>
          <span className='text-[12px] font-semibold tracking-wider text-[var(--color-text-secondary)] uppercase'>
            Movement Database
          </span>
          <h1 className='font-display text-[32px] font-semibold text-[var(--color-text-primary)]'>
            Exercise Library
          </h1>
        </div>

        {/* Search & Category Chips Carousel (Section 18.11) */}
        <div className='space-y-3'>
          <div className='relative max-w-[480px]'>
            <Search className='h-4 w-4 absolute left-3 top-3 text-[var(--color-text-muted)]' />
            <input
              type='text'
              aria-label='Search exercises by name or muscle'
              placeholder='Search exercise or target muscle...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='w-full bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] rounded-sm pl-9 pr-3 py-2 text-[14px] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent-primary)]'
            />
          </div>

          <div className='flex items-center gap-2 overflow-x-auto pb-1'>
            {categories.map((cat) => (
              <button
                key={cat}
                aria-pressed={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-sm text-[13px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[var(--color-accent-subtle)] border border-[var(--color-accent-primary)] text-[var(--color-accent-primary)]"
                    : "bg-[var(--color-surface-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {filtered.map((ex) => (
            <Card key={ex.name} className='flex flex-col justify-between'>
              <CardHeader className='pb-2'>
                <span className='text-[11px] font-mono text-[var(--color-accent-primary)] uppercase'>
                  {ex.category} • {ex.equipment}
                </span>
                <CardTitle className='text-[18px]'>{ex.name}</CardTitle>
              </CardHeader>

              <CardContent className='space-y-3 pt-0'>
                <div className='p-2.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border-default)] text-[12px]'>
                  <span className='text-[var(--color-text-muted)] font-mono'>
                    PRIMARY:{" "}
                  </span>
                  <span className='text-[var(--color-text-primary)] font-medium'>
                    {ex.primaryMuscle}
                  </span>
                </div>

                <div className='flex items-center justify-between pt-1'>
                  <span className='text-[12px] text-[var(--color-text-muted)] font-mono'>
                    Training analytics
                  </span>
                  <Link href='/analytics'>
                    <Button variant='ghost' size='default' className='gap-1 text-[12px] px-2'>
                      <span>View analytics</span>
                      <ChevronRight className='h-3.5 w-3.5' />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {loadError && <p role="status" className="text-sm text-[var(--color-warning)]">{loadError}</p>}
        {filtered.length === 0 && !loadError && (
          <Card className='p-8 text-center'>
            <h2 className='font-display text-[18px] font-semibold'>No exercises found</h2>
            <p className='mt-2 text-[13px] text-[var(--color-text-secondary)]'>Try another search or choose a different muscle group.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
