import { supabase } from '../config/supabaseClient.js';

/**
 * Get global ranking of all users
 */
export const getGlobalRanking = async (req, res) => {
  try {
    console.log("📊 Fetching global ranking");
    
    // Get all users with their scores, ordered by score descending
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, score, avatar_url')
      .order('score', { ascending: false });
    
    if (error) {
      console.error("❌ Error fetching ranking:", error);
      throw error;
    }
    
    console.log(`✅ Retrieved ${data.length} users for ranking`);
    
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error in getGlobalRanking:", error);
    res.status(500).json({ 
      message: 'Error fetching global ranking',
      error: error.message 
    });
  }
};

/**
 * Get user's position in the global ranking
 */
export const getUserRankingPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all users ordered by score
    const { data, error } = await supabase
      .from('profiles')
      .select('id, score')
      .order('score', { ascending: false });
    
    if (error) throw error;
    
    // Find the user's position
    const position = data.findIndex(user => user.id === userId) + 1;
    
    res.status(200).json({ position });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user ranking position',
      error: error.message 
    });
  }
};