import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpDown, 
  Shield, 
  Settings, 
  LogOut,
  X,
  TrendingUp,
  FileCheck,
  Heart,
  BookOpen
} from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { useNavigate } from "react-router-dom";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Wallet, label: "Wallet", path: "/dashboard/wallet" },
  { icon: ArrowUpDown, label: "Transactions", path: "/dashboard/transactions" },
  { icon: FileCheck, label: "KYC", path: "/dashboard/kyc" },
  { icon: Shield, label: "Security", path: "/dashboard/security" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);
  const user = useAppStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">H</span>
                </div>
                <span className="font-heading font-bold text-lg">
                  Hybrid<span className="text-primary">RampX</span>
                </span>
              </Link>
              <button onClick={onClose} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="p-4 mx-4 mt-4 rounded-xl bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  user.kycTier >= 2 ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"
                }`}>
                  Tier {user.kycTier} KYC
                </span>
                <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                  {user.riskLevel} risk
                </span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isHighlight = 'highlight' in item && item.highlight;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : isHighlight
                      ? "text-rose-500 hover:bg-rose-500/10"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isHighlight && !isActive ? "text-rose-500" : ""}`} />
                  <span className="font-medium">{item.label}</span>
                  {isHighlight && !isActive && (
                    <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-500">
                      NEW
                    </span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
