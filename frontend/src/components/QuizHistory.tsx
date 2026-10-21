import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { QuizScore } from '../types/database';
import { Award, Calendar, BarChart3, TrendingUp, RefreshCw, Layers } from 'lucide-react';

interface QuizHistoryProps {
  onTakeQuizClick: () => void;
}

export const QuizHistory: React.FC<QuizHistoryProps> = ({ onTakeQuizClick }) => {
  const { profile } = useAuth();
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScores = async () => {
    setLoading(true);
    if (!profile) {
      setScores([]);
      setLoading(false);
      return;
    }

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('quiz_scores')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setScores(data as QuizScore[]);
        }
      } catch (err) {
        console.error('Error fetching scores from Quiz_Scores table:', err);
      }
    } else {
      const raw = localStorage.getItem('sc_quiz_scores');
      if (raw) {
        try {
          const list: QuizScore[] = JSON.parse(raw);
          setScores(list.filter((item) => item.user_id === profile.id));
        } catch {
          setScores([]);
        }
      } else {
        setScores([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, [profile]);

  if (!profile) {
    return (
      <div className="w-full bg-surface-container-lowest rounded-3xl p-12 text-center text-on-surface-variant border border-surface-variant/40 flex flex-col items-center gap-3">
        <Award size={48} className="text-outline" />
        <h3 className="font-headline-sm text-lg font-bold text-on-surface">Sign In Required</h3>
        <p className="font-body-md text-sm">Please log in to view your Quiz_Scores records and score history.</p>
      </div>
    );
  }

  const totalTaken = scores.length;
  const averagePercentage = totalTaken > 0
    ? Math.round(scores.reduce((acc, curr) => acc + (curr.percentage || Math.round((curr.score / curr.total_questions) * 100)), 0) / totalTaken)
    : 0;
  const bestScore = totalTaken > 0
    ? Math.max(...scores.map((s) => s.percentage || Math.round((s.score / s.total_questions) * 100)))
    : 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header with stats and refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-xl sm:text-2xl text-on-surface font-bold">
            Assessment Performance Log
          </h2>
          <p className="font-body-sm text-xs sm:text-sm text-on-surface-variant">
            Track your completed knowledge assessments and scores over time.
          </p>
        </div>

        <button
          onClick={fetchScores}
          disabled={loading}
          className="h-11 px-4 rounded-full bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs font-bold flex items-center gap-2 border border-surface-variant/60 shadow-sm cursor-pointer self-start sm:self-auto"
          type="button"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Responsive Desktop Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-variant/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0">
            <Layers size={24} />
          </div>
          <div>
            <div className="font-headline-xl text-2xl sm:text-3xl font-black text-on-surface">{totalTaken}</div>
            <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Quizzes Completed</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-variant/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary-container/40 text-on-primary-container flex items-center justify-center shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <div className="font-headline-xl text-2xl sm:text-3xl font-black text-on-surface">{averagePercentage}%</div>
            <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Average Accuracy</div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-variant/40 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="font-headline-xl text-2xl sm:text-3xl font-black text-on-surface">{bestScore}%</div>
            <div className="font-label-sm text-xs text-on-surface-variant font-semibold">Highest Score</div>
          </div>
        </div>
      </div>

      {/* History Table or Empty State */}
      {scores.length === 0 ? (
        <div className="w-full bg-surface-container-lowest rounded-3xl p-12 text-center text-on-surface-variant border border-surface-variant/40 flex flex-col items-center gap-3">
          <Award size={48} className="text-outline" />
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">No Quizzes Logged Yet</h3>
          <p className="font-body-md text-sm max-w-md">
            Test your knowledge about sickle cell inheritance, carrier genetics, and pain crisis prevention to log your first score!
          </p>
          <button
            onClick={onTakeQuizClick}
            className="mt-2 h-12 px-6 rounded-full bg-primary-container text-on-surface font-label-lg text-sm font-bold shadow-md cursor-pointer"
            type="button"
          >
            Take First Quiz
          </button>
        </div>
      ) : (
        <div className="w-full bg-surface-container-lowest rounded-3xl shadow-[0_12px_32px_-4px_rgba(28,27,27,0.06)] border border-surface-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant/40 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                  <th className="py-4 px-6">Assessment Title</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6">Percentage</th>
                  <th className="py-4 px-6">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant/30">
                {scores.map((item) => {
                  const pct = item.percentage ?? Math.round((item.score / item.total_questions) * 100);
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-on-surface">{item.quiz_title}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface text-xs font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {item.score} / {item.total_questions}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          pct >= 80 ? 'bg-secondary-container text-on-secondary-container' : pct >= 60 ? 'bg-primary-container text-on-surface' : 'bg-error-container text-on-error-container'
                        }`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-on-surface-variant text-xs flex items-center gap-1.5 pt-5">
                        <Calendar size={14} />
                        <span>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
