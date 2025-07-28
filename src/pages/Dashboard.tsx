import { FinancialCard } from "@/components/ui/financial-card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Gem,
  Calendar
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial health and current balance
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FinancialCard
          variant="balance"
          title="Available Balance"
          value="$12,450.00"
          subtitle="Ready to spend"
          icon={<DollarSign className="h-5 w-5" />}
          trend={{
            value: "+8.2%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="income"
          title="Expected Income"
          value="$8,500.00"
          subtitle="Next 30 days"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: "+12.4%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="expense"
          title="Monthly Expenses"
          value="$3,200.00"
          subtitle="Recurring + one-time"
          icon={<TrendingDown className="h-5 w-5" />}
          trend={{
            value: "-2.1%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="debt"
          title="Short-term Debt"
          value="$1,800.00"
          subtitle="Due within 60 days"
          icon={<CreditCard className="h-5 w-5" />}
          trend={{
            value: "-15.3%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="asset"
          title="Asset Value"
          value="$45,200.00"
          subtitle="Silver, crypto, etc."
          icon={<Gem className="h-5 w-5" />}
          trend={{
            value: "+3.7%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          title="Net Worth"
          value="$55,850.00"
          subtitle="Total assets - debts"
          icon={<Calendar className="h-5 w-5" />}
          trend={{
            value: "+5.1%",
            isPositive: true
          }}
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-card rounded-lg p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-3 text-left rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <div className="font-medium">Add Income</div>
              <div className="text-sm text-muted-foreground">Record a new payment received</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors">
              <div className="font-medium">Add Expense</div>
              <div className="text-sm text-muted-foreground">Log a new expense</div>
            </button>
            <button className="w-full p-3 text-left rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors">
              <div className="font-medium">Update Debt</div>
              <div className="text-sm text-muted-foreground">Manage your debts</div>
            </button>
          </div>
        </div>

        <div className="bg-gradient-card rounded-lg p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-income/10">
              <div>
                <div className="font-medium">Freelance Project</div>
                <div className="text-sm text-muted-foreground">2 hours ago</div>
              </div>
              <div className="text-income font-semibold">+$1,200</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-expense/10">
              <div>
                <div className="font-medium">Office Supplies</div>
                <div className="text-sm text-muted-foreground">Yesterday</div>
              </div>
              <div className="text-expense font-semibold">-$85</div>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-debt/10">
              <div>
                <div className="font-medium">Credit Card Payment</div>
                <div className="text-sm text-muted-foreground">3 days ago</div>
              </div>
              <div className="text-debt font-semibold">-$500</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}