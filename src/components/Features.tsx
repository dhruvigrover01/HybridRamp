import { motion } from "framer-motion";
import { Shield, Zap, Lock, TrendingUp, Users, Wallet } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Dynamic Risk-Based KYC",
    description: "Tier-based verification that grows with your needs. Start small, scale up as you trade more.",
  },
  {
    icon: Zap,
    title: "Smart Trade Execution",
    description: "AI-powered order splitting for large trades to minimize slippage and maximize value.",
  },
  {
    icon: Lock,
    title: "Hybrid Custody",
    description: "Choose between self-custody or our secure vault with multi-sig protection for high-value assets.",
  },
  {
    icon: TrendingUp,
    title: "Risk Engine",
    description: "Real-time transaction analysis evaluates size, KYC tier, and session risk before approval.",
  },
  {
    icon: Users,
    title: "Beginner Friendly",
    description: "Step-by-step guidance without the complexity of traditional trading platforms.",
  },
  {
    icon: Wallet,
    title: "Easy Wallet Connect",
    description: "Seamlessly connect MetaMask or WalletConnect in seconds.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 gradient-glow opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Everything you need to
            <span className="text-gradient"> trade safely</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built for beginners, powerful enough for institutions. HybridRampX combines 
            simplicity with advanced features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group glass rounded-2xl p-6 hover:glow-sm transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-heading font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
