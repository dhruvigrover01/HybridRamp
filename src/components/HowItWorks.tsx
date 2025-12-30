import { motion } from "framer-motion";
import { UserPlus, Wallet, FileCheck, CreditCard } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in seconds with just your email. No complex forms or overwhelming options.",
  },
  {
    number: "02",
    icon: Wallet,
    title: "Connect Wallet",
    description: "Link your MetaMask or WalletConnect wallet to start receiving and sending crypto.",
  },
  {
    number: "03",
    icon: FileCheck,
    title: "Complete KYC",
    description: "Verify your identity based on your trading needs. Start with Tier 1 and upgrade anytime.",
  },
  {
    number: "04",
    icon: CreditCard,
    title: "Buy Crypto",
    description: "Use UPI or card to purchase crypto instantly. Our smart engine handles the rest.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative bg-secondary/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 block">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Get started in
            <span className="text-gradient"> 4 simple steps</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We've simplified the crypto onboarding process so you can start trading 
            in minutes, not hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-8" />
              )}

              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 rounded-2xl glass flex items-center justify-center glow-sm">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
