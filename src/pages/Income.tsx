import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, Edit, Trash2, Filter, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

interface Income {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  date: string;
}

export default function Income() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formCategory, setFormCategory] = useState("freelance");
  const [formStatus, setFormStatus] = useState("expected");
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  const resetForm = () => {
    setFormTitle(""); setFormAmount(""); setFormCurrency("USD");
    setFormCategory("freelance"); setFormStatus("expected");
    setFormDate(new Date().toISOString().split('T')[0]);
    setEditingIncome(null);
  };

  const fetchIncomes = async () => {
    const { data, error } = await supabase.from('incomes').select('*').order('date', { ascending: false });
    if (!error && data) setIncomes(data);
    setLoading(false);
  };

  useEffect(() => { fetchIncomes(); }, []);

  const handleSubmit = async () => {
    const payload = {
      title: formTitle,
      amount: parseFloat(formAmount),
      currency: formCurrency,
      category: formCategory,
      status: formStatus,
      date: formDate,
    };

    if (editingIncome) {
      const { error } = await supabase.from('incomes').update(payload).eq('id', editingIncome.id);
      if (!error) { toast({ title: "Income updated" }); }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('incomes').insert({ ...payload, user_id: user?.id });
      if (!error) { toast({ title: "Income added" }); }
    }
    resetForm();
    setIsAddingIncome(false);
    fetchIncomes();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('incomes').delete().eq('id', deleteId);
    setDeleteId(null);
    toast({ title: "Income deleted" });
    fetchIncomes();
  };

  const openEdit = (income: Income) => {
    setEditingIncome(income);
    setFormTitle(income.title);
    setFormAmount(String(income.amount));
    setFormCurrency(income.currency);
    setFormCategory(income.category);
    setFormStatus(income.status);
    setFormDate(income.date);
    setIsAddingIncome(true);
  };

  const getStatusColor = (status: string) => status === "received" ? "bg-income" : "bg-orange-500";

  const filteredIncomes = incomes.filter(i => filter === "all" || i.status === filter);
  const totalExpected = incomes.filter(i => i.status === "expected").reduce((s, i) => s + i.amount, 0);
  const totalReceived = incomes.filter(i => i.status === "received").reduce((s, i) => s + i.amount, 0);

  const incomeByCategory = incomes.reduce((acc, income) => {
    acc[income.category] = (acc[income.category] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Income Tracking</h1>
          <p className="text-muted-foreground">Manage your freelance income and expected payments</p>
        </div>
        
        <Dialog open={isAddingIncome} onOpenChange={(open) => { setIsAddingIncome(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-financial">
              <Plus className="h-4 w-4 mr-2" /> Add Income
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingIncome ? "Edit Income" : "Add New Income"}</DialogTitle>
              <DialogDescription>
                {editingIncome ? "Update the income entry" : "Record a new income entry"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., Freelance Project" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="TRY">TRY (₺)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelance">Freelance</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expected">Expected</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setIsAddingIncome(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-gradient-primary" onClick={handleSubmit} disabled={!formTitle || !formAmount}>
                  {editingIncome ? "Update" : "Add Income"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-success rounded-lg p-6 text-white shadow-financial">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Received</h3>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalReceived)}</div>
          <p className="text-sm opacity-75">This month</p>
        </div>
        <div className="bg-orange-500 rounded-lg p-6 text-white shadow-financial">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Expected</h3>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalExpected)}</div>
          <p className="text-sm opacity-75">Pending payments</p>
        </div>
        <div className="bg-gradient-primary rounded-lg p-6 text-primary-foreground shadow-financial">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Income</h3>
            <TrendingUp className="h-5 w-5 opacity-80" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(totalReceived + totalExpected)}</div>
          <p className="text-sm opacity-75">Combined total</p>
        </div>
      </div>

      {/* Income by Category */}
      {Object.keys(incomeByCategory).length > 0 && (
        <div className="bg-gradient-card rounded-lg border border-border shadow-card">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-semibold">Total Income by Category</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-income" />
                    <span className="text-sm font-medium capitalize">{category}</span>
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Income List */}
      <div className="bg-gradient-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Income History</h2>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="expected">Expected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {filteredIncomes.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No income recorded yet</p>
            <p className="text-sm">Click "Add Income" to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredIncomes.map((income) => (
              <div key={income.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-income/10 rounded-lg">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{income.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(income.date).toLocaleDateString()} • {income.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(income.amount)}</div>
                      <Badge className={`${getStatusColor(income.status)} text-white`}>{income.status}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(income)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(income.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
