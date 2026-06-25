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
      primary: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm border border-emerald-600/20",
      secondary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm border border-indigo-700/20",
      ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm border border-red-600/20",
      outline: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
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
