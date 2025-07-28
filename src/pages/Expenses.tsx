import { useState } from "react";
import { FinancialCard } from "@/components/ui/financial-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  Home, 
  Car, 
  Calendar,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";

// Mock data
const mockExpenses = [
  {
    id: 1,
    title: "Office Rent",
    category: "Business",
    amount: 1200,
    currency: "USD",
    date: "2025-01-15",
    status: "paid",
    type: "fixed"
  },
  {
    id: 2,
    title: "Grocery Shopping",
    category: "Food",
    amount: 85,
    currency: "USD",
    date: "2025-01-10",
    status: "paid",
    type: "variable"
  },
  {
    id: 3,
    title: "Internet Bill",
    category: "Utilities",
    amount: 60,
    currency: "USD",
    date: "2025-01-05",
    status: "pending",
    type: "fixed"
  },
  {
    id: 4,
    title: "Car Maintenance",
    category: "Transportation",
    amount: 350,
    currency: "USD",
    date: "2025-01-08",
    status: "paid",
    type: "variable"
  },
  {
    id: 5,
    title: "Software Subscription",
    category: "Business",
    amount: 29,
    currency: "USD",
    date: "2025-01-01",
    status: "paid",
    type: "fixed"
  }
];

export default function Expenses() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [activeTab, setActiveTab] = useState("fixed");
  const { formatCurrency } = useCurrency();

  const fixedExpenses = expenses.filter(expense => expense.type === "fixed");
  const variableExpenses = expenses.filter(expense => expense.type === "variable");
  
  const totalFixed = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalVariable = variableExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = expenses.filter(expense => expense.status === "paid").reduce((sum, expense) => sum + expense.amount, 0);
  const totalPending = expenses.filter(expense => expense.status === "pending").reduce((sum, expense) => sum + expense.amount, 0);

  const filteredExpenses = activeTab === "fixed" ? fixedExpenses : variableExpenses;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    return status === "paid" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600";
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-dashboard min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
          <p className="text-muted-foreground">
            Track and manage your fixed and variable expenses
          </p>
        </div>
        
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinancialCard
          variant="expense"
          title="Fixed Expenses"
          value={formatCurrency(totalFixed)}
          subtitle="Monthly recurring"
          icon={<Home className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="debt"
          title="Variable Expenses"
          value={formatCurrency(totalVariable)}
          subtitle="Fluctuating costs"
          icon={<ShoppingCart className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="income"
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle="Completed payments"
          icon={<Calendar className="h-5 w-5" />}
        />
        
        <FinancialCard
          variant="asset"
          title="Total Pending"
          value={formatCurrency(totalPending)}
          subtitle="Awaiting payment"
          icon={<Car className="h-5 w-5" />}
        />
      </div>

      {/* Expense Overview */}
      <div className="bg-gradient-card rounded-xl border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Expense Overview</h2>
          <p className="text-muted-foreground">View and manage all your expenses</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-fit grid-cols-2 bg-[#E9F4F4] dark:bg-muted">
              <TabsTrigger 
                value="fixed" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#0C1439] data-[state=active]:font-semibold data-[state=active]:shadow"
              >
                Fixed Expenses
              </TabsTrigger>
              <TabsTrigger 
                value="variable"
                className="data-[state=active]:bg-white data-[state=active]:text-[#0C1439] data-[state=active]:font-semibold data-[state=active]:shadow"
              >
                Variable Expenses
              </TabsTrigger>
            </TabsList>

            <TabsContent value="fixed" className="mt-6">
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
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell className="text-base font-medium text-[#0C1439] dark:text-foreground">
                        {expense.title}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(expense.status)} text-sm rounded-full px-3 py-1`}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base font-medium text-[#0C1439] dark:text-foreground">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="variable" className="mt-6">
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
                  {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell className="text-base font-medium text-[#0C1439] dark:text-foreground">
                        {expense.title}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-base text-[#0C1439] dark:text-foreground">
                        {formatDate(expense.date)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadgeColor(expense.status)} text-sm rounded-full px-3 py-1`}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-base font-medium text-[#0C1439] dark:text-foreground">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="cursor-pointer text-gray-500 hover:text-gray-800">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}