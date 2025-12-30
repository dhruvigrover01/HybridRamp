import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import PracticeModeToggle from "@/components/dashboard/PracticeModeToggle";
import { format } from "date-fns";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Search,
  Filter,
  Download,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

const TransactionsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { transactions, isPracticeMode, practiceTransactions } = useAppStore();

  const allTransactions = isPracticeMode ? practiceTransactions : transactions;

  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesSearch = tx.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
      case "deposit":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "sell":
      case "withdraw":
        return <ArrowUpRight className="w-4 h-4" />;
      case "swap":
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "buy":
      case "deposit":
        return "bg-emerald-500/20 text-emerald-500";
      case "sell":
      case "withdraw":
        return "bg-red-500/20 text-red-500";
      case "swap":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Transactions - HybridRampX</title>
      </Helmet>

      <div className="min-h-screen bg-background flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} onBuyClick={() => {}} />

          <main className="p-4 lg:p-8 pt-24">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div>
                  <h1 className="text-2xl lg:text-3xl font-heading font-bold mb-2">
                    Transaction History
                    {isPracticeMode && (
                      <span className="ml-2 text-sm bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">
                        Practice Mode
                      </span>
                    )}
                  </h1>
                  <p className="text-muted-foreground">
                    View and manage all your transactions
                  </p>
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </motion.div>

              {/* Practice Mode Toggle */}
              <PracticeModeToggle />

              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-4"
              >
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by asset or transaction hash..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[140px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                        <SelectItem value="swap">Swap</SelectItem>
                        <SelectItem value="deposit">Deposit</SelectItem>
                        <SelectItem value="withdraw">Withdraw</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              {/* Transactions List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-heading font-semibold mb-2">No transactions found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery || filterType !== "all" || filterStatus !== "all"
                        ? "Try adjusting your filters"
                        : "Your transactions will appear here"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground border-b border-border bg-secondary/30">
                          <th className="p-4 font-medium">Type</th>
                          <th className="p-4 font-medium">Asset</th>
                          <th className="p-4 font-medium">Amount</th>
                          <th className="p-4 font-medium">Value</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Date</th>
                          <th className="p-4 font-medium">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((tx, index) => (
                          <motion.tr
                            key={tx.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + index * 0.02 }}
                            className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                                  {getTransactionIcon(tx.type)}
                                </div>
                                <span className="font-medium capitalize">{tx.type}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">{tx.asset}</span>
                            </td>
                            <td className="p-4">
                              <span className={`font-medium ${
                                tx.type === "buy" || tx.type === "deposit" ? "text-emerald-500" : ""
                              }`}>
                                {tx.type === "buy" || tx.type === "deposit" ? "+" : "-"}
                                {tx.amount.toFixed(6)}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="font-medium">${tx.usdValue.toLocaleString()}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(tx.status)}
                                <span className={`text-sm capitalize ${
                                  tx.status === "completed" ? "text-emerald-500" :
                                  tx.status === "pending" ? "text-amber-500" :
                                  "text-red-500"
                                }`}>
                                  {tx.status}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <p className="text-sm">{format(new Date(tx.timestamp), "MMM d, yyyy")}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(tx.timestamp), "h:mm a")}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              {tx.txHash ? (
                                <a
                                  href="#"
                                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                                >
                                  <span className="font-mono">{tx.txHash.slice(0, 10)}...</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>

              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                  <p className="text-2xl font-heading font-bold">{filteredTransactions.length}</p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                  <p className="text-2xl font-heading font-bold">
                    ${filteredTransactions.reduce((sum, tx) => sum + tx.usdValue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Buys</p>
                  <p className="text-2xl font-heading font-bold text-emerald-500">
                    {filteredTransactions.filter(tx => tx.type === "buy").length}
                  </p>
                </div>
                <div className="glass rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-1">Sells</p>
                  <p className="text-2xl font-heading font-bold text-red-500">
                    {filteredTransactions.filter(tx => tx.type === "sell").length}
                  </p>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default TransactionsPage;

