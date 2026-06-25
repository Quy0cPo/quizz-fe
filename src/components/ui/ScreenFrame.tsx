import { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type ScreenVariant = "centered" | "form" | "game" | "split" | "results";

interface ScreenFrameProps {
  children: ReactNode;
  variant: ScreenVariant;
  className?: string;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
}

export function ScreenFrame({ children, variant, className, maxWidth = "2xl" }: ScreenFrameProps) {
  const baseClasses = "w-full h-full";
  
  // Optimized padding: mobile-first, no excessive jumps
  const variantClasses = {
    centered: "flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 mx-auto",
    form: "flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar mx-auto pb-safe",
    game: "flex flex-col overflow-hidden w-full",
    split: "flex flex-col lg:flex-row p-3 sm:p-4 md:p-6 gap-4 lg:gap-8 overflow-y-auto lg:overflow-hidden custom-scrollbar w-full",
    results: "flex flex-col p-3 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar mx-auto pb-safe",
  };

  const maxWidthClasses = {
    "md": "max-w-md",
    "lg": "max-w-lg",
    "xl": "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "full": "max-w-full",
  };

  const applyMaxWidth = variant === "centered" || variant === "form" || variant === "results";

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        applyMaxWidth && maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
