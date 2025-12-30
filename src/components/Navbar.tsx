import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X, Wallet, Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const navLinks = [
    { name: "Home", path: "/", hash: "" },
    { name: "Features", path: "/", hash: "features" },
    { name: "How it Works", path: "/", hash: "how-it-works" },
    { name: "Dashboard", path: "/dashboard", hash: "" },
  ];

  // Handle scroll to section when hash changes
  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.slice(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const handleNavClick = (path: string, hash: string) => {
    setMobileMenuOpen(false);
    
    if (hash) {
      // If we're already on the home page, just scroll to the section
      if (location.pathname === "/") {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        // Navigate to home page with hash
        navigate(`/${hash ? '#' + hash : ''}`);
      }
    } else {
      // Regular navigation
      navigate(path);
      // Scroll to top for non-hash navigation
      if (path === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const isActive = (path: string, hash: string) => {
    if (hash) {
      return location.pathname === "/" && location.hash === `#${hash}`;
    }
    return location.pathname === path && !location.hash;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">
              Hybrid<span className="text-primary">RampX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path, link.hash)}
                className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${
                  isActive(link.path, link.hash) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
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

            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="hero" size="sm" className="gap-2">
                <Wallet className="w-4 h-4" />
                Launch App
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              className="p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path, link.hash)}
                  className={`block w-full text-left py-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive(link.path, link.hash) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 border-t border-border space-y-2">
                <Link to="/auth" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="hero" className="w-full gap-2">
                    <Wallet className="w-4 h-4" />
                    Launch App
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
