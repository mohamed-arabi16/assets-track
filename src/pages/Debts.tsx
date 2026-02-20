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
import { CreditCard, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Debt {
  id: string;
  title: string;
  creditor: string;
  amount: number;
  currency: string;
  due_date: string | null;
  status: string;
  type: string;
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeTab, setActiveTab] = useState("short");
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Debt | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  const [formTitle, setFormTitle] = useState("");
  const [formCreditor, setFormCreditor] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formDueDate, setFormDueDate] = useState("");
  const [formStatus, setFormStatus] = useState("pending");
  const [formType, setFormType] = useState("short");

  const resetForm = () => {
    setFormTitle(""); setFormCreditor(""); setFormAmount("");
    setFormCurrency("USD"); setFormDueDate(""); setFormStatus("pending");
    setFormType("short"); setEditing(null);
  };

  const fetchDebts = async () => {
    const { data } = await supabase.from('debts').select('*').order('created_at', { ascending: false });
    if (data) setDebts(data);
    setLoading(false);
  };

  useEffect(() => { fetchDebts(); }, []);

  const handleSubmit = async () => {
    const payload = { title: formTitle, creditor: formCreditor, amount: parseFloat(formAmount), currency: formCurrency, due_date: formDueDate || null, status: formStatus, type: formType };
    if (editing) {
      await supabase.from('debts').update(payload).eq('id', editing.id);
      toast({ title: "Debt updated" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('debts').insert({ ...payload, user_id: user?.id });
      toast({ title: "Debt added" });
    }
    resetForm(); setIsAdding(false); fetchDebts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('debts').delete().eq('id', deleteId);
    setDeleteId(null); toast({ title: "Debt deleted" }); fetchDebts();
  };

  const openEdit = (debt: Debt) => {
    setEditing(debt); setFormTitle(debt.title); setFormCreditor(debt.creditor);
    setFormAmount(String(debt.amount)); setFormCurrency(debt.currency);
    setFormDueDate(debt.due_date || ""); setFormStatus(debt.status); setFormType(debt.type);
    setIsAdding(true);
  };

  const shortTermDebts = debts.filter(d => d.type === "short");
  const longTermDebts = debts.filter(d => d.type === "long");
  const totalShortTerm = shortTermDebts.reduce((s, d) => s + d.amount, 0);
  const totalLongTerm = longTermDebts.reduce((s, d) => s + d.amount, 0);
  const totalPending = debts.filter(d => d.status === "pending").reduce((s, d) => s + d.amount, 0);
  const totalPaid = debts.filter(d => d.status === "paid").reduce((s, d) => s + d.amount, 0);
  const filteredDebts = activeTab === "short" ? shortTermDebts : longTermDebts;

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : "No fixed date";

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Title</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Creditor</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Due Date</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Status</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide text-right">Amount</TableHead>
          <TableHead className="text-sm text-muted-foreground uppercase tracking-wide">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredDebts.length === 0 ? (
          <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No {activeTab === "short" ? "short-term" : "long-term"} debts</TableCell></TableRow>
        ) : filteredDebts.map((debt) => (
          <TableRow key={debt.id} className="hover:bg-muted/50">
            <TableCell className="text-base font-medium">{debt.title}</TableCell>
            <TableCell className="text-base">{debt.creditor}</TableCell>
            <TableCell className="text-base">{formatDate(debt.due_date)}</TableCell>
            <TableCell><Badge className={`${debt.status === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"} text-sm rounded-full px-3 py-1`}>{debt.status}</Badge></TableCell>
            <TableCell className="text-right text-base font-medium">{formatCurrency(debt.amount)}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(debt)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(debt.id)}><Trash2 className="h-4 w-4" /></Button>
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
          <h1 className="text-3xl font-bold text-foreground">Debt Management</h1>
          <p className="text-muted-foreground">Track and manage your short-term and long-term debts</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-financial"><Plus className="h-4 w-4 mr-2" /> Add Debt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Debt" : "Add New Debt"}</DialogTitle>
              <DialogDescription>{editing ? "Update the debt entry" : "Record a new debt"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="e.g., Credit Card" /></div>
              <div><Label>Creditor</Label><Input value={formCreditor} onChange={e => setFormCreditor(e.target.value)} placeholder="e.g., Bank ABC" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Amount</Label><Input type="number" value={formAmount} onChange={e => setFormAmount(e.target.value)} placeholder="0.00" /></div>
                <div><Label>Currency</Label><Select value={formCurrency} onValueChange={setFormCurrency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Type</Label><Select value={formType} onValueChange={setFormType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="short">Short-term</SelectItem><SelectItem value="long">Long-term</SelectItem></SelectContent></Select></div>
                <div><Label>Status</Label><Select value={formStatus} onValueChange={setFormStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem></SelectContent></Select></div>
              </div>
              <div><Label>Due Date (optional)</Label><Input type="date" value={formDueDate} onChange={e => setFormDueDate(e.target.value)} /></div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setIsAdding(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-gradient-primary" onClick={handleSubmit} disabled={!formTitle || !formCreditor || !formAmount}>{editing ? "Update" : "Add Debt"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard variant="debt" title="Short-Term Debt" value={formatCurrency(totalShortTerm)} subtitle="Due within 60 days" icon={<CreditCard className="h-5 w-5" />} />
        <FinancialCard variant="asset" title="Long-Term Debt" value={formatCurrency(totalLongTerm)} subtitle="Extended payment terms" icon={<AlertTriangle className="h-5 w-5" />} />
        <FinancialCard variant="expense" title="Total Pending" value={formatCurrency(totalPending)} subtitle="Awaiting payment" icon={<Clock className="h-5 w-5" />} />
        <FinancialCard variant="income" title="Total Paid" value={formatCurrency(totalPaid)} subtitle="Completed payments" icon={<CheckCircle className="h-5 w-5" />} />
      </div>

      <div className="bg-gradient-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Debt Overview</h2>
          <p className="text-muted-foreground">View and manage all your debts</p>
        </div>
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-fit grid-cols-2 bg-muted">
              <TabsTrigger value="short">Short-Term Debt</TabsTrigger>
              <TabsTrigger value="long">Long-Term Debt</TabsTrigger>
            </TabsList>
            <TabsContent value="short" className="mt-6">{renderTable()}</TabsContent>
            <TabsContent value="long" className="mt-6">{renderTable()}</TabsContent>
          </Tabs>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Debt</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
