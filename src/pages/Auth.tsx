import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/appStore";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff, AlertCircle, Check, X, Shield } from "lucide-react";
import { Helmet } from "react-helmet";

// Password strength requirements
const passwordRequirements = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { id: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
];

const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
  const passedRequirements = passwordRequirements.filter(req => req.test(password)).length;
  
  if (passedRequirements <= 1) return { score: 20, label: "Very Weak", color: "bg-red-500" };
  if (passedRequirements === 2) return { score: 40, label: "Weak", color: "bg-orange-500" };
  if (passedRequirements === 3) return { score: 60, label: "Fair", color: "bg-yellow-500" };
  if (passedRequirements === 4) return { score: 80, label: "Good", color: "bg-blue-500" };
  return { score: 100, label: "Strong", color: "bg-emerald-500" };
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; confirmPassword?: string }>({});

  const { login, register } = useAppStore();
  const navigate = useNavigate();

  // Load saved credentials on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("rememberedCredentials");
    if (savedCredentials) {
      try {
        const { email: savedEmail, rememberMe: savedRemember } = JSON.parse(savedCredentials);
        if (savedRemember) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {
        // Invalid data, clear it
        localStorage.removeItem("rememberedCredentials");
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (!isLogin) {
      // Strong password validation for registration
      const failedRequirements = passwordRequirements.filter(req => !req.test(password));
      if (failedRequirements.length > 0) {
        newErrors.password = `Password must have: ${failedRequirements.map(r => r.label.toLowerCase()).join(", ")}`;
      }
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (!isLogin) {
      if (!name) {
        newErrors.name = "Name is required";
      } else if (name.trim().length < 2) {
        newErrors.name = "Name must be at least 2 characters";
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords don't match";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        
        // Save or clear remembered credentials
        if (rememberMe) {
          localStorage.setItem("rememberedCredentials", JSON.stringify({
            email: email.toLowerCase().trim(),
            rememberMe: true,
          }));
        } else {
          localStorage.removeItem("rememberedCredentials");
        }
        
        toast.success("Welcome back!");
      } else {
        await register(email, password, name);
        
        // Also save credentials after registration if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberedCredentials", JSON.stringify({
            email: email.toLowerCase().trim(),
            rememberMe: true,
          }));
        }
        
        toast.success("Account created successfully!");
      }
      navigate("/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setPassword("");
    setConfirmPassword("");
    setShowPasswordRequirements(false);
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Sign In" : "Sign Up"} - HybridRampX</title>
        <meta name="description" content="Access your HybridRampX account to trade crypto securely." />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="fixed inset-0 gradient-glow opacity-30" />
        <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">H</span>
            </div>
            <span className="font-heading font-bold text-2xl">
              Hybrid<span className="text-primary">RampX</span>
            </span>
          </div>

          {/* Form Card */}
          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-heading font-bold mb-2">
              {isLogin ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Start your crypto journey today"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
                        className={`pl-10 h-12 bg-secondary border-border ${errors.name ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                    className={`pl-10 h-12 bg-secondary border-border ${errors.email ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      setErrors(prev => ({ ...prev, password: undefined }));
                      if (!isLogin) setShowPasswordRequirements(true);
                    }}
                    onFocus={() => !isLogin && setShowPasswordRequirements(true)}
                    className={`pl-10 pr-10 h-12 bg-secondary border-border ${errors.password ? "border-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator (Sign Up only) */}
                <AnimatePresence>
                  {!isLogin && password && showPasswordRequirements && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {/* Strength Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Password Strength</span>
                          <span className={`font-medium ${
                            passwordStrength.score >= 80 ? "text-emerald-500" : 
                            passwordStrength.score >= 60 ? "text-yellow-500" : "text-red-500"
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full ${passwordStrength.color} rounded-full`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength.score}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                      
                      {/* Requirements Checklist */}
                      <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Password Requirements</span>
                        </div>
                        {passwordRequirements.map((req) => {
                          const passed = req.test(password);
                          return (
                            <div 
                              key={req.id}
                              className={`flex items-center gap-2 text-xs transition-colors ${
                                passed ? "text-emerald-500" : "text-muted-foreground"
                              }`}
                            >
                              {passed ? (
                                <Check className="w-3.5 h-3.5" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              <span>{req.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {errors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                        className={`pl-10 pr-10 h-12 bg-secondary border-border ${errors.confirmPassword ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-emerald-500 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Passwords match
                      </p>
                    )}
                    {errors.confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 peer-checked:border-primary peer-checked:bg-primary transition-all flex items-center justify-center">
                      {rememberMe && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    Remember me
                  </span>
                </label>
                
                {isLogin && (
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </span>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={switchMode}
                className="text-muted-foreground hover:text-primary text-sm transition-colors"
              >
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <span className="text-primary font-medium">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-primary font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-center text-muted-foreground text-xs mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
