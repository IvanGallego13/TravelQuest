import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

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
  console.log("🧪 req.body:", req.body);
  console.log("🧪 req.files o req.file:", req.files || req.file);

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
        const buffer = fs.readFileSync(imageFile.tempFilePath);
        console.log("📦 Tamaño del buffer:", imageFile.data?.length);
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
          const folder = firstImage.split("/")[0]; // ID del usuario
          const filename = firstImage.split("/")[1];
        
          const { data: list, error: listError } = await supabase.storage
            .from("journal")
            .list(folder);
        
          console.log("📁 Archivos en carpeta:", folder, list?.map(f => f.name));
        
          const found = list?.find(file => file.name === filename);
        
          if (found) {
            const { data: signed, error: signError } = await supabase.storage
              .from("journal")
              .createSignedUrl(firstImage, 60 * 60);
        
            if (!signError && signed?.signedUrl) {
              signedImageUrl = signed.signedUrl;
            } else {
              console.warn("⚠️ No se pudo firmar imagen:", signError?.message);
            }
          } else {
            console.warn("⚠️ La imagen no se encontró en storage:", filename);
          }
        }

        /*if (firstImage) {
          const { data: signed, error: signError } = await supabase.storage
            .from("journal")
            .createSignedUrl(firstImage, 60 * 60);

          if (!signError && signed?.signedUrl) {
            signedImageUrl = signed.signedUrl;
          } else {
            console.warn("⚠️ No se pudo firmar imagen:", signError?.message);
          }
        }*/
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
  
  // GET /api/diarios/dias/:bookId
export const getTravelDaysByBook = async (req, res) => {
  console.log("📘 Book ID recibido:", req.params.bookId);
  console.log("🛡️ Usuario autenticado:", req.user?.id);
  const bookId = req.params.bookId;
  try {
    // 1. Obtener los días del travel_book con sus entradas
    const { data, error } = await supabase
      .from("travel_days")
      .select(`
        id,
        travel_date,
        diary_entries (
          image_path,
          created_at
        )
      `)
      .eq("travel_book_id", bookId)
      .order("travel_date", { ascending: true });

    if (error) throw error;

    // 2. Procesar días y extraer la primera imagen (si hay)
    const days = await Promise.all(
      data.map(async (day) => {
        const entries = day.diary_entries || [];
        const firstEntryWithImage = entries.find((entry) => entry.image_path);

        let signedUrl = null;

        if (firstEntryWithImage) {
          const { data: signed, error: signError } = await supabase.storage
            .from("journal")
            .createSignedUrl(firstEntryWithImage.image_path, 60 * 60); // 1h

          if (!signError && signed?.signedUrl) {
            signedUrl = signed.signedUrl;
          }
        }

        return {
          id: day.id,
          travel_date: day.travel_date,
          image: signedUrl,
        };
      })
    );

    return res.status(200).json(days);
  } catch (error) {
    console.error("❌ Error loading travel days:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
// GET /api/diarios/entradas/:dayId
export const getEntriesByDay = async (req, res) => {
  const dayId = req.params.dayId;
  const userId = req.user.id;

  console.log("📅 Buscando entradas para el día:", dayId);

  try {
    // Obtener entradas del día
    const { data: entries, error } = await supabase
      .from("diary_entries")
      .select("id, description, image_path, created_at")
      .eq("travel_day_id", dayId);

    if (error) throw error;

    // Firmar URLs de imagen si existen
    const signedEntries = await Promise.all(
      entries.map(async (entry) => {
        let signedUrl = null;

        if (entry.image_path) {
          const { data: signed, error: signError } = await supabase.storage
            .from("journal")
            .createSignedUrl(entry.image_path, 60 * 60);

          if (!signError && signed?.signedUrl) {
            signedUrl = signed.signedUrl;
          }
        }

        return {
          id: entry.id,
          description: entry.description,
          created_at: entry.created_at,
          image: signedUrl,
        };
      })
    );

    res.status(200).json(signedEntries);
  } catch (err) {
    console.error("❌ Error al obtener entradas del día:", err.message);
    res.status(500).json({ error: err.message });
  }
};

