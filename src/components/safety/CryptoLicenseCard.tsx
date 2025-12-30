import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, 
  Unlock, 
  Shield, 
  CheckCircle, 
  Circle,
  Award,
  BookOpen,
  Target,
  Clock,
  ChevronRight,
  AlertTriangle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CryptoLicense, LicenseRequirement, LearningQuiz } from "@/store/safetyStore";

interface CryptoLicenseCardProps {
  license: CryptoLicense;
  onStartQuiz?: () => void;
  onViewRequirements?: () => void;
}

interface LicenseQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: LearningQuiz | null;
  onComplete: (correct: boolean) => void;
}

const getRequirementIcon = (type: string) => {
  switch (type) {
    case "paper_trades": return Target;
    case "risk_score": return Shield;
    case "quiz": return BookOpen;
    case "hold_time": return Clock;
    case "no_panic_sells": return CheckCircle;
    default: return Circle;
  }
};

const getTierColor = (tier: number) => {
  switch (tier) {
    case 0: return "from-gray-500 to-gray-600";
    case 1: return "from-emerald-500 to-green-500";
    case 2: return "from-blue-500 to-cyan-500";
    case 3: return "from-violet-500 to-purple-500";
    default: return "from-gray-500 to-gray-600";
  }
};

const getTierLabel = (tier: number) => {
  switch (tier) {
    case 0: return "Locked";
    case 1: return "Basic";
    case 2: return "Intermediate";
    case 3: return "Full Access";
    default: return "Unknown";
  }
};

export const LicenseQuizModal = ({ isOpen, onClose, quiz, onComplete }: LicenseQuizModalProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  if (!quiz) return null;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    const correct = selectedAnswer === quiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleClose = () => {
    onComplete(isCorrect);
    setSelectedAnswer(null);
    setShowResult(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-primary to-violet-500">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <div>
                  <h3 className="font-heading font-bold text-white">
                    {quiz.asset} Knowledge Quiz
                  </h3>
                  <p className="text-white/80 text-sm capitalize">
                    {quiz.difficulty} difficulty
                  </p>
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="p-6">
              {!showResult ? (
                <>
                  <p className="font-medium text-lg mb-4">{quiz.question}</p>
                  <div className="space-y-2">
                    {quiz.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedAnswer(index)}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          selectedAnswer === index
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedAnswer === index
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}>
                            {selectedAnswer === index && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={handleSubmit}
                    disabled={selectedAnswer === null}
                  >
                    Submit Answer
                  </Button>
                </>
              ) : (
                <div className="text-center">
                  <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-4 ${
                    isCorrect ? "bg-emerald-500/20" : "bg-red-500/20"
                  }`}>
                    {isCorrect ? (
                      <CheckCircle className="w-10 h-10 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    )}
                  </div>
                  <h4 className={`text-xl font-bold mb-2 ${
                    isCorrect ? "text-emerald-500" : "text-red-500"
                  }`}>
                    {isCorrect ? "Correct!" : "Not Quite"}
                  </h4>
                  <p className="text-muted-foreground mb-4">
                    {quiz.explanation}
                  </p>
                  <Button onClick={handleClose} className="w-full">
                    {isCorrect ? "Continue" : "Try Again Later"}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CryptoLicenseCard = ({ license, onStartQuiz, onViewRequirements }: CryptoLicenseCardProps) => {
  const completedRequirements = license.requirements.filter(r => r.completed).length;
  const totalRequirements = license.requirements.length;
  const progress = totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className={`px-4 py-3 bg-gradient-to-r ${getTierColor(license.tier)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {license.unlocked ? (
              <Unlock className="w-5 h-5 text-white" />
            ) : (
              <Lock className="w-5 h-5 text-white" />
            )}
            <div>
              <h4 className="font-semibold text-white">{license.asset}</h4>
              <p className="text-white/80 text-xs">{getTierLabel(license.tier)}</p>
            </div>
          </div>
          {license.unlocked && (
            <Award className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {license.unlocked ? (
          <div className="flex items-center gap-2 text-emerald-500">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Trading Unlocked</span>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{completedRequirements}/{totalRequirements}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full"
                />
              </div>
            </div>

            {/* Requirements Preview */}
            <div className="space-y-2">
              {license.requirements.slice(0, 2).map((req) => {
                const Icon = getRequirementIcon(req.type);
                return (
                  <div
                    key={req.id}
                    className={`flex items-center gap-2 text-sm ${
                      req.completed ? "text-emerald-500" : "text-muted-foreground"
                    }`}
                  >
                    {req.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                    <span className="truncate">{req.label}</span>
                  </div>
                );
              })}
              {license.requirements.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{license.requirements.length - 2} more requirements
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              {license.requirements.find(r => r.type === "quiz" && !r.completed) && (
                <Button size="sm" variant="outline" onClick={onStartQuiz} className="flex-1">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Take Quiz
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={onViewRequirements} className="flex-1">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

// License Grid Component
export const CryptoLicenseGrid = ({ 
  licenses, 
  onStartQuiz,
  onViewRequirements 
}: { 
  licenses: Record<string, CryptoLicense>;
  onStartQuiz?: (asset: string) => void;
  onViewRequirements?: (asset: string) => void;
}) => {
  const licenseList = Object.values(licenses);

  if (licenseList.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-heading font-semibold text-lg mb-2">
          Crypto License System
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Unlock permission to trade different assets by completing milestones and demonstrating responsible trading behavior.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg">
            Crypto Licenses
          </h3>
          <p className="text-sm text-muted-foreground">
            Unlock assets by completing requirements
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
          <Sparkles className="w-4 h-4" />
          <span>{licenseList.filter(l => l.unlocked).length} unlocked</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {licenseList.map((license) => (
          <CryptoLicenseCard
            key={license.asset}
            license={license}
            onStartQuiz={() => onStartQuiz?.(license.asset)}
            onViewRequirements={() => onViewRequirements?.(license.asset)}
          />
        ))}
      </div>
    </div>
  );
};

export default CryptoLicenseCard;

