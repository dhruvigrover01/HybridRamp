import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Plus, FlaskConical, Moon, Sun, TrendingUp, TrendingDown, Shield, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useTheme } from "@/contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "trade";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface DashboardHeaderProps {
  onMenuClick: () => void;
  onBuyClick: () => void;
}

const DashboardHeader = ({ onMenuClick, onBuyClick }: DashboardHeaderProps) => {
  const walletConnected = useAppStore((state) => state.walletConnected);
  const walletInfo = useAppStore((state) => state.walletInfo);
  const isPracticeMode = useAppStore((state) => state.isPracticeMode);
  const transactions = useAppStore((state) => state.transactions);
  const practiceTransactions = useAppStore((state) => state.practiceTransactions);
  const safetyWarnings = useAppStore((state) => state.safetyWarnings);
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Generate notifications from recent activity
    const notifs: Notification[] = [];
    
    // Add transaction notifications
    const recentTxs = isPracticeMode 
      ? practiceTransactions.slice(0, 3) 
      : transactions.slice(0, 3);
    
    recentTxs.forEach((tx, i) => {
      notifs.push({
        id: `tx-${tx.id}`,
        type: "trade",
        title: `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} Order ${tx.status}`,
        message: `${tx.amount} ${tx.asset} - $${tx.usdValue.toLocaleString()}`,
        time: new Date(tx.timestamp).toLocaleTimeString(),
        read: i > 0,
      });
    });
    
    // Add safety warnings
    safetyWarnings.slice(0, 2).forEach((warning, i) => {
      notifs.push({
        id: warning.id,
        type: "warning",
        title: "Safety Alert",
        message: warning.message,
        time: "Recently",
        read: i > 0,
      });
    });
    
    // Add default notifications if empty
    if (notifs.length === 0) {
      notifs.push(
        {
          id: "welcome",
          type: "info",
          title: "Welcome to HybridRampX!",
          message: "Start trading safely with our beginner-friendly platform.",
          time: "Now",
          read: false,
        },
        {
          id: "kyc",
          type: "info",
          title: "Complete Your KYC",
          message: "Verify your identity to unlock higher trading limits.",
          time: "Today",
          read: true,
        }
      );
    }
    
    return notifs;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "trade":
        return <TrendingUp className="w-4 h-4 text-primary" />;
      default:
        return <Shield className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-card/80 backdrop-blur-sm border-b border-border z-30">
      <div className="flex items-center justify-between h-full px-4 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden sm:flex items-center gap-3">
            <h2 className="font-heading font-semibold">Dashboard</h2>
            {isPracticeMode && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-medium">
                <FlaskConical className="w-3.5 h-3.5" />
                Practice Mode
              </span>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                {resolvedTheme === "dark" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem 
                onClick={() => setTheme("light")}
                className={theme === "light" ? "bg-secondary" : ""}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("dark")}
                className={theme === "dark" ? "bg-secondary" : ""}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setTheme("system")}
                className={theme === "system" ? "bg-secondary" : ""}
              >
                <span className="w-4 h-4 mr-2 flex items-center justify-center text-xs">💻</span>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Status */}
          {!isPracticeMode && walletConnected && walletInfo?.address && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">
                {walletInfo.address.slice(0, 6)}...{walletInfo.address.slice(-4)}
              </span>
            </div>
          )}

          {/* Practice Mode Balance Indicator */}
          {isPracticeMode && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <FlaskConical className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-500 font-medium">
                Virtual Funds
              </span>
            </div>
          )}

          {/* Notifications Dropdown */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notifications yet</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-start gap-3 p-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification.id);
                              }}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
              
              <DropdownMenuSeparator />
              <div className="p-2">
                <button 
                  className="w-full text-center text-sm text-primary hover:underline py-2"
                  onClick={() => setNotificationsOpen(false)}
                >
                  View all notifications
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Buy Button */}
          <Button 
            variant={isPracticeMode ? "outline" : "hero"} 
            size="sm" 
            onClick={onBuyClick} 
            className={`gap-2 ${isPracticeMode ? "border-amber-500/50 text-amber-500 hover:bg-amber-500/10" : ""}`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isPracticeMode ? "Practice Buy" : "Buy Crypto"}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
