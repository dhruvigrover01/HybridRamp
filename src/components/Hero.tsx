import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 gradient-glow opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Secure • Simple • Smart</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6"
            >
              Buy and trade
              <br />
              cryptos like{" "}
              <span className="text-gradient">never before.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0"
            >
              Your beginner-friendly gateway to crypto. Smart execution, dynamic KYC, 
              and hybrid custody — all designed for safety and simplicity.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="w-full sm:w-auto gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/#how-it-works">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  How it Works
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 mt-12 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Bank-grade Security</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm">Instant Trades</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Spline 3D Design */}
          <div className="hidden lg:flex items-center justify-center h-full">
            <Spline scene="https://prod.spline.design/BHhs-lIl6nlcjVKy/scene.splinecode" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
