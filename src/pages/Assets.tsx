import { useState, useEffect } from "react";
import { FinancialCard } from "@/components/ui/financial-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Card, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Gem, Bitcoin, Home, Plus, Edit, Trash2, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useToast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  total_value: number;
  auto_update: boolean;
}

export default function Assets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Asset | null>(null);
  const { formatCurrency } = useCurrency();
  const { toast } = useToast();

  const [formType, setFormType] = useState("silver");
  const [formQuantity, setFormQuantity] = useState("");
  const [formUnit, setFormUnit] = useState("grams");
  const [formPrice, setFormPrice] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");

  const resetForm = () => {
    setFormType("silver"); setFormQuantity(""); setFormUnit("grams");
    setFormPrice(""); setFormCurrency("USD"); setEditing(null);
  };

  const fetchAssets = async () => {
    const { data } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
    if (data) setAssets(data);
    setLoading(false);
  };

  useEffect(() => { fetchAssets(); }, []);

  const handleSubmit = async () => {
    const payload = { type: formType, quantity: parseFloat(formQuantity), unit: formUnit, price_per_unit: parseFloat(formPrice), currency: formCurrency, auto_update: true };
    if (editing) {
      await supabase.from('assets').update(payload).eq('id', editing.id);
      toast({ title: "Asset updated" });
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('assets').insert({ ...payload, user_id: user?.id });
      toast({ title: "Asset added" });
    }
    resetForm(); setIsAdding(false); fetchAssets();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await supabase.from('assets').delete().eq('id', deleteId);
    setDeleteId(null); toast({ title: "Asset deleted" }); fetchAssets();
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset); setFormType(asset.type); setFormQuantity(String(asset.quantity));
    setFormUnit(asset.unit); setFormPrice(String(asset.price_per_unit)); setFormCurrency(asset.currency);
    setIsAdding(true);
  };

  const totalAssetValue = assets.reduce((s, a) => s + a.total_value, 0);
  const silverValue = assets.filter(a => a.type === "silver").reduce((s, a) => s + a.total_value, 0);
  const cryptoValue = assets.filter(a => a.type === "bitcoin" || a.type === "ethereum").reduce((s, a) => s + a.total_value, 0);
  const realEstateValue = assets.filter(a => a.type === "real_estate").reduce((s, a) => s + a.total_value, 0);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "silver": case "gold": return <Gem className="h-5 w-5" />;
      case "bitcoin": case "ethereum": return <Bitcoin className="h-5 w-5" />;
      case "real_estate": return <Home className="h-5 w-5" />;
      default: return <Gem className="h-5 w-5" />;
    }
  };

  const formatAssetType = (type: string) => type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());

  if (loading) return <div className="p-6 flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Asset Tracking</h1>
          <p className="text-muted-foreground">Monitor your non-cash assets like silver, crypto, and real estate</p>
        </div>
        <Dialog open={isAdding} onOpenChange={(open) => { setIsAdding(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-financial"><Plus className="h-4 w-4 mr-2" /> Add Asset</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Asset" : "Add New Asset"}</DialogTitle>
              <DialogDescription>{editing ? "Update the asset" : "Track a new asset in your portfolio"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label>Asset Type</Label>
                <Select value={formType} onValueChange={setFormType}><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silver">Silver</SelectItem><SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem><SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem><SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Quantity</Label><Input type="number" step="0.001" value={formQuantity} onChange={e => setFormQuantity(e.target.value)} placeholder="0.00" /></div>
                <div><Label>Unit</Label>
                  <Select value={formUnit} onValueChange={setFormUnit}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grams">Grams</SelectItem><SelectItem value="ounces">Ounces</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem><SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="property">Property</SelectItem><SelectItem value="shares">Shares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Price per Unit</Label><Input type="number" step="0.01" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="0.00" /></div>
                <div><Label>Currency</Label>
                  <Select value={formCurrency} onValueChange={setFormCurrency}><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="TRY">TRY</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setIsAdding(false); resetForm(); }}>Cancel</Button>
                <Button className="bg-gradient-primary" onClick={handleSubmit} disabled={!formQuantity || !formPrice}>{editing ? "Update" : "Add Asset"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard variant="asset" title="Total Assets" value={formatCurrency(totalAssetValue)} subtitle="All tracked assets" icon={<Gem className="h-5 w-5" />} trend={{ value: "+3.7%", isPositive: true }} />
        <FinancialCard variant="default" title="Silver Value" value={formatCurrency(silverValue)} subtitle="Precious metals" icon={<Gem className="h-5 w-5" />} />
        <FinancialCard variant="default" title="Crypto Value" value={formatCurrency(cryptoValue)} subtitle="Digital assets" icon={<Bitcoin className="h-5 w-5" />} />
        <FinancialCard variant="default" title="Real Estate" value={formatCurrency(realEstateValue)} subtitle="Property value" icon={<Home className="h-5 w-5" />} />
      </div>

      <div className="bg-gradient-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Asset Portfolio</h2>
          <p className="text-muted-foreground">Your tracked assets and their current values</p>
        </div>
        <div className="p-6">
          {assets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gem className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No assets tracked yet</p>
              <p className="text-sm">Click "Add Asset" to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {assets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-asset/10 rounded-lg">{getAssetIcon(asset.type)}</div>
                        <div>
                          <CardTitle className="text-lg">{formatAssetType(asset.type)}</CardTitle>
                          <CardDescription>{asset.quantity} {asset.unit} @ {formatCurrency(asset.price_per_unit)}/{asset.unit}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">{formatCurrency(asset.total_value)}</div>
                          {asset.auto_update && (
                            <div className="flex items-center gap-1 text-xs text-green-600"><TrendingUp className="h-3 w-3" /> Auto-updated</div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(asset)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(asset.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Asset</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
