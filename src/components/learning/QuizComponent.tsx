"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Trophy, ArrowRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitQuizResult } from "@/app/actions/courses";

interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  topic: string;
}

interface QuizComponentProps {
  quizId: string;
  courseId: string;
  questions: Question[];
  xpReward: number;
  coinReward: number;
}

export function QuizComponent({ quizId, courseId, questions, xpReward, coinReward }: QuizComponentProps) {
  const router = useRouter();
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const question = questions[currentQ];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === question.correctAnswer) {
      setScore(s => s + 1);
    } else {
      if (!weakTopics.includes(question.topic)) {
        setWeakTopics(prev => [...prev, question.topic]);
      }
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    setIsSubmitting(true);
    try {
      const finalScorePercent = Math.round((score / questions.length) * 100);
      await submitQuizResult(courseId, quizId, finalScorePercent, weakTopics, xpReward, coinReward);
    } catch (error) {
      console.error("Failed to submit quiz result:", error);
    }
    setIsSubmitting(false);
  };

  const retryQuiz = () => {
    setCurrentQ(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setWeakTopics([]);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= 60;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 md:p-12 border-2 border-border shadow-xl text-center max-w-2xl mx-auto"
      >
        <Trophy className={`w-24 h-24 mx-auto mb-6 ${passed ? 'text-yellow-500' : 'text-slate-400'}`} />
        <h2 className="text-4xl font-black mb-2 text-foreground">
          {passed ? "Amazing Job!" : "Good Try!"}
        </h2>
        <p className="text-xl text-text-secondary font-medium mb-8">
          You scored {score} out of {questions.length} ({percentage}%)
        </p>

        {passed && (
          <div className="flex justify-center gap-6 mb-8">
            <div className="bg-purple-100 border-2 border-purple-200 rounded-2xl p-4 min-w-[120px]">
              <div className="text-purple-600 font-black text-2xl">+{xpReward}</div>
              <div className="text-purple-800 font-bold text-sm">XP Earned</div>
            </div>
            <div className="bg-yellow-100 border-2 border-yellow-200 rounded-2xl p-4 min-w-[120px]">
              <div className="text-yellow-600 font-black text-2xl">+{coinReward}</div>
              <div className="text-yellow-800 font-bold text-sm">Coins Earned</div>
            </div>
          </div>
        )}

        {!passed && weakTopics.length > 0 && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 font-medium">
            Looks like you struggled a bit with: <span className="font-bold">{weakTopics.join(', ')}</span>. 
            We recommend reviewing the lesson before moving on!
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button 
            onClick={retryQuiz}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-8 rounded-xl transition-colors disabled:opacity-50"
          >
            <RotateCcw size={20} /> Try Again
          </button>
          <button 
            onClick={() => router.push('/dashboard/student')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-md disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Return to Dashboard"} <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-bold text-text-secondary mb-2">
          <span>Question {currentQ + 1} of {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div 
            className="bg-primary h-3 rounded-full transition-all duration-500"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl p-6 md:p-10 border-2 border-border shadow-md"
        >
          <h3 className="text-2xl font-black text-foreground mb-8 leading-snug">
            {question.questionText}
          </h3>

          <div className="space-y-3">
            {question.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === question.correctAnswer;
              
              let btnClass = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300";
              
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = "bg-green-100 border-green-500 text-green-800";
                } else if (isSelected) {
                  btnClass = "bg-red-100 border-red-500 text-red-800";
                } else {
                  btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-lg transition-all flex justify-between items-center ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="text-green-500" />}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="text-red-500" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 flex justify-end"
            >
              <button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
              >
                {currentQ < questions.length - 1 ? "Next Question" : "Finish Quiz"} <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
