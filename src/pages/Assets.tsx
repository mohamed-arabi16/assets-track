import { useState } from "react";
import { FinancialCard } from "@/components/ui/financial-card";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Gem, 
  Bitcoin, 
  Home, 
  Plus,
  Edit,
  Trash2,
  TrendingUp
} from "lucide-react";

// Mock data
const mockAssets = [
  {
    id: 1,
    type: "silver",
    quantity: 150,
    unit: "grams",
    pricePerUnit: 0.85,
    currency: "USD",
    totalValue: 127.50,
    autoUpdate: true
  },
  {
    id: 2,
    type: "bitcoin",
    quantity: 0.05,
    unit: "BTC",
    pricePerUnit: 45000,
    currency: "USD", 
    totalValue: 2250,
    autoUpdate: true
  },
  {
    id: 3,
    type: "real_estate",
    quantity: 1,
    unit: "property",
    pricePerUnit: 250000,
    currency: "USD",
    totalValue: 250000,
    autoUpdate: false
  }
];

export default function Assets() {
  const [assets, setAssets] = useState(mockAssets);
  const [isAddingAsset, setIsAddingAsset] = useState(false);

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.totalValue, 0);
  const silverValue = assets.filter(a => a.type === "silver").reduce((sum, a) => sum + a.totalValue, 0);
  const cryptoValue = assets.filter(a => a.type === "bitcoin").reduce((sum, a) => sum + a.totalValue, 0);
  const realEstateValue = assets.filter(a => a.type === "real_estate").reduce((sum, a) => sum + a.totalValue, 0);

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "silver":
        return <Gem className="h-5 w-5" />;
      case "bitcoin":
        return <Bitcoin className="h-5 w-5" />;
      case "real_estate":
        return <Home className="h-5 w-5" />;
      default:
        return <Gem className="h-5 w-5" />;
    }
  };

  const formatAssetType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Asset Tracking</h1>
          <p className="text-muted-foreground">
            Monitor your non-cash assets like silver, crypto, and real estate
          </p>
        </div>
        
        <Dialog open={isAddingAsset} onOpenChange={setIsAddingAsset}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-financial">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
              <DialogDescription>
                Track a new asset in your portfolio
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="real_estate">Real Estate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" step="0.001" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grams">Grams</SelectItem>
                      <SelectItem value="ounces">Ounces</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="shares">Shares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="price-per-unit">Price per Unit</Label>
                <Input id="price-per-unit" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsAddingAsset(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-primary">
                  Add Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          variant="asset"
          title="Total Assets"
          value={`$${totalAssetValue.toLocaleString()}`}
          subtitle="All tracked assets"
          icon={<Gem className="h-5 w-5" />}
          trend={{
            value: "+3.7%",
            isPositive: true
          }}
        />
        
        <FinancialCard
          variant="default"
          title="Silver Value"
          value={`$${silverValue.toLocaleString()}`}
          subtitle="Precious metals"
          icon={<Gem className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="default"
          title="Crypto Value" 
          value={`$${cryptoValue.toLocaleString()}`}
          subtitle="Digital assets"
          icon={<Bitcoin className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="default"
          title="Real Estate"
          value={`$${realEstateValue.toLocaleString()}`}
          subtitle="Property value"
          icon={<Home className="h-5 w-5" />}
        />
      </div>

      {/* Asset List */}
      <div className="bg-gradient-card rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Asset Portfolio</h2>
          <p className="text-muted-foreground">Your tracked assets and their current values</p>
        </div>
        
        <div className="p-6">
          <div className="grid gap-4">
            {assets.map((asset) => (
              <Card key={asset.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-asset/10 rounded-lg">
                        {getAssetIcon(asset.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{formatAssetType(asset.type)}</CardTitle>
                        <CardDescription>
                          {asset.quantity} {asset.unit} @ ${asset.pricePerUnit.toLocaleString()}/{asset.unit}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold">${asset.totalValue.toLocaleString()}</div>
                        {asset.autoUpdate && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            Auto-updated
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}