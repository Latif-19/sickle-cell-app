import { supabase, supabaseAdmin } from '../config/supabase.js';

/**
 * Service to manage User profiles and sickle cell genotypes.
 */
export const userService = {
  /**
   * Fetch a user profile by ID
   */
  async getUserById(userId) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a user's profile details including genotype
   */
  async updateUserProfile(userId, { name, genotype, bio, avatar_url }) {
    if (!supabase) throw new Error('Supabase client is not configured.');
    const { data, error } = await supabase
      .from('users')
      .update({
        name,
        genotype,
        bio,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * List users by genotype (for health statistics / awareness analysis)
   */
  async getUsersByGenotype(genotype) {
    if (!supabaseAdmin) throw new Error('Supabase admin client is not configured.');
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, genotype, created_at')
      .eq('genotype', genotype);

    if (error) throw error;
    return data;
  }
};
