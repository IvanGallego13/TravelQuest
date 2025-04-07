import { generateMission } from '../ia/generateMission.js';
import { supabase } from '../config/supabaseClient.js';
import { validateImageByLabels, getImageLabels } from '../utils/validateImage.js';


export const updateUserMissionStatus = async (req, res) => {
    try {
      const userId = req.user.id; // viene desde el token gracias a `authMiddleware`
      const missionId = parseInt(req.params.missionId);
      const { status, image_url, completed_at } = req.body;
  
      if (!["accepted", "completed", "discarded"].includes(status)) {
        return res.status(400).json({ message: "Estado no válido" });
      }
  
      // Buscar la misión del usuario
      const { data: existing, error: findError } = await supabase
        .from("user_missions")
        .select("*")
        .eq("user_id", userId)
        .eq("mission_id", missionId)
        .maybeSingle();
  
      if (findError) throw findError;
      if (!existing) {
        return res.status(404).json({ message: "Misión no asignada al usuario" });
      }
  
      const updateFields = {
        status,
      };
  
      if (image_url) updateFields.image_url = image_url;
      if (status === "completed" && completed_at) {
        updateFields.completed_at = completed_at;
      }
  
      const { error: updateError } = await supabase
        .from("user_missions")
        .update(updateFields)
        .eq("user_id", userId)
        .eq("mission_id", missionId);
  
      if (updateError) throw updateError;
  
      res.status(200).json({ message: "Misión actualizada correctamente" });
    } catch (error) {
      console.error("❌ Error al actualizar misión:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
/**
 * Genera y agrega una nueva misión para un usuario usando OpenAI
 */
export const generateNewMission = async (req, res) => {
    try {
        const { userId, cityId, difficulty } = req.body;
        
        if (!userId|| !cityId || !difficulty) {
            return res.status(400).json({ 
                message: 'El id usuario, la ciudad y la dificultad son requeridas' 
            });
        }

        // 1. Obtener nombre de ciudad
    const { data: cityData, error: cityError } = await supabase
    .from("cities")
    .select("name")
    .eq("id", cityId)
    .single();

  if (cityError || !cityData?.name) {
    return res.status(400).json({ message: "Ciudad no encontrada" });
  }

  const nombreCiudad = cityData.name;

  // 2. Buscar misiones existentes en esa ciudad y dificultad
  const { data: existingMissions, error: findError } = await supabase
    .from("missions")
    .select("*")
    .eq("city_id", cityId)
    .eq("difficulty", difficulty);

  if (findError) throw findError;

  let mission = null;

  // 3. Buscar una misión que el usuario aún no haya hecho
  if (existingMissions && existingMissions.length > 0) {
    for (const m of existingMissions) {
      const { data: relation, error: relationError } = await supabase
        .from("user_missions")
        .select("id")
        .eq("user_id", userId)
        .eq("mission_id", m.id)
        .not("status", "eq", "discarded")
        .maybeSingle();

      if (relationError) throw relationError;

      if (!relation) {
        mission = m; // primera misión que no haya hecho
        break;
      }
    }
  }

  // 4. Si no encontramos una misión disponible → generamos con IA
  if (!mission) {
    const iaResult = await generateMission(nombreCiudad, difficulty);

    const { data: newMission, error: createError } = await supabase
      .from("missions")
      .insert([
        {
          city_id: cityId,
          title: iaResult.titulo,
          description: iaResult.descripcion,
          difficulty: difficulty,
        },
      ])
      .select()
      .single();

    if (createError) throw createError;

    mission = newMission;
  }

  // 5. Asignamos la misión (ahora sí sabemos que es nueva para el usuario)
  const { error: assignError } = await supabase
    .from("user_missions")
    .insert([
      {
        user_id: userId,
        mission_id: mission.id,
      },
    ]);

  if (assignError) throw assignError;

  // 6. Devolvemos la misión generada
  res.status(201).json({
    id: mission.id,
    title: mission.title,
    description: mission.description,
    difficulty: mission.difficulty,
    city: nombreCiudad,
  });
} catch (error) {
  console.error("❌ Error al generar misión:", error.message);
  res.status(500).json({ message: "Error al generar misión", error: error.message });
}
};

/**
 * Agregar una nueva misión manualmente para un usuario
 */
export const addMission = async (req, res) => {
    const { id_usuario, descripcion_mision, ubicacion, dificultad } = req.body;

    // Validar que la dificultad sea válida
    if (!['facil', 'medio', 'dificil'].includes(dificultad)) {
        return res.status(400).json({
            message: 'La dificultad debe ser: facil, medio o dificil'
        });
    }

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .insert([{ 
            id_usuario, 
            descripcion_mision, 
            ubicacion, 
            dificultad,
            completada: false
        }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Misión creada correctamente', data });
};

/**
 * Obtener todas las misiones de un usuario
 */
export const getMissions = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_usuario', id_usuario)
        .order('fecha_generación', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Obtener una misión específica por ID
 */
export const getMissionById = async (req, res) => {
    const { id_historial_misiones } = req.params;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_historial_misiones', id_historial_misiones)
        .single();

    if (error) return res.status(404).json({ message: 'Misión no encontrada' });

    res.json(data);
};

/**
 * Actualizar una misión
 */
export const updateMission = async (req, res) => {
    const { id_historial_misiones } = req.params;
    const { descripcion_mision, ubicacion, dificultad, completada } = req.body;

    // Validar que la dificultad sea válida si se proporciona
    if (dificultad && !['facil', 'medio', 'dificil'].includes(dificultad)) {
        return res.status(400).json({
            message: 'La dificultad debe ser: facil, medio o dificil'
        });
    }

    const updateData = {};
    if (descripcion_mision) updateData.descripcion_mision = descripcion_mision;
    if (ubicacion) updateData.ubicacion = ubicacion;
    if (dificultad) updateData.dificultad = dificultad;
    if (typeof completada === 'boolean') updateData.completada = completada;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .update(updateData)
        .eq('id_historial_misiones', id_historial_misiones)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Misión actualizada correctamente', data });
};

/**
 * Actualizar el estado de completado de una misión
 */
export const updateMissionStatus = async (req, res) => {
    const { id_historial_misiones } = req.params;
    const { completada } = req.body;

    if (typeof completada !== 'boolean') {
        return res.status(400).json({
            message: 'El estado completada debe ser un valor booleano'
        });
    }

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .update({ completada })
        .eq('id_historial_misiones', id_historial_misiones)
        .eq('id_usuario', req.user.id) // Asegurar que la misión pertenece al usuario
        .select();

    if (error) {
        return res.status(404).json({ 
            message: 'Misión no encontrada o no tienes permiso para actualizarla' 
        });
    }

    res.json({
        message: 'Estado de la misión actualizado',
        data
    });
};

/**
 * Eliminar una misión
 */
export const deleteMission = async (req, res) => {
    const { id_historial_misiones } = req.params;

    const { error } = await supabase
        .from('Historial_Misiones')
        .delete()
        .eq('id_historial_misiones', id_historial_misiones);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Misión eliminada correctamente' });
};

export const validarImagenMission = async (req, res) => {
    try {
        const { misionId } = req.params;
        const { imageUrl } = req.body;
        const user_id = req.user.id;

        // Obtener la misión y sus keywords
        const { data: mision, error: misionError } = await supabase
            .from('misiones')
            .select('*')
            .eq('id', misionId)
            .single();

        if (misionError) throw misionError;

        // Validar la imagen
        const isValid = await validateImageByLabels(imageUrl, mision.keywords);

        if (isValid) {
            // Actualizar el estado de la misión
            const { error: updateError } = await supabase
                .from('misiones_usuarios')
                .update({ 
                    estado: 'completada',
                    imagen_url: imageUrl,
                    fecha_completada: new Date().toISOString()
                })
                .eq('mision_id', misionId)
                .eq('user_id', user_id);

            if (updateError) throw updateError;

            res.json({ 
                success: true, 
                message: 'Misión completada correctamente' 
            });
        } else {
            res.status(400).json({ 
                success: false, 
                message: 'La imagen no cumple con los requisitos de la misión' 
            });
        }
    } catch (error) {
        console.error('Error al validar imagen de misión:', error);
        res.status(500).json({ error: error.message });
    }
};
