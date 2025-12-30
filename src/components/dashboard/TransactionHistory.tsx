import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Clock, RefreshCw } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { format } from "date-fns";

const TransactionHistory = () => {
  const { transactions, practiceTransactions, isPracticeMode } = useAppStore();
  
  // Use practice transactions when in practice mode
  const displayTransactions = isPracticeMode ? practiceTransactions : transactions;

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
        return "bg-primary/20 text-primary";
      case "sell":
      case "withdraw":
        return "bg-destructive/20 text-destructive";
      case "swap":
        return "bg-blue-500/20 text-blue-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold">
          {isPracticeMode ? "Practice Transactions" : "Recent Transactions"}
        </h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      {displayTransactions.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            {isPracticeMode ? "No practice transactions yet" : "No transactions yet"}
          </p>
          {isPracticeMode && (
            <p className="text-sm text-muted-foreground mt-1">
              Start practicing by making a buy or sell order
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {displayTransactions.slice(0, 5).map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionColor(tx.type)}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium capitalize">{tx.type} {tx.asset}</p>
                    {tx.isPractice && (
                      <span className="text-xs bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">
                        Practice
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(tx.timestamp), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${tx.type === "buy" || tx.type === "deposit" ? "text-primary" : ""}`}>
                  {tx.type === "buy" || tx.type === "deposit" ? "+" : "-"}
                  {tx.amount.toFixed(tx.amount < 1 ? 6 : 2)} {tx.asset}
                </p>
                <p className="text-sm text-muted-foreground">
                  ${tx.usdValue.toLocaleString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TransactionHistory;
