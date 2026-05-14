import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-indigo-600/20 text-indigo-300 border-indigo-600/30",
        secondary: "border-transparent bg-slate-700 text-slate-200",
        green: "border-transparent bg-green-500/15 text-green-400 border-green-500/30",
        yellow: "border-transparent bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        orange: "border-transparent bg-orange-500/15 text-orange-400 border-orange-500/30",
        red: "border-transparent bg-red-500/15 text-red-400 border-red-500/30",
        amber: "border-transparent bg-amber-500/15 text-amber-400 border-amber-500/30",
        outline: "text-slate-300 border-slate-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
