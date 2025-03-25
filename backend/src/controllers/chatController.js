import { supabase } from '../config/supabase.js';

// Obtener todos los chats de un usuario
export const getChats = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un chat específico
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo chat
export const createChat = async (req, res) => {
  try {
    const { title, description } = req.body;
    const { data, error } = await supabase
      .from('chats')
      .insert([
        {
          title,
          description,
          user_id: req.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un chat
export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const { data, error } = await supabase
      .from('chats')
      .update({ title, description })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un chat
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('chats')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 