import { supabase } from '../config/supabase.js';

/**
 * Service to manage Sickle Cell Quiz Scores and history.
 */
export const quizService = {
  /**
   * Save a completed quiz score
   */
  async recordScore({ userId, quizTitle, category, score, totalQuestions, feedback }) {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const { data, error } = await supabase
      .from('quiz_scores')
      .insert([
        {
          user_id: userId,
          quiz_title: quizTitle || 'Sickle Cell Awareness & Genotype Quiz',
          category: category || 'General Knowledge',
          score,
          total_questions: totalQuestions,
          feedback: feedback || null
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a user's quiz score history
   */
  async getUserScores(userId) {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const { data, error } = await supabase
      .from('quiz_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch leaderboard rankings (highest percentage and score)
   */
  async getLeaderboard(limit = 10) {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const { data, error } = await supabase
      .from('quiz_leaderboard')
      .select('*')
      .limit(limit);

    if (error) {
      // Fallback if view hasn't been created yet
      const fallback = await supabase
        .from('quiz_scores')
        .select('id, quiz_title, score, total_questions, percentage, created_at')
        .order('score', { ascending: false })
        .limit(limit);
      return fallback.data || [];
    }

    return data;
  }
};
