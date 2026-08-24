"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ApertureIrisProps extends React.SVGProps<SVGSVGElement> {
  value?: number; // 0 to 100
  size?: number;
  bladeCount?: number;
  showValue?: boolean;
}

export const ApertureIrisProgress: React.FC<ApertureIrisProps> = ({
  value = 0,
  size = 32,
  bladeCount = 6,
  showValue = false,
  className,
  ...props
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));
  // 0% value = open aperture ring, 100% = fully closed iris mechanism
  const rotationOffset = (normalizedValue / 100) * 45;
  const innerRadius = 28 - (normalizedValue / 100) * 18;

  return (
    <div
      className='relative inline-flex items-center justify-center flex-shrink-0'
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 100 100'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        className={cn(
          "transition-transform duration-320 ease-mechanical",
          className,
        )}
        {...props}
      >
        {/* Outer Housing Ring */}
        <circle
          cx='50'
          cy='50'
          r='46'
          stroke='var(--color-border-default)'
          strokeWidth='2'
        />

        {/* Mechanical Iris Blades */}
        {Array.from({ length: bladeCount }).map((_, index) => {
          const baseAngle = (360 / bladeCount) * index;
          const currentAngle = baseAngle + rotationOffset;

          return (
            <g key={index} transform={`rotate(${currentAngle} 50 50)`}>
              <path
                d={`M 50 ${50 - innerRadius} 
                   C 68 ${50 - innerRadius}, 82 34, 88 50 
                   C 82 66, 68 ${50 + innerRadius}, 50 ${50 + innerRadius} 
                   Z`}
                fill={
                  normalizedValue > 0
                    ? "var(--color-accent-primary)"
                    : "transparent"
                }
                fillOpacity={0.15 + (normalizedValue / 100) * 0.85}
                stroke='var(--color-accent-primary)'
                strokeWidth='1.5'
                strokeLinejoin='round'
                className='transition-all duration-320 ease-mechanical'
              />
            </g>
          );
        })}

        {/* Center Readout Notch */}
        <circle
          cx='50'
          cy='50'
          r={innerRadius}
          stroke='var(--color-border-strong)'
          strokeWidth='1'
          strokeDasharray='2 2'
          fill='none'
        />
      </svg>

      {/* Optional center readout text - renders only if explicitly requested */}
      {showValue && (
        <span className='absolute inset-0 flex items-center justify-center text-[10px] font-mono font-medium text-[var(--color-text-primary)]'>
          {Math.round(normalizedValue)}%
        </span>
      )}
    </div>
  );
};
