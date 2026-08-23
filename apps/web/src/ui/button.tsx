import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "logger";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base: radius-sm (6px), 1px border, mechanical easing, touch target compliance
          "inline-flex items-center justify-center font-body text-[14px] font-semibold rounded-sm border transition-colors duration-100 ease-mechanical focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.99]",
          
          // Heights: default 44px, logger 52px (Section 8)
          size === "default" && "h-[44px] px-4",
          size === "logger" && "h-[52px] px-6 text-[15px]",

          // Variants (Section 8)
          variant === "primary" &&
            "bg-[#5FA88C] text-[#0E1113] border-transparent hover:bg-[#74BFA2] active:bg-[#5FA88C]",
          variant === "secondary" &&
            "bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-elevated-2)]",
          variant === "ghost" &&
            "bg-transparent text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)] hover:underline underline-offset-4",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";