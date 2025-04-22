import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from "uuid";

/**
 * Crea o añade una entrada al diario de viaje del usuario.
 * Lógica:
 * - Si el usuario ya tiene un viaje reciente en esa ciudad, se reutiliza
 * - Si no lo tiene, se crea uno nuevo
 * - Si no hay un día creado para la fecha de la entrada, se crea
 * - Luego se sube la imagen (si hay) y se crea la entrada del diario
 */
export const createOrAppendJournalEntry = async (req, res) => {
  console.log("llamada crear entrada");
    try {
      const userId = req.user.id;
      const { description, cityId, travelDate } = req.body;
      const imageFile = req.files?.image;
  
      if (!cityId || !travelDate) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
      }
  
      const entryDate = new Date(travelDate);

      // 1. Buscar si el usuario ya tiene un "travel_book" reciente en esa ciudad
      const { data: lastBook, error: bookError } = await supabase
        .from("travel_books")
        .select("*")
        .eq("user_id", userId)
        .eq("city_id", cityId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
  
      if (bookError) throw bookError;

      let travelBookId;
  
      // 2. Si hay uno reciente (menos de 2 días de diferencia), lo reutilizamos
      if (lastBook) {
        const lastDate = new Date(lastBook.created_at);
        const diffInDays = Math.floor(
          Math.abs(entryDate - lastDate) / (1000 * 60 * 60 * 24)
        );
        if (diffInDays <= 2) {
          travelBookId = lastBook.id;
        }
      }
  
      // 3. Si no hay viaje reciente, creamos uno nuevo
      if (!travelBookId) {
        const { data: newBook, error: newBookError } = await supabase
          .from("travel_books")
          .insert([{ user_id: userId, city_id: cityId }])
          .select()
          .single();
  
        if (newBookError) throw newBookError;
  
        travelBookId = newBook.id;
      }
  
      // 4. Buscar o crear el día de viaje correspondiente
      const { data: day, error: dayError } = await supabase
        .from("travel_days")
        .select("*")
        .eq("travel_book_id", travelBookId)
        .eq("travel_date", travelDate)
        .maybeSingle();
  
      if (dayError) throw dayError;

      let travelDayId;
  
      if (day) {
        travelDayId = day.id;
      } else {
        const { data: newDay, error: createDayError } = await supabase
          .from("travel_days")
          .insert([
            {
              travel_book_id: travelBookId,
              travel_date: travelDate,
            },
          ])
          .select()
          .single();
  
        if (createDayError) throw createDayError;
        travelDayId = newDay.id;
      }
  
      // 5. Subir la imagen si existe
      let filePath = null;
  
      if (imageFile) {
        const buffer = imageFile.data;
        const fileExt = imageFile.name.split(".").pop();
        filePath = `${userId}/${uuidv4()}.${fileExt}`;
  
        //5.1subir al bucket
        const { error: uploadError } = await supabase.storage
          .from("journal")
          .upload(filePath, buffer, {
            contentType: imageFile.mimetype,
          });
  
        if (uploadError) {
          console.error("❌ Error al subir imagen:", uploadError.message);
          throw uploadError;
        }else {
          console.log("✅ Imagen subida correctamente");
        }
      }    
      // 6. Crear la entrada del diario vinculada al día de viaje
      const { data: entry, error: entryError } = await supabase
        .from("diary_entries")
        .insert([
          {
            travel_day_id: travelDayId,
            //user_id: userId,
            description,
            image_path: filePath,
          },
        ])
        .select("*")
        .single();
  
      if (entryError) throw entryError;
      //Respuesta final
      res.status(201).json({
        message: "Entrada del diario guardada correctamente",
        entry,
        travel_day_id: travelDayId,
        travel_book_id: travelBookId,
      });
    } catch (error) {
      console.error("❌ Error creando entrada de diario:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  //obtener los viajes de un usuario
  export const getJournalSummary = async (req, res) => {
    console.log("llamada resumen de viajes");
    try {
      const userId = req.user.id;
  
      // 1. Obtener todos los días de viaje del usuario, agrupados por libro
      const { data, error } = await supabase
        .from("travel_books")
        .select(`
          id,
          city_id,
          cities ( name ),
          travel_days (
            id,
            travel_date,
            diary_entries (
              image_path,
              created_at
            )
          )
        `)
        .eq("user_id", userId);
  
      if (error) throw error;
  
      const summaries =  await Promise.all( data.map(async (book) => {
        const allDays = book.travel_days || [];
        const firstDay = allDays.sort(
          (a, b) => new Date(a.travel_date) - new Date(b.travel_date)
        )[0];
  
        let firstImage = null;
  
        // Buscar la primera imagen de todas las entradas
        for (const day of allDays) {
          const entries = day.diary_entries || [];
          const withImage = entries.find((e) => !!e.image_path);
          if (withImage) {
            firstImage = withImage.image_path;
            break;
          }
        }
        let signedImageUrl = null;

        if (firstImage) {
          const { data: signed, error: signError } = await supabase.storage
            .from("journal")
            .createSignedUrl(firstImage, 60 * 60);

          if (!signError && signed?.signedUrl) {
            signedImageUrl = signed.signedUrl;
          } else {
            console.warn("⚠️ No se pudo firmar imagen:", signError?.message);
          }
        }
        console.log("📷 Primera imagen encontrada:", firstImage);
        console.log("🔗 URL firmada:", signedImageUrl);
        return {
          id: book.id,
          city: book.cities?.name || "Unknown",
          date: firstDay?.travel_date || null,
          image: signedImageUrl,
        };
      })
    );
      console.log(summaries)
      res.json(summaries);
    } catch (error) {
      console.error("❌ Error en getJournalSummary:", error.message);
      res.status(500).json({ error: error.message });
    }
  };
  

/**
 * Agregar una entrada de diario
 */
export const addDiaryEntry = async (req, res) => {
    const { id_usuario, id_ciudad, titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .insert([{ id_usuario, id_ciudad, titulo, descripcion, fecha_viaje }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Diario creado correctamente', data });
};

/**
 * Obtener los diarios de un usuario
 */
// controllers/diarioController.js

export const getResumenDeViajes = async (req, res) => {
  try {
    const user_id = req.user.id;

    const { data: books, error } = await supabase
      .from('travel_books')
      .select(`
        id,
        created_at,
        cities(name),
        travel_days(
          diary_entries(
            image_path,
            created_at
          )
        )
      `)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const viajes = books.map(book => {
      const allEntries = book.travel_days?.flatMap(day => day.diary_entries || []) || [];
      const firstImage = allEntries
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]?.image_path;

      return {
        id: book.id,
        ciudad: book.cities?.name || "Sin nombre",
        fecha: book.created_at,
        imagen: firstImage || null,
      };
    });

    res.status(200).json(viajes);
  } catch (err) {
    console.error("❌ Error cargando resumen de viajes:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getUserDiary = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Diario')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Actualizar una entrada de diario
 */
export const updateDiaryEntry = async (req, res) => {
    const { id_diario } = req.params;
    const { titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .update({ titulo, descripcion, fecha_viaje })
        .eq('id_diario', id_diario)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Diario actualizado correctamente', data });
};

/**
 * Eliminar una entrada de diario
 */
export const deleteDiaryEntry = async (req, res) => {
    const { id_diario } = req.params;

    const { error } = await supabase
        .from('Diario')
        .delete()
        .eq('id_diario', id_diario);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Diario eliminado correctamente' });
};

// Crear una nueva entrada en el diario
export const createDiario = async (req, res) => {
    try {
        const { contenido, ciudad } = req.body;
        const user_id = req.user.id;
        let imagen_url = null;

        // Manejar la subida de imagen si existe
        if (req.files && req.files.imagen) {
            const file = req.files.imagen;
            const { data, error: uploadError } = await supabase.storage
                .from('diario-imagenes')
                .upload(`${user_id}/${Date.now()}-${file.name}`, file.data);

            if (uploadError) throw uploadError;
            imagen_url = data.path;
        }

        // Buscar o crear la localización
        let { data: localizacion, error: locError } = await supabase
            .from('diario_localizaciones')
            .select('id')
            .eq('nombre_ciudad', ciudad)
            .eq('user_id', user_id)
            .single();

        if (!localizacion) {
            const { data: nuevaLoc, error: createLocError } = await supabase
                .from('diario_localizaciones')
                .insert([{ nombre_ciudad: ciudad, user_id }])
                .select()
                .single();

            if (createLocError) throw createLocError;
            localizacion = nuevaLoc;
        }

        // Crear la entrada del diario
        const { data: entrada, error: entradaError } = await supabase
            .from('diario_entradas')
            .insert([{
                localizacion_id: localizacion.id,
                user_id,
                contenido,
                imagen_url
            }])
            .select(`
                *,
                diario_localizaciones (
                    nombre_ciudad
                )
            `)
            .single();

        if (entradaError) throw entradaError;

        res.status(201).json(entrada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las entradas del diario agrupadas por localización
export const getAllDiarios = async (req, res) => {
    try {
        const user_id = req.user.id;

        const { data: localizaciones, error: locError } = await supabase
            .from('diario_localizaciones')
            .select(`
                *,
                diario_entradas (
                    id,
                    contenido,
                    imagen_url,
                    fecha,
                    created_at
                )
            `)
            .eq('user_id', user_id)
            .order('created_at', { foreignTable: 'diario_entradas', ascending: false });

        if (locError) throw locError;

        res.json(localizaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener entradas por localización
export const getDiariosByLocation = async (req, res) => {
    try {
        const { ciudad } = req.params;
        const user_id = req.user.id;

        const { data, error } = await supabase
            .from('diario_localizaciones')
            .select(`
                *,
                diario_entradas (
                    id,
                    contenido,
                    imagen_url,
                    fecha,
                    created_at
                )
            `)
            .eq('nombre_ciudad', ciudad)
            .eq('user_id', user_id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una entrada del diario
export const updateDiario = async (req, res) => {
    try {
        const { id } = req.params;
        const { contenido } = req.body;
        const user_id = req.user.id;

        let updates = { contenido };

        // Actualizar imagen si se proporciona una nueva
        if (req.files && req.files.imagen) {
            const file = req.files.imagen;
            const { data, error: uploadError } = await supabase.storage
                .from('diario-imagenes')
                .upload(`${user_id}/${Date.now()}-${file.name}`, file.data);

            if (uploadError) throw uploadError;
            updates.imagen_url = data.path;
        }

        const { data, error } = await supabase
            .from('diario_entradas')
            .update(updates)
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una entrada del diario
export const deleteDiario = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const { error } = await supabase
            .from('diario_entradas')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
