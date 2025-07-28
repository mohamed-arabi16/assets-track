import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const financialCardVariants = cva(
  "rounded-lg p-6 shadow-card transition-all duration-200 hover:shadow-elevated",
  {
    variants: {
      variant: {
        default: "bg-card border border-border text-card-foreground",
        balance: "bg-primary/5 border border-primary/20 text-card-foreground shadow-md",
        income: "bg-primary/10 border border-primary/30 text-card-foreground shadow-md",
        expense: "bg-primary/15 border border-primary/40 text-card-foreground shadow-md",
        debt: "bg-primary/20 border border-primary/50 text-card-foreground shadow-md",
        asset: "bg-primary/25 border border-primary/60 text-card-foreground shadow-md",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface FinancialCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof financialCardVariants> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const FinancialCard = React.forwardRef<HTMLDivElement, FinancialCardProps>(
  ({ className, variant, size, title, value, subtitle, icon, trend, ...props }, ref) => {
    return (
      <div
        className={cn(financialCardVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              <span className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {trend.isPositive ? "↗" : "↘"} {trend.value}
              </span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);
FinancialCard.displayName = "FinancialCard";

export { FinancialCard, financialCardVariants };