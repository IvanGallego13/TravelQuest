// backend/src/controllers/locationController.js
import { supabase } from "../../config/supabaseClient.js";
import axios from "axios";

// API Key de OpenCage (o Google Geocoding API)
const GEOCODING_API_KEY = "TU_API_KEY";
const GEOCODING_API_URL = "https://api.opencagedata.com/geocode/v1/json";

// 📌 Función para obtener ciudad a partir de coordenadas
export const getCityFromCoordinates = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Se requieren latitud y longitud." });
        }

        // Llamar a OpenCage API para obtener la ciudad
        const response = await axios.get(GEOCODING_API_URL, {
            params: {
                q: `${latitude},${longitude}`,
                key: GEOCODING_API_KEY,
                language: "es",
            },
        });

        const city = response.data.results[0]?.components?.city || "Ubicación desconocida";
        return res.json({ city });

    } catch (error) {
        console.error("Error obteniendo ciudad:", error);
        res.status(500).json({ error: "Error obteniendo la ubicación." });
    }
};

// 📌 Función para obtener info de una ciudad manualmente ingresada
export const getCityFromName = async (req, res) => {
    try {
        const { city } = req.body;

        if (!city) {
            return res.status(400).json({ error: "El nombre de la ciudad es requerido." });
        }

        // Buscar ciudad en la base de datos de Supabase
        const { data, error } = await supabase
            .from("cities")
            .select("*")
            .ilike("name", city) // Búsqueda sin distinguir mayúsculas/minúsculas
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: "Ciudad no encontrada." });

        return res.json(data);
    } catch (error) {
        console.error("Error buscando ciudad:", error);
        res.status(500).json({ error: "Error en el servidor." });
    }
};

// Guardar o actualizar la ubicación del usuario
export const saveUserLocation = async (req, res) => {
  const { user_id, city_id } = req.body;
  if (!user_id || !city_id) return res.status(400).json({ error: 'Faltan datos' });
  try {
    // Verificar si ya existe
    const { data: existing, error: findError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();
    if (findError) return res.status(500).json({ error: findError.message });
    if (existing) {
      // Actualizar
      const { data, error } = await supabase
        .from('user_locations')
        .update({ city_id, last_seen_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } else {
      // Insertar
      const { data, error } = await supabase
        .from('user_locations')
        .insert([{ user_id, city_id, last_seen_at: new Date().toISOString() }])
        .select()
        .single();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};