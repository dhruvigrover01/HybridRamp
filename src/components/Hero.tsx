import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  // Generate falling coins
  const fallingCoins = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: 50 + Math.random() * 400,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 2,
    size: 15 + Math.random() * 25,
    rotation: Math.random() * 360,
  }));

  // Floating coins data
  const floatingCoins = [
    { x: 80, y: 100, size: 40, delay: 0 },
    { x: 420, y: 80, size: 35, delay: 0.5 },
    { x: 450, y: 200, size: 50, delay: 1 },
    { x: 60, y: 300, size: 30, delay: 1.5 },
    { x: 400, y: 320, size: 45, delay: 2 },
  ];

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

          {/* Right Content - Fully Animated Crypto Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-xl h-[550px]">
              <svg
                viewBox="0 0 500 550"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
              >
                {/* Animated Background Glow */}
                <motion.ellipse
                  cx="250"
                  cy="300"
                  rx="200"
                  ry="200"
                  fill="url(#glowGradient)"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Gradient Definitions */}
                <defs>
                  <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(142 76% 25%)" />
                  </linearGradient>
                  <linearGradient id="coinShine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Falling Coins Animation */}
                {fallingCoins.map((coin) => (
                  <motion.g
                    key={coin.id}
                    initial={{ y: -100, x: coin.x, opacity: 0, rotate: coin.rotation }}
                    animate={{
                      y: [-100, 600],
                      opacity: [0, 1, 1, 0],
                      rotate: [coin.rotation, coin.rotation + 720],
                    }}
                    transition={{
                      duration: coin.duration,
                      repeat: Infinity,
                      delay: coin.delay,
                      ease: "easeIn",
                    }}
                  >
                    <circle r={coin.size / 2} fill="url(#coinGradient)" />
                    <circle r={coin.size / 2 - 3} fill="url(#coinGradient)" stroke="hsl(142 76% 45%)" strokeWidth="2" />
                    <text 
                      y={coin.size / 6} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize={coin.size / 2.5} 
                      fontWeight="bold"
                    >
                      $
                    </text>
                  </motion.g>
                ))}

                {/* Floating Dollar Coins with bounce */}
                {floatingCoins.map((coin, i) => (
                  <motion.g
                    key={`float-${i}`}
                    initial={{ x: coin.x, y: coin.y }}
                    animate={{
                      y: [coin.y, coin.y - 30, coin.y],
                      x: [coin.x, coin.x + 10, coin.x - 10, coin.x],
                      rotate: [0, 15, -15, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      delay: coin.delay,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Coin shadow */}
                    <ellipse 
                      cx={0} 
                      cy={coin.size / 2 + 5} 
                      rx={coin.size / 2} 
                      ry={coin.size / 6} 
                      fill="black" 
                      opacity="0.2"
                    />
                    {/* Coin body */}
                    <circle r={coin.size / 2} fill="url(#coinGradient)" />
                    <circle r={coin.size / 2 - 4} fill="none" stroke="hsl(142 76% 50%)" strokeWidth="3" />
                    <circle r={coin.size / 2 - 8} fill="none" stroke="hsl(142 76% 55%)" strokeWidth="1" />
                    {/* Shine effect */}
                    <ellipse 
                      cx={-coin.size / 6} 
                      cy={-coin.size / 6} 
                      rx={coin.size / 4} 
                      ry={coin.size / 6} 
                      fill="white" 
                      opacity="0.3"
                    />
                    {/* Dollar sign */}
                    <text 
                      y={coin.size / 5} 
                      textAnchor="middle" 
                      fill="white" 
                      fontSize={coin.size / 2} 
                      fontWeight="bold"
                      style={{ textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}
                    >
                      $
                    </text>
                  </motion.g>
                ))}

                {/* Main Coin Stack with bounce animation */}
                <motion.g
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Stacked Coins */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.g
                      key={`stack-${i}`}
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, duration: 0.5, type: "spring", bounce: 0.4 }}
                    >
                      {/* Coin edge/side */}
                      <rect 
                        x={100} 
                        y={420 - i * 20} 
                        width={80} 
                        height={18} 
                        rx={3}
                        fill="hsl(142 76% 30%)"
                      />
                      {/* Coin face */}
                      <ellipse 
                        cx={140} 
                        cy={420 - i * 20} 
                        rx={40} 
                        ry={10} 
                        fill="url(#coinGradient)"
                      />
                      {/* Coin highlight */}
                      <ellipse 
                        cx={140} 
                        cy={418 - i * 20} 
                        rx={30} 
                        ry={6} 
                        fill="hsl(142 76% 50%)"
                        opacity="0.6"
                      />
                      {/* Coin lines */}
                      <rect x={105} y={425 - i * 20} width={70} height={2} fill="hsl(142 76% 25%)" opacity="0.5" />
                      <rect x={105} y={430 - i * 20} width={70} height={2} fill="hsl(142 76% 25%)" opacity="0.5" />
                    </motion.g>
                  ))}

                  {/* Bouncing coin on top */}
                  <motion.g
                    animate={{
                      y: [0, -20, 0],
                      rotate: [-20, -25, -20],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "120px 280px" }}
                  >
                    <ellipse cx={120} cy={280} rx={40} ry={12} fill="url(#coinGradient)" transform="rotate(-20 120 280)" />
                    <rect x={82} y={275} width={76} height={16} rx={3} fill="hsl(142 76% 30%)" transform="rotate(-20 120 280)" />
                    <ellipse cx={120} cy={278} rx={30} ry={8} fill="hsl(142 76% 50%)" opacity="0.5" transform="rotate(-20 120 280)" />
                  </motion.g>
                </motion.g>

                {/* Woman Character with animations */}
                <motion.g
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Shadow */}
                  <motion.ellipse 
                    cx={280} 
                    cy={500} 
                    rx={70} 
                    ry={15} 
                    fill="black" 
                    opacity="0.15"
                    animate={{ 
                      rx: [70, 65, 70],
                      opacity: [0.15, 0.1, 0.15]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />

                  {/* Legs */}
                  <path d="M250 420 L242 490 L260 495 L265 425" fill="#1a3a2f" />
                  <path d="M295 420 L305 490 L323 488 L310 420" fill="#1a3a2f" />

                  {/* Shoes with bounce */}
                  <motion.ellipse 
                    cx={252} cy={497} rx={20} ry={9} 
                    fill="#c4a7e7"
                    animate={{ scaleX: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2.5 }}
                  />
                  <motion.ellipse 
                    cx={314} cy={492} rx={20} ry={9} 
                    fill="#c4a7e7"
                    animate={{ scaleX: [1, 1.05, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2.5, delay: 0.1 }}
                  />

                  {/* Body */}
                  <path 
                    d="M240 320 C225 335 220 370 225 420 L310 420 C315 370 310 335 295 320 Z" 
                    fill="hsl(142 76% 36%)"
                  />
                  {/* Shirt highlight */}
                  <path 
                    d="M250 330 C240 345 238 375 240 410 L270 410 C268 375 265 345 260 330 Z" 
                    fill="hsl(142 76% 42%)"
                    opacity="0.5"
                  />

                  {/* Collar */}
                  <path d="M258 318 L270 345 L282 318" fill="white" />

                  {/* Left Arm with phone */}
                  <motion.g
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "240px 330px" }}
                  >
                    <path 
                      d="M240 330 C215 345 205 370 215 395 L235 388 C228 368 232 350 248 338" 
                      fill="hsl(142 76% 36%)"
                    />
                    {/* Hand */}
                    <ellipse cx={218} cy={398} rx={14} ry={12} fill="#e8b896" />
                    
                    {/* Phone */}
                    <motion.g
                      animate={{ rotate: [-2, 2, -2] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <rect x={200} y={365} width={35} height={60} rx={6} fill="#1a1a2e" />
                      <rect x={204} y={372} width={27} height={46} rx={3} fill="#2d2d44" />
                      {/* Phone screen glow */}
                      <motion.rect 
                        x={204} y={372} width={27} height={46} rx={3} 
                        fill="hsl(142 76% 50%)"
                        animate={{ opacity: [0.1, 0.3, 0.1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      {/* Chart on phone */}
                      <motion.path 
                        d="M208 405 L215 395 L222 400 L229 385" 
                        stroke="hsl(142 76% 50%)" 
                        strokeWidth="2" 
                        fill="none"
                        animate={{ 
                          d: [
                            "M208 405 L215 395 L222 400 L229 385",
                            "M208 400 L215 390 L222 395 L229 380",
                            "M208 405 L215 395 L222 400 L229 385"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.g>
                  </motion.g>

                  {/* Right Arm */}
                  <motion.g
                    animate={{ rotate: [3, -3, 3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "295px 330px" }}
                  >
                    <path 
                      d="M295 330 C320 345 328 365 322 390 L302 385 C306 368 302 352 290 340" 
                      fill="hsl(142 76% 36%)"
                    />
                    {/* Hand */}
                    <ellipse cx={320} cy={392} rx={12} ry={11} fill="#e8b896" />
                    {/* Pointing finger */}
                    <ellipse cx={332} cy={388} rx={8} ry={5} fill="#e8b896" transform="rotate(-20 332 388)" />
                  </motion.g>

                  {/* Neck */}
                  <rect x={260} y={290} width={20} height={35} fill="#e8b896" />

                  {/* Head */}
                  <ellipse cx={270} cy={255} rx={45} ry={50} fill="#e8b896" />

                  {/* Hair */}
                  <path 
                    d="M225 245 C220 200 245 175 270 175 C295 175 320 200 315 245 C315 225 300 200 270 200 C240 200 225 225 225 245 Z" 
                    fill="#1a1a2e"
                  />
                  
                  {/* Animated ponytail */}
                  <motion.path 
                    d="M315 235 C340 250 355 290 348 340"
                    stroke="#1a1a2e"
                    strokeWidth="20"
                    strokeLinecap="round"
                    fill="none"
                    animate={{ 
                      d: [
                        "M315 235 C340 250 355 290 348 340",
                        "M315 235 C345 255 365 300 355 350",
                        "M315 235 C335 245 350 285 345 335",
                        "M315 235 C340 250 355 290 348 340"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Face */}
                  {/* Eyes - blinking */}
                  <motion.g
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <ellipse cx={252} cy={250} rx={5} ry={6} fill="#1a1a2e" />
                    <ellipse cx={288} cy={250} rx={5} ry={6} fill="#1a1a2e" />
                    {/* Eye shine */}
                    <circle cx={254} cy={248} r={2} fill="white" />
                    <circle cx={290} cy={248} r={2} fill="white" />
                  </motion.g>

                  {/* Eyebrows */}
                  <path d="M243 238 Q252 234 261 238" stroke="#1a1a2e" strokeWidth="2" fill="none" />
                  <path d="M279 238 Q288 234 297 238" stroke="#1a1a2e" strokeWidth="2" fill="none" />

                  {/* Nose */}
                  <path d="M270 255 L268 268 L275 268" stroke="#d4a574" strokeWidth="2" fill="none" />

                  {/* Animated smile */}
                  <motion.path 
                    d="M255 280 Q270 295 285 280" 
                    stroke="#c47a7a" 
                    strokeWidth="3" 
                    fill="none" 
                    strokeLinecap="round"
                    animate={{
                      d: [
                        "M255 280 Q270 295 285 280",
                        "M255 282 Q270 300 285 282",
                        "M255 280 Q270 295 285 280"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />

                  {/* Blush */}
                  <motion.ellipse 
                    cx={242} cy={270} rx={10} ry={6} 
                    fill="#f5a5a5" 
                    opacity="0.4"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.ellipse 
                    cx={298} cy={270} rx={10} ry={6} 
                    fill="#f5a5a5" 
                    opacity="0.4"
                    animate={{ opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </motion.g>

                {/* Animated Plant */}
                <motion.g
                  animate={{ rotate: [-3, 3, -3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "440px 500px" }}
                >
                  {/* Pot */}
                  <path d="M415 470 L422 505 L458 505 L465 470 Z" fill="hsl(142 76% 30%)" />
                  <ellipse cx={440} cy={470} rx={27} ry={10} fill="hsl(142 76% 36%)" />
                  
                  {/* Stems */}
                  <motion.path 
                    d="M435 470 Q430 420 440 390" 
                    stroke="hsl(142 76% 35%)" 
                    strokeWidth="4" 
                    fill="none"
                    animate={{ d: ["M435 470 Q430 420 440 390", "M435 470 Q425 420 438 390", "M435 470 Q430 420 440 390"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.path 
                    d="M445 470 Q455 430 450 400" 
                    stroke="hsl(142 76% 35%)" 
                    strokeWidth="4" 
                    fill="none"
                    animate={{ d: ["M445 470 Q455 430 450 400", "M445 470 Q460 430 453 400", "M445 470 Q455 430 450 400"] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  {/* Animated Leaves */}
                  <motion.ellipse 
                    cx={440} cy={385} rx={18} ry={9} 
                    fill="hsl(142 76% 40%)"
                    animate={{ rotate: [-15, 15, -15], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    style={{ transformOrigin: "440px 390px" }}
                  />
                  <motion.ellipse 
                    cx={455} cy={400} rx={15} ry={8} 
                    fill="hsl(142 76% 45%)"
                    transform="rotate(40 455 400)"
                    animate={{ rotate: [35, 45, 35] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    style={{ transformOrigin: "455px 405px" }}
                  />
                  <motion.ellipse 
                    cx={425} cy={410} rx={12} ry={7} 
                    fill="hsl(142 76% 50%)"
                    transform="rotate(-30 425 410)"
                    animate={{ rotate: [-35, -25, -35] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    style={{ transformOrigin: "425px 415px" }}
                  />
                  
                  {/* Flower buds */}
                  <motion.circle 
                    cx={438} cy={380} r={6} 
                    fill="hsl(142 76% 60%)"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <motion.circle 
                    cx={452} cy={395} r={5} 
                    fill="hsl(142 76% 55%)"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                  />
                </motion.g>

                {/* Sparkle particles */}
                {[...Array(15)].map((_, i) => (
                  <motion.g key={`sparkle-${i}`}>
                    <motion.circle
                      cx={80 + Math.random() * 340}
                      cy={80 + Math.random() * 350}
                      r={2 + Math.random() * 3}
                      fill="hsl(142 76% 50%)"
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                      }}
                    />
                  </motion.g>
                ))}

                {/* Floating clouds */}
                <motion.g
                  animate={{ x: [-10, 10, -10] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ellipse cx={70} cy={180} rx={30} ry={12} fill="currentColor" className="text-muted-foreground/10" />
                  <ellipse cx={55} cy={175} rx={18} ry={10} fill="currentColor" className="text-muted-foreground/10" />
                  <ellipse cx={85} cy={175} rx={22} ry={10} fill="currentColor" className="text-muted-foreground/10" />
                </motion.g>

                <motion.g
                  animate={{ x: [10, -10, 10] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ellipse cx={380} cy={120} rx={35} ry={14} fill="currentColor" className="text-muted-foreground/10" />
                  <ellipse cx={360} cy={114} rx={20} ry={11} fill="currentColor" className="text-muted-foreground/10" />
                  <ellipse cx={400} cy={114} rx={25} ry={11} fill="currentColor" className="text-muted-foreground/10" />
                </motion.g>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
