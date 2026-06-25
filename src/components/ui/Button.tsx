import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm border border-emerald-500/20",
      secondary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm border border-indigo-500/20",
      ghost: "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-50",
      destructive: "bg-rose-600 text-white hover:bg-rose-500 shadow-sm border border-rose-500/20",
      outline: "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:border-slate-700"
    };

    const sizes = {
      sm: "h-9 px-3 text-sm rounded-lg min-w-[44px]",
      md: "h-11 px-5 font-semibold rounded-xl min-w-[44px]",
      lg: "h-14 px-8 text-lg font-bold rounded-2xl",
      icon: "h-11 w-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
