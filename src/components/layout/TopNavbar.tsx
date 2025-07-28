import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Moon, 
  Sun,
  DollarSign
} from "lucide-react";
import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";

export function TopNavbar() {
  const { currency, setCurrency } = useCurrency();
  const [theme, setTheme] = useState("light");
  const [selectedMonth, setSelectedMonth] = useState("2025-01");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-card border-b border-border">
      {/* Month Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-01">January 2025</SelectItem>
            <SelectItem value="2024-12">December 2024</SelectItem>
            <SelectItem value="2024-11">November 2024</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Currency Toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={currency === "USD" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrency("USD")}
            className="h-8 px-3"
          >
            <DollarSign className="h-4 w-4 mr-1" />
            USD
          </Button>
          <Button
            variant={currency === "TRY" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrency("TRY")}
            className="h-8 px-3"
          >
            ₺ TRY
          </Button>
        </div>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
        >
          {theme === "light" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}