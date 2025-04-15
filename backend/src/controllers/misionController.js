import { generateMission } from '../ia/generateMission.js';
import { supabase } from '../config/supabaseClient.js';
import { validateImageByLabels, getImageLabels } from '../utils/validateImage.js';


export const updateUserMissionStatus = async (req, res) => {
  console.log("🔒 ID de usuario recibido en req.user.id:", req.user?.id);
  console.log("📦 Mission ID param:", req.params.missionId);
  console.log("📦 Body recibido:", req.body);

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
 * POST /api/misiones/generar
 * Genera y asigna una nueva misión al usuario
 */
export const generateNewMission = async (req, res) => {
  console.log("1 [generateNewMission] Body recibido:", req.body);

    try {
        const {cityId, difficulty } = req.body;
        const userId = req.user.id;
        
        if (!userId|| !cityId || !difficulty) {
            return res.status(400).json({ 
                message: 'El id usuario, la ciudad y la dificultad son requeridas' 
            });
        }
        const dificultadTexto = difficulty.toLowerCase();
        console.log("Dificultad interpretada:", dificultadTexto);

        const dificultadMap = {
          "facil": 1,
          "media": 3,
          "dificil": 5,
        };
    
        if (!dificultadMap[dificultadTexto]) {
          return res.status(400).json({ message: "Dificultad no válida. Usa: facil, media o dificil" });
        }
    
       const dificultadValor = dificultadMap[dificultadTexto];
    

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
        .eq("difficulty", dificultadValor);

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
         // 4.1 Obtener todas las misiones del usuario con sus nombre_objeto
        const { data: userMissions, error: userMissionsError } = await supabase
        .from("user_missions")
        .select("missions(nombre_objeto)")
        .eq("user_id", userId);

        if (userMissionsError) throw userMissionsError;

        // 4.2 Extraer lista de nombre_objeto, eliminando nulos o vacíos
        const objetosPrevios = userMissions
          .map(entry => entry.missions?.nombre_objeto)
          .filter(obj => !!obj);

        // 4.3 Generar misión con IA pasándole los objetos ya usados
        let iaResult;
        try{
          iaResult = await generateMission(nombreCiudad, difficulty, objetosPrevios);
          // Validar que la respuesta de la IA tenga todo lo necesario
          if (
            !iaResult.titulo ||
            !iaResult.descripcion ||
            !iaResult.nombre_objeto ||
            !Array.isArray(iaResult.keywords)
          ) 
          {
            throw new Error("La misión generada es incompleta o inválida.");
          }
          const { data: newMission, error: createError } = await supabase
            .from("missions")
            .insert([
              {
                city_id: cityId,
                title: iaResult.titulo,
                description: iaResult.descripcion,
                difficulty: dificultadValor,
                keywords: iaResult.keywords,
                nombre_objeto: iaResult.nombre_objeto,
              },
            ])
            .select()
            .single();

          if (createError) throw createError;

          mission = newMission;
          
        } catch (iaError) {
          console.error("❌ Error al generar misión con IA:", iaError.message);
          return res.status(500).json({
            message: "La IA no pudo generar una misión válida. Intenta de nuevo.",
          });
        }  
      }
      console.log("👤 Insertando misión con user_id:", userId);

      // 5. Asignamos la misión
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
 * GET /api/misiones/mias
 * Devuelve todas las misiones del usuario autenticado
 */
export const getMissionsForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("user_missions")
      .select(`
        mission_id,
        status,
        completed_at,
        image_url,
        missions (
          id,
          title,
          description,
          difficulty,
          created_at
        )
      `)
      .eq("user_id", userId);

    if (error) throw error;

    const missions = data.map((entry) => ({
      id: entry.missions.id,
      title: entry.missions.title,
      description: entry.missions.description,
      difficulty: entry.missions.difficulty,
      created_at: entry.missions.created_at,
      completed_at: entry.completed_at,
      status: entry.status,
      image_url: entry.image_url,
    }));

    res.json(missions);
  } catch (error) {
    console.error("❌ Error al obtener misiones:", error.message);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Agregar una nueva misión manualmente para un usuario(requiere de cambios)
 */
export const addMission = async (req, res) => {
    const { id_usuario, descripcion_mision, ubicacion, dificultad } = req.body;

    // Validar que la dificultad sea válida
    if (!['facil', 'media', 'dificil'].includes(dificultad)) {
        return res.status(400).json({
            message: 'La dificultad debe ser: facil, media o dificil'
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



export const validateMissionImage = async (req, res) => {
    try {
        const missionId = parseInt(req.params.missionId);
        const { image_url } = req.body;
        const user_id = req.user.id;

        if (!image_url) {
          return res.status(400).json({ message: "URL de imagen requerida" });
        }

        // Obtener la misión y sus keywords
        const { data: mission, error: missionError } = await supabase
            .from('missions')
            .select('*')
            .eq('id', missionId)
            .single();
        //descomentar para validación verdadera
        /*if (missionError) throw missionError;
        if (!mission?.keywords) {
          return res.status(400).json({ message: "La misión no tiene palabras clave para validar." });
        }
        // Validar la imagen
        const isValid = await validateImageByLabels(image_url, mission.keywords);*/
        //modo prueba valida siempre a true
        const isValid = true;

        if (!isValid) {
          return res.status(400).json({ valid: false, message: "La imagen no cumple con los requisitos de la misión" });
        }
    
        res.json({ valid: true, message: "Imagen válida" });
        
    } catch (error) {
        console.error('Error al validar imagen de misión:', error);
        res.status(500).json({ error: error.message });
    }
};
