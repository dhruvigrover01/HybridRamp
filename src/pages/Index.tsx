import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { Helmet } from "react-helmet";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>HybridRampX - Buy & Trade Crypto Securely</title>
        <meta
          name="description"
          content="Your beginner-friendly gateway to crypto. Smart execution, dynamic KYC, and hybrid custody — all designed for safety and simplicity."
        />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <Features />
          <HowItWorks />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
