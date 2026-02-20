import { useState, useEffect } from "react";
import { FinancialCard } from "@/components/ui/financial-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShoppingCart, Home, Car, Calendar, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  type: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState("fixed");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Expense | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Business");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState("paid");
  const [formType, setFormType] = useState("fixed");

  const resetForm = () => {
    setFormTitle(""); setFormCategory("Business"); setFormAmount("");
    setFormCurrency("USD"); setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus("paid"); setFormType("fixed"); setEditing(null);
  };

  const fetchExpenses = async () => {
    const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSubmit = async () => {
    const payload = { title: formTitle, category: formCategory, amount: parseFloat(formAmount), currency: formCurrency, date: formDate, status: formStatus, type: formType };
    if (editing) {
      await supabase.from('expenses').update(payload).eq('id', editing.id);
      toast({ title: "Expense updated" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('expenses').insert({ ...payload, user_id: user?.id });
      toast({ title: "Expense added" });
    }
    resetForm(); setIsAdding(false); fetchExpenses();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('expenses').delete().eq('id', deleteId);
    setDeleteId(null); toast({ title: "Expense deleted" }); fetchExpenses();
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense); setFormTitle(expense.title); setFormCategory(expense.category);
    setFormAmount(String(expense.amount)); setFormCurrency(expense.currency);
    setFormDate(expense.date); setFormStatus(expense.status); setFormType(expense.type);
    setIsAdding(true);
  };

  const fixedExpenses = expenses.filter(e => e.type === "fixed");
  const variableExpenses = expenses.filter(e => e.type === "variable");
  const totalFixed = fixedExpenses.reduce((s, e) => s + e.amount, 0);
  const totalVariable = variableExpenses.reduce((s, e) => s + e.amount, 0);
  const totalPaid = expenses.filter(e => e.status === "paid").reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  const filteredExpenses = activeTab === "fixed" ? fixedExpenses : variableExpenses;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const getStatusBadgeColor = (s: string) => s === "paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600";

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Title</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Category</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Date</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Status</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide text-right">Amount</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredExpenses.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No {activeTab} expenses yet</TableCell></TableRow>
        ) : filteredExpenses.map((expense) => (
          <TableRow key={expense.id} className="hover:bg-muted/50">
            <TableCell className="text-base font-medium">{expense.title}</TableCell>
            <TableCell className="text-base">{expense.category}</TableCell>
            <TableCell className="text-base">{formatDate(expense.date)}</TableCell>
            <TableCell><Badge className={`${getStatusBadgeColor(expense.status)} text-sm rounded-full px-3 py-1`}>{expense.status}</Badge></TableCell>
            <TableCell className="text-right text-base font-medium">{formatCurrency(expense.amount)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(expense)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(expense.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
          <p className="text-muted-foreground">Track and manage your fixed and variable expenses</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity"><Plus className="h-4 w-4 mr-2" /> Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Expense" : "Add New Expense"}</DialogTitle>
              <DialogDescription>{editing ? "Update the expense" : "Record a new expense"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., Office Rent" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00" /></div>
                <div><Label>Currency</Label><Select value={formCurrency} onValueChange={setFormCurrency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Category</Label><Input value={formCategory} onChange={e => setFormCategory(e.target.value)} placeholder="Business" /></div>
                <div><Label>Type</Label><Select value={formType} onValueChange={setFormType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="variable">Variable</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Status</Label><Select value={formStatus} onValueChange={setFormStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="paid">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem></SelectContent></Select></div>
                <div><Label>Date</Label><Input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} /></div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setIsAdding(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-gradient-primary" onClick={handleSubmit} disabled={!formTitle || !formAmount}>{editing ? "Update" : "Add Expense"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard variant="expense" title="Fixed Expenses" value={formatCurrency(totalFixed)} subtitle="Monthly recurring" icon={<Home className="h-5 w-5" />} />
        <FinancialCard variant="debt" title="Variable Expenses" value={formatCurrency(totalVariable)} subtitle="Fluctuating costs" icon={<ShoppingCart className="h-5 w-5" />} />
        <FinancialCard variant="income" title="Total Paid" value={formatCurrency(totalPaid)} subtitle="Completed payments" icon={<Calendar className="h-5 w-5" />} />
        <FinancialCard variant="asset" title="Total Pending" value={formatCurrency(totalPending)} subtitle="Awaiting payment" icon={<Car className="h-5 w-5" />} />
      </div>

      <div className="bg-gradient-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Expense Overview</h2>
          <p className="text-muted-foreground">View and manage all your expenses</p>
        </div>
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-fit grid-cols-2 bg-muted">
              <TabsTrigger value="fixed">Fixed Expenses</TabsTrigger>
              <TabsTrigger value="variable">Variable Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="fixed" className="mt-6">{renderTable()}</TabsContent>
            <TabsContent value="variable" className="mt-6">{renderTable()}</TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Expense</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
