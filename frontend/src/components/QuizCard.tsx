import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SAMPLE_QUESTIONS } from '../data/sampleQuestions';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award, Check, CloudUpload } from 'lucide-react';
import type { QuizScore } from '../types/database';

interface QuizCardProps {
  onQuizCompleted?: () => void;
  openAuthModal: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ onQuizCompleted, openAuthModal }) => {
  const { profile } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submittingToDb, setSubmittingToDb] = useState(false);
  const [dbSuccessMessage, setDbSuccessMessage] = useState<string | null>(null);

  const currentQ = SAMPLE_QUESTIONS[currentQuestionIndex];
  const totalQuestions = SAMPLE_QUESTIONS.length;

  const handleSelectOption = (idx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);

    if (currentQuestionIndex + 1 < totalQuestions) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      submitScoreToDatabase(score + (selectedAnswer === currentQ.correctAnswer ? 0 : 0));
    }
  };

  const submitScoreToDatabase = async (finalScore: number) => {
    if (!profile) return;
    setSubmittingToDb(true);

    const feedbackText =
      finalScore === totalQuestions
        ? 'Outstanding knowledge! You understand sickle cell genotypes and genetics thoroughly.'
        : finalScore >= totalQuestions / 2
        ? 'Good understanding! Review trait genetics and crisis prevention tips to boost your knowledge.'
        : 'Keep learning! Understanding genotype compatibility is essential for protecting future generations.';

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('quiz_scores').insert([
          {
            user_id: profile.id,
            quiz_title: 'Sickle Cell Awareness & Genotype Quiz',
            category: 'Genetics & Care',
            score: finalScore,
            total_questions: totalQuestions,
            feedback: feedbackText
          }
        ]);

        if (error) {
          console.error('Error saving score to Quiz_Scores table:', error);
          setDbSuccessMessage(`Note: Could not save record: ${error.message}`);
        } else {
          setDbSuccessMessage('Score successfully saved to your profile history!');
        }
      } catch (err: any) {
        setDbSuccessMessage(`Error: ${err.message}`);
      }
    } else {
      const existing: QuizScore[] = JSON.parse(localStorage.getItem('sc_quiz_scores') || '[]');
      const newRecord: QuizScore = {
        id: `quiz-${Date.now()}`,
        user_id: profile.id,
        quiz_title: 'Sickle Cell Awareness & Genotype Quiz',
        category: 'Genetics & Care',
        score: finalScore,
        total_questions: totalQuestions,
        percentage: Math.round((finalScore / totalQuestions) * 100),
        feedback: feedbackText,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('sc_quiz_scores', JSON.stringify([newRecord, ...existing]));
      setDbSuccessMessage('Score saved locally!');
    }

    setSubmittingToDb(false);
    if (onQuizCompleted) onQuizCompleted();
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsFinished(false);
    setDbSuccessMessage(null);
  };

  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="w-full bg-surface-container-lowest rounded-3xl p-8 sm:p-12 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-container/40 flex items-center justify-center text-on-surface shadow-sm">
          <Award size={44} className="text-on-primary-container" />
        </div>

        <div>
          <h2 className="font-headline-xl text-3xl sm:text-4xl text-on-surface font-black">
            Quiz Completed!
          </h2>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            Sickle Cell Awareness & Genotype Assessment
          </p>
        </div>

        <div className="flex flex-col items-center my-2">
          <div className="flex items-baseline gap-2">
            <span className="font-data-display text-5xl sm:text-6xl font-black text-on-surface">{score}</span>
            <span className="text-xl sm:text-2xl font-bold text-on-surface-variant">/ {totalQuestions}</span>
          </div>
          <span className="font-headline-md text-lg text-primary font-bold mt-1">
            {percentage}% Overall Mastery
          </span>
        </div>

        <div className="max-w-xl p-4 rounded-2xl bg-surface-container-low border border-surface-variant/30 text-sm leading-relaxed text-on-surface-variant">
          {percentage >= 80 ? (
            <p className="font-semibold text-secondary">🌟 Outstanding! You have deep mastery of sickle cell genetics and health precautions.</p>
          ) : percentage >= 60 ? (
            <p className="font-semibold text-on-primary-container">👍 Good job! You have solid foundational knowledge about genotype risks and care.</p>
          ) : (
            <p className="font-semibold text-error">💡 Great effort! Explore our Education & FAQs section to strengthen your awareness.</p>
          )}
        </div>

        {/* Supabase sync notice */}
        <div className="w-full max-w-xl p-4 rounded-2xl bg-surface-container border border-surface-variant/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container/50 text-on-surface flex items-center justify-center shrink-0">
              <CloudUpload size={20} />
            </div>
            <div className="text-xs">
              <strong className="block text-on-surface font-bold">Progress Saved</strong>
              <span className="text-on-surface-variant">
                {profile ? (submittingToDb ? 'Saving score...' : dbSuccessMessage || 'Saved to your quiz history.') : 'Sign in to track your scores over time.'}
              </span>
            </div>
          </div>
          {!profile && (
            <button
              onClick={openAuthModal}
              className="px-4 py-2 rounded-full bg-primary-container text-on-surface font-label-md text-xs font-bold shrink-0 cursor-pointer"
            >
              Sign In to Save
            </button>
          )}
        </div>

        <button
          onClick={restartQuiz}
          className="h-13 px-8 rounded-full bg-inverse-surface text-surface font-headline-sm text-sm flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer font-bold mt-2"
          type="button"
        >
          <RotateCcw size={18} />
          <span>Retake Assessment</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-10 shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 flex flex-col gap-6">
      {/* Progress Track */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant">
          <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container uppercase tracking-wider text-[11px]">
            Sickle Cell Knowledge Assessment
          </span>
          <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
        </div>
        <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-container rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Text */}
      <h3 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-bold leading-snug">
        {currentQ.question}
      </h3>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrect = idx === currentQ.correctAnswer;

          let btnClasses = 'w-full p-4 sm:p-5 rounded-2xl border text-left flex items-center justify-between gap-4 transition-all cursor-pointer ';
          if (!isAnswerSubmitted) {
            btnClasses += isSelected
              ? 'bg-primary-container/20 border-primary-container shadow-sm font-bold'
              : 'bg-surface-container-lowest border-surface-variant/60 hover:bg-surface-container-low';
          } else {
            if (isCorrect) {
              btnClasses += 'bg-secondary-container/40 border-secondary text-on-secondary-container font-bold';
            } else if (isSelected) {
              btnClasses += 'bg-error-container/30 border-error text-error font-bold';
            } else {
              btnClasses += 'opacity-50 border-surface-variant/40';
            }
          }

          return (
            <button
              key={idx}
              className={btnClasses}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswerSubmitted}
              type="button"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                  isSelected ? 'bg-inverse-surface text-surface' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="font-body-md text-sm sm:text-base text-on-surface">{option}</span>
              </div>

              {isAnswerSubmitted && isCorrect && (
                <CheckCircle2 size={22} className="text-secondary shrink-0" />
              )}
              {isAnswerSubmitted && isSelected && !isCorrect && (
                <XCircle size={22} className="text-error shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Banner */}
      {isAnswerSubmitted && (
        <div className={`p-5 rounded-2xl border flex flex-col gap-1 text-sm leading-relaxed ${
          selectedAnswer === currentQ.correctAnswer
            ? 'bg-secondary-container/30 border-secondary/30 text-on-secondary-container'
            : 'bg-error-container/20 border-error/20 text-on-surface'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            {selectedAnswer === currentQ.correctAnswer ? (
              <>
                <Check size={18} className="text-secondary" />
                <span>Correct Answer</span>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-error" />
                <span className="text-error">Incorrect</span>
              </>
            )}
          </div>
          <p className="mt-1 text-on-surface-variant">{currentQ.explanation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end pt-2">
        {!isAnswerSubmitted ? (
          <button
            onClick={handleConfirmAnswer}
            disabled={selectedAnswer === null}
            className="h-13 px-8 rounded-full bg-primary-container text-on-surface font-headline-sm text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-105 active:scale-95 transition-all cursor-pointer shadow-md"
            type="button"
          >
            Confirm Answer
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="h-13 px-8 rounded-full bg-inverse-surface text-surface font-headline-sm text-sm font-bold flex items-center gap-2 hover:bg-inverse-surface/90 active:scale-95 transition-all cursor-pointer shadow-md"
            type="button"
          >
            <span>{currentQuestionIndex + 1 === totalQuestions ? 'Finish & Log Score' : 'Next Question'}</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
