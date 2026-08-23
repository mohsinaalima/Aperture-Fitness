"use client";

interface ApertureIrisProgressProps {
  value: number;
  max?: number;
  size?: number;
}

export function ApertureIrisProgress({
  value,
  max = 100,
  size = 180,
}: ApertureIrisProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className='relative flex items-center justify-center rounded-full border-8 border-muted'
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className='absolute inset-2 rounded-full border-8 border-primary'
        style={{
          clipPath: `inset(${100 - percentage}% 0 0 0)`,
        }}
      />

      <div className='text-center'>
        <div className='text-3xl font-bold'>{Math.round(percentage)}%</div>
        <div className='text-xs text-muted-foreground'>Progress</div>
      </div>
    </div>
  );
}
