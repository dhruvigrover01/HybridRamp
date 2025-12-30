import { useState } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { 
  Shield, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff,
  Lock,
  Laptop,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle2,
  LogOut,
  Fingerprint
} from "lucide-react";

const activeSessions = [
  {
    id: "1",
    device: "Windows PC",
    browser: "Chrome 120",
    location: "New York, US",
    ip: "192.168.1.***",
    lastActive: "Now",
    current: true,
  },
  {
    id: "2",
    device: "iPhone 15",
    browser: "Safari",
    location: "New York, US",
    ip: "192.168.1.***",
    lastActive: "2 hours ago",
    current: false,
  },
];

const SecurityPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const { user, enableTwoFactor, disableTwoFactor } = useAppStore();

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setChangingPassword(false);
  };

  const handle2FAToggle = async () => {
    if (user?.twoFactorEnabled) {
      setEnabling2FA(true);
      await disableTwoFactor();
      toast.success("2FA disabled");
      setEnabling2FA(false);
    } else {
      setShow2FASetup(true);
    }
  };

  const handleEnable2FA = async () => {
    if (otpCode !== "123456") {
      toast.error("Invalid code. Use 123456 for demo.");
      return;
    }

    setEnabling2FA(true);
    await enableTwoFactor();
    toast.success("2FA enabled successfully!");
    setShow2FASetup(false);
    setOtpCode("");
    setEnabling2FA(false);
  };

  const handleLogoutSession = (sessionId: string) => {
    toast.success("Session terminated");
  };

  return (
    <>
      <Helmet>
        <title>Security Settings - HybridRampX</title>
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
                  Security Settings
                </h1>
                <p className="text-muted-foreground">
                  Manage your account security and active sessions
                </p>
              </motion.div>

              {/* Security Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    user?.twoFactorEnabled ? "bg-emerald-500/20" : "bg-amber-500/20"
                  }`}>
                    <Shield className={`w-8 h-8 ${user?.twoFactorEnabled ? "text-emerald-500" : "text-amber-500"}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Security Score</p>
                    <h2 className="text-2xl font-heading font-bold">
                      {user?.twoFactorEnabled ? "Strong" : "Moderate"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {user?.twoFactorEnabled 
                        ? "Your account is well protected" 
                        : "Enable 2FA to improve security"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-secondary/50 text-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Email Verified</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${user?.phone ? "bg-emerald-500/10" : "bg-secondary/50"}`}>
                    {user?.phone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    )}
                    <p className="text-xs text-muted-foreground">Phone Verified</p>
                  </div>
                  <div className={`p-3 rounded-xl text-center ${user?.twoFactorEnabled ? "bg-emerald-500/10" : "bg-secondary/50"}`}>
                    {user?.twoFactorEnabled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                    )}
                    <p className="text-xs text-muted-foreground">2FA Enabled</p>
                  </div>
                </div>
              </motion.div>

              {/* Two-Factor Authentication */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={user?.twoFactorEnabled || false}
                    onCheckedChange={handle2FAToggle}
                    disabled={enabling2FA}
                  />
                </div>

                {show2FASetup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="border-t border-border pt-6 space-y-4"
                  >
                    <div className="p-4 rounded-xl bg-secondary/50">
                      <p className="text-sm font-medium mb-2">Setup Instructions:</p>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Download Google Authenticator or Authy</li>
                        <li>Scan the QR code below or enter the secret key</li>
                        <li>Enter the 6-digit code to verify</li>
                      </ol>
                    </div>

                    {/* Mock QR Code */}
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-white rounded-xl p-4 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-black via-gray-800 to-black rounded grid grid-cols-8 gap-0.5 p-2">
                          {Array.from({ length: 64 }).map((_, i) => (
                            <div
                              key={i}
                              className={`${Math.random() > 0.5 ? "bg-white" : "bg-transparent"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Secret Key</p>
                      <code className="text-sm bg-secondary px-3 py-1 rounded">DEMO-SECRET-KEY-123</code>
                    </div>

                    <div className="space-y-2">
                      <Label>Enter verification code</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code (use 123456)"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="flex-1"
                          maxLength={6}
                        />
                        <Button onClick={handleEnable2FA} disabled={enabling2FA}>
                          {enabling2FA ? "Verifying..." : "Verify"}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Change Password */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Key className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Change Password</h3>
                    <p className="text-sm text-muted-foreground">
                      Update your password regularly for better security
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handlePasswordChange} 
                    disabled={changingPassword}
                    className="w-full"
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                </div>
              </motion.div>

              {/* Active Sessions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Laptop className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold">Active Sessions</h3>
                      <p className="text-sm text-muted-foreground">
                        Manage devices logged into your account
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Log out all
                  </Button>
                </div>

                <div className="space-y-3">
                  {activeSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-4 rounded-xl ${
                        session.current ? "bg-primary/10 border border-primary/20" : "bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            {session.device.includes("iPhone") ? (
                              <Smartphone className="w-5 h-5" />
                            ) : (
                              <Laptop className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{session.device}</p>
                              {session.current && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {session.browser} · {session.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">{session.lastActive}</p>
                          {!session.current && (
                            <button
                              onClick={() => handleLogoutSession(session.id)}
                              className="text-xs text-red-500 hover:underline mt-1"
                            >
                              Terminate
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Security Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20"
              >
                <div className="flex items-start gap-3">
                  <Fingerprint className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-500">Security Tips</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                      <li>Never share your password or 2FA codes with anyone</li>
                      <li>Use a unique password for your HybridRampX account</li>
                      <li>Enable 2FA for maximum account protection</li>
                      <li>Regularly review your active sessions</li>
                    </ul>
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

export default SecurityPage;

