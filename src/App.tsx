import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WalletPage from "./pages/WalletPage";
import TransactionsPage from "./pages/TransactionsPage";
import KycPage from "./pages/KycPage";
import SecurityPage from "./pages/SecurityPage";
import SettingsPage from "./pages/SettingsPage";
// SafetyPage removed per UX change
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Clean up oversized localStorage data on app start
const cleanupStorage = () => {
  try {
    // Check if storage is corrupted or too large
    const storageKey = "hybrid-ramp-storage";
    const storedData = localStorage.getItem(storageKey);
    
    if (storedData) {
      // If storage exceeds 2MB, it's likely corrupted with file data
      if (storedData.length > 2 * 1024 * 1024) {
        console.warn("Storage data too large, clearing corrupted data...");
        localStorage.removeItem(storageKey);
        return;
      }
      
      // Try to parse and clean up the data
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.state?.user?.kycDocuments) {
          // Remove any large file data that might have been stored
          const docs = parsed.state.user.kycDocuments;
          if (docs.idFile && docs.idFile.length > 1000) {
            delete docs.idFile;
          }
          if (docs.addressProofFile && docs.addressProofFile.length > 1000) {
            delete docs.addressProofFile;
          }
          if (docs.selfieFile && docs.selfieFile.length > 1000) {
            delete docs.selfieFile;
          }
          localStorage.setItem(storageKey, JSON.stringify(parsed));
        }
      } catch {
        // If parsing fails, clear the storage
        localStorage.removeItem(storageKey);
      }
    }
    
    // Also clean up registered users if needed
    const usersKey = "registeredUsers";
    const usersData = localStorage.getItem(usersKey);
    if (usersData && usersData.length > 1 * 1024 * 1024) {
      // Clean up user data
      try {
        const users = JSON.parse(usersData);
        const cleanedUsers = users.map((user: Record<string, unknown>) => {
          if (user.kycDocuments && typeof user.kycDocuments === 'object') {
            const docs = user.kycDocuments as Record<string, unknown>;
            return {
              ...user,
              kycDocuments: {
                idUploaded: docs.idUploaded || false,
                addressProofUploaded: docs.addressProofUploaded || false,
                selfieUploaded: docs.selfieUploaded || false,
              },
            };
          }
          return user;
        });
        localStorage.setItem(usersKey, JSON.stringify(cleanedUsers));
      } catch {
        // If cleanup fails, just continue
      }
    }
  } catch (error) {
    console.error("Error cleaning up storage:", error);
  }
};

// Run cleanup on module load
cleanupStorage();

const App = () => {
  useEffect(() => {
    // Additional cleanup on mount if needed
    cleanupStorage();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/wallet" element={<WalletPage />} />
              <Route path="/dashboard/transactions" element={<TransactionsPage />} />
              <Route path="/dashboard/kyc" element={<KycPage />} />
              <Route path="/dashboard/security" element={<SecurityPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
