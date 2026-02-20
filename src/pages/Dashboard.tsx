import { useEffect, useState } from "react";
import { FinancialCard } from "@/components/ui/financial-card";
import { 
  DollarSign, TrendingUp, TrendingDown, CreditCard, Gem, Calendar, Loader2
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface RecentItem {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'debt';
  created_at: string;
}

export default function Dashboard() {
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalDebt, setTotalDebt] = useState(0);
  const [totalAssets, setTotalAssets] = useState(0);
  const [recentActivity, setRecentActivity] = useState<RecentItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [incRes, expRes, debtRes, assetRes] = await Promise.all([
        supabase.from('incomes').select('id, title, amount, created_at'),
        supabase.from('expenses').select('id, title, amount, created_at'),
        supabase.from('debts').select('id, title, amount, status, created_at'),
        supabase.from('assets').select('total_value'),
      ]);

      const incomes = incRes.data || [];
      const expenses = expRes.data || [];
      const debts = debtRes.data || [];
      const assets = assetRes.data || [];

      setTotalIncome(incomes.reduce((s, i) => s + i.amount, 0));
      setTotalExpenses(expenses.reduce((s, e) => s + e.amount, 0));
      setTotalDebt(debts.filter(d => d.status === 'pending').reduce((s, d) => s + d.amount, 0));
      setTotalAssets(assets.reduce((s, a) => s + (a.total_value || 0), 0));

      // Build recent activity from last 5 items across all tables
      const recent: RecentItem[] = [
        ...incomes.map(i => ({ ...i, type: 'income' as const })),
        ...expenses.map(e => ({ ...e, type: 'expense' as const })),
        ...debts.map(d => ({ ...d, type: 'debt' as const })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
      setRecentActivity(recent);
      setLoading(false);
    };
    fetchData();
  }, []);

  const balance = totalIncome - totalExpenses - totalDebt;
  const netWorth = totalAssets + totalIncome - totalExpenses - totalDebt;

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'income': return 'bg-income/10 text-income';
      case 'expense': return 'bg-expense/10 text-expense';
      case 'debt': return 'bg-debt/10 text-debt';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
        <p className="text-muted-foreground">Overview of your financial health and current balance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FinancialCard variant="balance" title="Available Balance" value={formatCurrency(balance)} subtitle="Income - Expenses - Debt" icon={<DollarSign className="h-5 w-5" />} />
        <FinancialCard variant="income" title="Total Income" value={formatCurrency(totalIncome)} subtitle="All recorded income" icon={<TrendingUp className="h-5 w-5" />} />
        <FinancialCard variant="expense" title="Total Expenses" value={formatCurrency(totalExpenses)} subtitle="All recorded expenses" icon={<TrendingDown className="h-5 w-5" />} />
        <FinancialCard variant="debt" title="Pending Debt" value={formatCurrency(totalDebt)} subtitle="Outstanding debts" icon={<CreditCard className="h-5 w-5" />} />
        <FinancialCard variant="asset" title="Asset Value" value={formatCurrency(totalAssets)} subtitle="Silver, crypto, etc." icon={<Gem className="h-5 w-5" />} />
        <FinancialCard title="Net Worth" value={formatCurrency(netWorth)} subtitle="Total assets - debts" icon={<Calendar className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-card rounded-lg p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={() => navigate('/income')} className="w-full p-3 text-left rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
              <div className="font-medium">Add Income</div>
              <div className="text-sm text-muted-foreground">Record a new payment received</div>
            </button>
            <button onClick={() => navigate('/expenses')} className="w-full p-3 text-left rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors">
              <div className="font-medium">Add Expense</div>
              <div className="text-sm text-muted-foreground">Log a new expense</div>
            </button>
            <button onClick={() => navigate('/debts')} className="w-full p-3 text-left rounded-lg bg-orange-500/10 hover:bg-orange-500/20 transition-colors">
              <div className="font-medium">Update Debt</div>
              <div className="text-sm text-muted-foreground">Manage your debts</div>
            </button>
          </div>
        </div>

        <div className="bg-gradient-card rounded-lg p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activity yet. Start by adding income or expenses.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div key={`${item.type}-${item.id}`} className={`flex items-center justify-between p-3 rounded-lg ${getActivityColor(item.type)}`}>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm opacity-70">{new Date(item.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="font-semibold">
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
