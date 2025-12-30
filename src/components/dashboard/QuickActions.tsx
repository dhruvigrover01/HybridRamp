import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Send } from "lucide-react";

interface QuickActionsProps {
  onBuyClick: () => void;
}

const actions = [
  { icon: ArrowDownLeft, label: "Buy", color: "bg-primary/20 text-primary", action: "buy" },
  { icon: ArrowUpRight, label: "Sell", color: "bg-destructive/20 text-destructive", action: "sell" },
  { icon: RefreshCw, label: "Swap", color: "bg-info/20 text-info", action: "swap" },
  { icon: Send, label: "Send", color: "bg-warning/20 text-warning", action: "send" },
];

const QuickActions = ({ onBuyClick }: QuickActionsProps) => {
  const handleAction = (action: string) => {
    if (action === "buy") {
      onBuyClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          onClick={() => handleAction(action.action)}
          className="glass rounded-2xl p-6 hover:glow-sm transition-all group"
        >
          <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
            <action.icon className="w-6 h-6" />
          </div>
          <p className="font-medium text-center">{action.label}</p>
        </motion.button>
      ))}
    </motion.div>
  );
};

export default QuickActions;
