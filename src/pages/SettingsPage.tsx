import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/store/appStore";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { 
  Settings,
  User,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Download,
  Mail,
  Smartphone
} from "lucide-react";

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [tradeAlerts, setTradeAlerts] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  
  // Preferences
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");

  const { user } = useAppStore();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleSaveProfile = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Profile updated successfully!");
    setSaving(false);
  };

  const handleExportData = () => {
    // Create export data
    const exportData = {
      user: user,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hybridrampx-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Data exported successfully!");
  };

  const handleDeleteAccount = () => {
    toast.error("Account deletion requires email confirmation. Check your inbox.");
  };

  return (
    <>
      <Helmet>
        <title>Settings - HybridRampX</title>
      </Helmet>

      <div className="min-h-screen bg-background flex">
        <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 lg:ml-64">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} onBuyClick={() => {}} />

          <main className="p-4 lg:p-8 pt-24">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-2xl lg:text-3xl font-heading font-bold mb-2">
                  Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your account preferences and notifications
                </p>
              </motion.div>

              {/* Profile Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Profile Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your personal details
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={name || user?.name || ""}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      value={email || user?.email || ""}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      type="email"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  className="mt-6"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </motion.div>

              {/* Theme Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    {resolvedTheme === "dark" ? (
                      <Moon className="w-6 h-6 text-violet-500" />
                    ) : (
                      <Sun className="w-6 h-6 text-violet-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Appearance</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize how HybridRampX looks
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === "light"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Light</p>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === "dark"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Dark</p>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      theme === "system"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Monitor className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">System</p>
                  </button>
                </div>
              </motion.div>

              {/* Notification Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose what notifications you receive
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Trade Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified about trade executions</p>
                      </div>
                    </div>
                    <Switch
                      checked={tradeAlerts}
                      onCheckedChange={setTradeAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Price Alerts</p>
                        <p className="text-sm text-muted-foreground">Get notified when prices hit targets</p>
                      </div>
                    </div>
                    <Switch
                      checked={priceAlerts}
                      onCheckedChange={setPriceAlerts}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive news and promotions</p>
                      </div>
                    </div>
                    <Switch
                      checked={marketingEmails}
                      onCheckedChange={setMarketingEmails}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Preferences</h3>
                    <p className="text-sm text-muted-foreground">
                      Customize your experience
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>

              {/* Data & Privacy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Download className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Data & Privacy</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your data and account
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                    <div>
                      <p className="font-medium">Export Your Data</p>
                      <p className="text-sm text-muted-foreground">
                        Download a copy of your account data
                      </p>
                    </div>
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <div>
                      <p className="font-medium text-red-500">Delete Account</p>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                      onClick={handleDeleteAccount}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
