import { supabase } from '../config/supabase.js';
import { checkAndAwardAchievements } from '../controllers/logroController.js';

// Obtener todos los viajes
export const getAllViajes = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('viajes')
      .select('*')
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un viaje específico
export const getViajeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('viajes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un nuevo viaje
export const createViaje = async (req, res) => {
  try {
    const { 
      destino, 
      fecha_inicio, 
      fecha_fin, 
      descripcion, 
      presupuesto,
      estado 
    } = req.body;

    const { data, error } = await supabase
      .from('viajes')
      .insert([
        {
          destino,
          fecha_inicio,
          fecha_fin,
          descripcion,
          presupuesto,
          estado,
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

// Actualizar un viaje
export const updateViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      destino, 
      fecha_inicio, 
      fecha_fin, 
      descripcion, 
      presupuesto,
      estado 
    } = req.body;

    const { data, error } = await supabase
      .from('viajes')
      .update({
        destino,
        fecha_inicio,
        fecha_fin,
        descripcion,
        presupuesto,
        estado
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Check if the trip is being marked as completed
    if (estado === 'completado') {
      // Award achievements for completing a trip
      await checkAndAwardAchievements(req.user.id, 'COMPLETE_TRIP');
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un viaje
export const deleteViaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('viajes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove this line that's causing the error
// await checkAndAwardAchievements(userId, 'COMPLETE_TRIP');