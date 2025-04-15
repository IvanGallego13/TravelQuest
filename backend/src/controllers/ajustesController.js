import { supabase } from '../config/supabase.js';

/**
 * Obtener configuración del perfil
 */
export const obtenerAjustes = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({
      id: userId,
      profile: data,
    });
  } catch (error) {
    console.error('Error al obtener ajustes:', error.message);
    res.status(500).json({ error: 'Error al obtener ajustes del perfil' });
  }
};

/**
 * Actualizar configuración del perfil
 */
export const actualizarAjustes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, avatar } = req.body;

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        ...(avatar && { avatar }) // solo actualizar avatar si viene
      })
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error.message);
    res.status(500).json({ error: 'No se pudo actualizar el perfil' });
  }
};
export const cambiarContrasena = async (req, res) => {
  try {
    const userId = req.user.id;
    const { actual, nueva } = req.body;

    // Iniciar sesión de nuevo para verificar la contraseña actual
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: req.user.email,
      password: actual,
    });

    if (loginError) {
      return res.status(401).json({ error: "Contraseña actual incorrecta." });
    }

    // Si la contraseña actual es correcta, se actualiza
    const { data, error } = await supabase.auth.updateUser({ password: nueva });

    if (error) throw error;

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error.message);
    res.status(500).json({ error: "No se pudo cambiar la contraseña" });
  }
};
