"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Dumbbell,
  Play,
  Timer,
  TrendingUp,
} from "lucide-react";
import { ApertureIrisProgress } from "@/components/ui/aperture-iris";
import { Button } from "@/components/ui/button";

const features = [
  {
    number: "01",
    icon: Dumbbell,
    title: "Log without losing your rhythm.",
    description:
      "Your next set, right where you need it. Quick controls keep the focus on lifting, not tapping around.",
    kind: "logger",
  },
  {
    number: "02",
    icon: Timer,
    title: "A plan for every session.",
    description:
      "Build a repeatable routine, keep your exercises in order, and arrive knowing what comes next.",
    kind: "plan",
  },
  {
    number: "03",
    icon: TrendingUp,
    title: "See the work add up.",
    description:
      "Review your training history and spot the steady progress that is easy to miss day to day.",
    kind: "progress",
  },
];

function FeaturePreview({ kind }: { kind: string }) {
  if (kind === "logger") {
    return (
      <div className="preview-window">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span className="text-[12px] font-medium text-white/85">Bench press</span>
          <span className="font-mono text-[10px] tracking-widest text-[var(--color-accent-primary)]">SET 03 / 04</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[{ label: "LOAD", value: "85.0", unit: "KG" }, { label: "REPS", value: "06", unit: "REPS" }].map((item) => (
            <div key={item.label} className="rounded border border-white/10 bg-black/20 p-3">
              <div className="font-mono text-[9px] tracking-widest text-white/40">{item.label}</div>
              <div className="mt-1 font-mono text-[22px] tabular-nums text-white">{item.value}<span className="ml-1 text-[9px] text-white/40">{item.unit}</span></div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-[var(--color-accent-primary)]"><span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" /> Ready for your next set</div>
      </div>
    );
  }

  if (kind === "plan") {
    return (
      <div className="preview-window space-y-2.5">
        <div className="mb-3 flex items-center justify-between"><span className="text-[12px] font-medium text-white/85">Upper body A</span><span className="font-mono text-[9px] text-white/40">TODAY</span></div>
        {[["01", "Bench press", "4 × 6"], ["02", "Bent-over row", "3 × 8"], ["03", "Overhead press", "3 × 8"]].map(([num, name, sets], i) => (
          <div key={num} className={`flex items-center gap-3 rounded border px-3 py-2.5 ${i === 0 ? "border-[var(--color-accent-primary)]/40 bg-[var(--color-accent-primary)]/10" : "border-white/5 bg-black/10"}`}>
            <span className="font-mono text-[9px] text-white/35">{num}</span><span className="flex-1 text-[11px] text-white/75">{name}</span><span className="font-mono text-[9px] text-white/45">{sets}</span>{i === 0 && <Check className="h-3 w-3 text-[var(--color-accent-primary)]" />}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="preview-window">
      <div className="flex items-start justify-between"><div><div className="font-mono text-[9px] tracking-widest text-white/40">BENCH PRESS · 6 WEEKS</div><div className="mt-1 font-mono text-[23px] tabular-nums text-white">85.0 <span className="text-[10px] text-white/40">KG</span></div></div><span className="flex items-center gap-1 rounded-full bg-[var(--color-accent-primary)]/10 px-2 py-1 font-mono text-[9px] text-[var(--color-accent-primary)]"><ArrowUpRight className="h-3 w-3" /> 7.5%</span></div>
      <div className="mt-5 flex h-[88px] items-end gap-2 border-b border-l border-white/10 px-2">
        {[26, 34, 30, 47, 43, 59, 55, 73, 68, 86].map((height, i) => <span key={i} className="chart-bar flex-1 rounded-t-[2px] bg-[var(--color-accent-primary)]/60" style={{ height: `${height}%`, animationDelay: `${i * 70}ms` }} />)}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[8px] text-white/30"><span>WEEK 01</span><span>WEEK 06</span></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page min-h-screen overflow-hidden bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#0e1113]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-5 md:px-8">
          <Link href="/" aria-label="Aperture home" className="group flex items-center gap-2.5">
            <ApertureIrisProgress value={62} size={30} />
            <span className="font-display text-[17px] font-semibold tracking-[0.12em]">APERTURE</span>
          </Link>
          <nav className="hidden items-center gap-8 text-[13px] text-white/55 md:flex">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <Link href="/about" className="transition-colors hover:text-white">About</Link>
            <Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login" className="px-2 py-2 text-[12px] text-white/65 transition-colors hover:text-white sm:text-[13px]">Log in</Link>
            <Link href="/login"><Button className="h-10 gap-2 px-4 text-[12px] sm:text-[13px]">Start training <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
          </div>
        </div>
      </header>

      <section className="hero-grid relative mx-auto grid min-h-[680px] max-w-[1200px] items-center gap-8 px-5 pb-16 pt-14 md:px-8 lg:min-h-[730px] lg:grid-cols-[0.94fr_1.06fr] lg:gap-2 lg:py-20">
        <div className="relative z-10 max-w-[590px]">
          <div className="rise-in mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-primary)]/25 bg-[var(--color-accent-primary)]/[0.07] px-3.5 py-2 font-mono text-[10px] tracking-[0.14em] text-[var(--color-accent-primary)] sm:text-[11px]">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-accent-primary)] opacity-50" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-accent-primary)]" /></span>
            TRAIN WITH INTENT · TRACK EVERY REP
          </div>
          <h1 className="rise-in max-w-[640px] font-display text-[clamp(3.4rem,8vw,6.35rem)] font-semibold leading-[0.94] tracking-[-0.065em]" style={{ animationDelay: "80ms" }}>
            Make every<br />rep <span className="text-[var(--color-accent-primary)]">count.</span>
          </h1>
          <p className="rise-in mt-7 max-w-[445px] text-[16px] leading-[1.8] text-white/55 sm:text-[18px]" style={{ animationDelay: "160ms" }}>
            A clearer way to train. Plan your session, log each set, and watch the small wins turn into real strength.
          </p>
          <div className="rise-in mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "240ms" }}>
            <Link href="/login"><Button size="logger" className="group w-full gap-2.5 px-6 text-[14px] sm:w-auto">Build your momentum <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></Link>
            <a href="#features" className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-white/10 px-5 text-[13px] text-white/65 transition-colors hover:border-white/20 hover:text-white"><Play className="h-3.5 w-3.5 fill-current" /> Explore the features</a>
          </div>
          <div className="rise-in mt-10 flex items-center gap-4 text-[11px] text-white/40" style={{ animationDelay: "320ms" }}>
            <div className="flex -space-x-2" aria-hidden="true"><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0e1113] bg-[#35443d] text-[9px] text-white/80">A</span><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0e1113] bg-[#545044] text-[9px] text-white/80">M</span><span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0e1113] bg-[#46515a] text-[9px] text-white/80">J</span></div>
            <span>Made for the days you show up.</span><span className="h-1 w-1 rounded-full bg-white/25" /><span>Built around your training.</span>
          </div>
        </div>

        <div className="hero-visual relative mx-auto flex h-[420px] w-full max-w-[600px] items-center justify-center sm:h-[520px] lg:h-[600px]">
          <div className="hero-halo absolute h-[300px] w-[300px] rounded-full sm:h-[410px] sm:w-[410px]" />
          <div className="orbit orbit-one absolute h-[330px] w-[330px] rounded-full border border-white/[0.07] sm:h-[470px] sm:w-[470px]" />
          <div className="orbit orbit-two absolute h-[390px] w-[390px] rounded-full border border-dashed border-[var(--color-accent-primary)]/15 sm:h-[550px] sm:w-[550px]" />
          <div className="absolute h-[260px] w-[260px] rounded-full border border-white/[0.05] sm:h-[360px] sm:w-[360px]" />
          <div className="absolute h-[220px] w-[220px] rounded-full bg-[var(--color-accent-primary)]/[0.05] blur-3xl sm:h-[320px] sm:w-[320px]" />
          <ApertureIrisProgress value={68} size={244} className="iris-float relative z-[1] drop-shadow-[0_0_65px_rgba(95,168,140,0.19)] sm:scale-[1.3]" />

          <div className="float-card float-session absolute left-0 top-[13%] z-10 w-[178px] rounded-lg border border-white/10 bg-[#191e20]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:left-2 sm:w-[198px]">
            <div className="flex items-center justify-between"><span className="font-mono text-[9px] tracking-widest text-white/40">SESSION ACTIVE</span><span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)] shadow-[0_0_10px_var(--color-accent-primary)]" /></div>
            <div className="mt-3 text-[12px] font-medium">Upper body A</div><div className="mt-1 font-mono text-[10px] text-white/40">03 EXERCISES · 42 MIN</div>
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="progress-fill h-full w-[68%] rounded-full bg-[var(--color-accent-primary)]" /></div>
          </div>

          <div className="float-card float-pr absolute right-0 top-[22%] z-10 flex items-center gap-3 rounded-lg border border-white/10 bg-[#191e20]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:right-[-2%]">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"><ArrowUpRight className="h-4 w-4" /></div>
            <div><div className="font-mono text-[9px] tracking-widest text-white/40">NEW PERSONAL BEST</div><div className="mt-1 text-[12px] font-medium">Bench press <span className="font-mono text-[var(--color-accent-primary)]">+2.5 kg</span></div></div>
          </div>

          <div className="float-card float-timer absolute bottom-[13%] left-[4%] z-10 flex items-center gap-3 rounded-lg border border-white/10 bg-[#191e20]/90 px-4 py-3 shadow-2xl backdrop-blur-xl sm:left-[8%]">
            <div className="timer-ring flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-accent-primary)]/50 font-mono text-[9px] text-[var(--color-accent-primary)]">0:42</div><div><div className="font-mono text-[9px] tracking-widest text-white/40">REST TIMER</div><div className="mt-1 text-[11px] text-white/80">Breathe. Reset. Go.</div></div>
          </div>

          <div className="absolute bottom-[14%] right-[2%] z-10 rounded-lg border border-white/10 bg-[#191e20]/90 p-3 shadow-2xl backdrop-blur-xl sm:right-[3%]">
            <div className="mb-2 flex items-center justify-between gap-7"><span className="font-mono text-[9px] tracking-widest text-white/40">WEEKLY VOLUME</span><ArrowUpRight className="h-3 w-3 text-[var(--color-accent-primary)]" /></div>
            <div className="flex h-10 items-end gap-1.5">{[35, 49, 38, 70, 54, 82, 66].map((height, i) => <span key={i} className="chart-bar w-2 rounded-t-[2px] bg-[var(--color-accent-primary)]/70" style={{ height: `${height}%`, animationDelay: `${i * 90}ms` }} />)}</div>
          </div>
          <span className="absolute right-[17%] top-[10%] h-1.5 w-1.5 rounded-full bg-[var(--color-accent-primary)]/70 animate-pulse" /><span className="absolute bottom-[29%] right-[5%] h-1 w-1 rounded-full bg-white/50 animate-ping" />
        </div>
      </section>

      <section className="ticker-wrap border-y border-white/[0.07] bg-[#121618] py-4" aria-label="Aperture training tools">
        <div className="ticker-track flex w-max items-center gap-10 whitespace-nowrap font-mono text-[10px] tracking-[0.16em] text-white/40 sm:gap-14 sm:text-[11px]">
          {[0, 1].map((copy) => <div key={copy} className="flex items-center gap-10 sm:gap-14" aria-hidden={copy === 1}><span>SESSION PLANS</span><span className="text-[var(--color-accent-primary)]">✳</span><span>SET-BY-SET LOGGING</span><span className="text-[var(--color-accent-primary)]">✳</span><span>PROGRESS TRACKING</span><span className="text-[var(--color-accent-primary)]">✳</span><span>BUILT FOR CONSISTENCY</span><span className="text-[var(--color-accent-primary)]">✳</span></div>)}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 py-24 md:px-8 md:py-32">
        <div className="mb-12 flex flex-col justify-between gap-5 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-[650px]"><div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[var(--color-accent-primary)]">YOUR TRAINING, IN FOCUS</div><h2 className="font-display text-[38px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-[52px]">Less app. More <span className="text-white/40">intent.</span></h2></div>
          <p className="max-w-[360px] text-[14px] leading-7 text-white/45">Aperture brings the useful parts of strength training into one calm, considered space.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ number, icon: Icon, title, description, kind }) => (
            <article key={number} className="feature-card group overflow-hidden rounded-xl border border-white/[0.08] bg-[#14191b] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent-primary)]/35 sm:p-6">
              <FeaturePreview kind={kind} />
              <div className="mt-7 flex items-center justify-between"><div className="flex items-center gap-2.5"><Icon className="h-4 w-4 text-[var(--color-accent-primary)]" /><span className="font-mono text-[9px] tracking-widest text-white/35">FEATURE {number}</span></div><ChevronRight className="h-4 w-4 text-white/25 transition-all group-hover:translate-x-1 group-hover:text-[var(--color-accent-primary)]" /></div>
              <h3 className="mt-4 max-w-[270px] font-display text-[21px] font-semibold leading-tight tracking-[-0.025em]">{title}</h3>
              <p className="mt-3 text-[13px] leading-6 text-white/45">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-white/[0.07] bg-[#121618]">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 md:grid-cols-[0.8fr_1.2fr] md:items-center md:px-8 md:py-24">
          <div><div className="mb-4 font-mono text-[10px] tracking-[0.18em] text-[var(--color-accent-primary)]">A SIMPLE TRAINING LOOP</div><h2 className="font-display text-[36px] font-semibold leading-[1.05] tracking-[-0.045em] sm:text-[46px]">Show up.<br />Put in the work.<br /><span className="text-white/40">Come back stronger.</span></h2><p className="mt-5 max-w-[370px] text-[14px] leading-7 text-white/45">Keep your plan close and your progress visible. Build the kind of consistency that lasts.</p><Link href="/login" className="mt-7 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--color-accent-primary)] transition-colors hover:text-[#8ac7ad]">Get started <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="relative grid gap-3 sm:grid-cols-3">
            {[{ n: "01", title: "Prepare", text: "Know what you’re training today.", icon: ArrowDownRight }, { n: "02", title: "Perform", text: "Log sets as you go, without breaking focus.", icon: Dumbbell }, { n: "03", title: "Progress", text: "See your effort carry into the next session.", icon: TrendingUp }].map(({ n, title, text, icon: Icon }, i) => <div key={n} className="loop-card relative rounded-lg border border-white/[0.08] bg-[#171c1e] p-5" style={{ animationDelay: `${i * 180}ms` }}><div className="mb-9 flex items-center justify-between"><span className="font-mono text-[10px] text-[var(--color-accent-primary)]">{n} / 03</span><Icon className="h-4 w-4 text-white/35" /></div><h3 className="font-display text-[18px] font-semibold">{title}</h3><p className="mt-2 text-[12px] leading-5 text-white/45">{text}</p><span className="absolute bottom-0 left-5 right-5 h-px origin-left scale-x-0 bg-[var(--color-accent-primary)]/70 transition-transform duration-500 group-hover:scale-x-100" /></div>)}
            <div className="pointer-events-none absolute -right-3 -top-5 hidden h-14 w-14 rounded-full border border-[var(--color-accent-primary)]/15 sm:block" />
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1200px] px-5 py-24 md:px-8 md:py-32">
        <div className="cta-panel relative overflow-hidden rounded-2xl border border-[var(--color-accent-primary)]/20 bg-[#151c1b] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div className="cta-orbit absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-accent-primary)]/[0.08]" /><div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-accent-primary)]/[0.08]" />
          <div className="relative z-10 mx-auto max-w-[620px]"><div className="mb-5 flex justify-center"><ApertureIrisProgress value={72} size={54} /></div><div className="font-mono text-[10px] tracking-[0.18em] text-[var(--color-accent-primary)]">YOUR NEXT SESSION STARTS HERE</div><h2 className="mt-4 font-display text-[36px] font-semibold leading-tight tracking-[-0.045em] sm:text-[50px]">Ready when you are.</h2><p className="mx-auto mt-4 max-w-[430px] text-[14px] leading-7 text-white/50">Open your training workspace and make your next workout count.</p><Link href="/login" className="mt-7 inline-block"><Button size="logger" className="group gap-2.5 px-6">Start training <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Button></Link><div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-white/35"><Check className="h-3 w-3 text-[var(--color-accent-primary)]" /> A focused space for your training</div></div>
        </div>
      </section>

      <footer className="border-t border-white/[0.07] bg-[#111517]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-5 py-7 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <Link href="/" className="flex items-center gap-2"><ApertureIrisProgress value={62} size={22} /><span className="font-display font-semibold tracking-[0.12em] text-white/65">APERTURE</span></Link>
          <span>© {new Date().getFullYear()} Aperture Fitness · Train with intent.</span>
          <div className="flex gap-5"><Link href="/about" className="transition-colors hover:text-white">About</Link><Link href="/pricing" className="transition-colors hover:text-white">Pricing</Link><Link href="/login" className="transition-colors hover:text-white">Log in</Link></div>
        </div>
      </footer>
    </main>
  );
}
