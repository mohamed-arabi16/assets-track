import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Gem, 
  Settings,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Income",
    href: "/income",
    icon: TrendingUp,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: TrendingDown,
  },
  {
    title: "Debts",
    href: "/debts",
    icon: CreditCard,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: Gem,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "relative flex flex-col h-screen bg-gradient-card border-r border-border transition-all duration-300 ease-smooth",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn(
          "flex items-center gap-2 transition-opacity duration-200",
          collapsed && "opacity-0 pointer-events-none"
        )}>
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-primary rounded-lg">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
            Balance Tracker
          </h1>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11 transition-all duration-200",
                  collapsed && "justify-center px-0",
                  isActive && "bg-gradient-primary shadow-financial"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "transition-opacity duration-200",
                  collapsed && "opacity-0 sr-only"
                )}>
                  {item.title}
                </span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t border-border transition-opacity duration-200",
        collapsed && "opacity-0"
      )}>
        <div className="text-xs text-muted-foreground text-center">
          Built for freelancers & entrepreneurs
        </div>
      </div>
    </div>
  );
}