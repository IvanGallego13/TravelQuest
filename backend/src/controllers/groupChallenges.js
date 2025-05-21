// controllers/groupChallenges.js
import { supabase } from "../config/supabaseClient.js";
import { generateGroupMissions } from '../ia/generateGroupMissions.js';
import { updateUserLevel } from './userController.js';


export const createGroupChallenge = async (req, res) => {
  console.log("📥 Body recibido para reto grupal:", req.body);
  const userId = req.user?.id;
  const { title, description, is_solo } = req.body;

  if (!userId || !title) {
    return res.status(400).json({
      message: "Se requiere un título y un usuario autenticado.",
    });
  }

  try {
    // 1. Crear el reto con is_solo (por defecto false)
    const { data: challenge, error: challengeError } = await supabase
      .from("group_challenges")
      .insert({
        title,
        description,
        created_by: userId,
        is_solo: is_solo ?? false
      })
      .select()
      .single();

    if (challengeError) throw challengeError;

    // 2. Agregar al creador como primer (y único si es solo) miembro
    const { error: memberError } = await supabase
      .from("group_challenge_members")
      .insert({
        challenge_id: challenge.id,
        user_id: userId
      });

    if (memberError) throw memberError;

    res.status(201).json({
      challenge: {
        id: challenge.id,
        title: challenge.title,
        invite_code: challenge.invite_code,
        is_solo: challenge.is_solo,
        created_at: challenge.created_at
      }
    });
  } catch (error) {
    console.error("❌ Error al crear reto:", error.message);
    res.status(500).json({ message: "Error al crear reto", error: error.message });
  }
};


//POST /group-challenges/:id/generate-missions
export const generateMissionsForGroup = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = req.params.id;
  const { city_id, quantity } = req.body;

  console.log("🧠 Generar misiones IA para challenge:", challengeId);

  // 1. Validación básica
  if (!userId || !challengeId || !city_id || !quantity) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  try {
    // 2. Obtener nombre de ciudad
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("name")
      .eq("id", city_id)
      .single();

    if (cityError || !cityData?.name) {
      throw new Error("Ciudad no encontrada");
    }

    const cityName = cityData.name;

    // 3. Generar misiones usando IA (función que te pediré ahora)
    const generatedMissions = await generateGroupMissions(cityName, quantity);

    // 4. Insertar misiones en `missions`
    const { data: insertedMissions, error: insertError } = await supabase
      .from("missions")
      .insert(
        generatedMissions.map((m) => ({
          city_id,
          title: m.title,
          description: m.description,
          difficulty: m.difficulty
        }))
      )
      .select();

    if (insertError) throw insertError;

    // 5. Vincular misiones al reto en `group_challenge_missions`
    const relations = insertedMissions.map((m) => ({
      challenge_id: challengeId,
      mission_id: m.id
    }));

    const { error: linkError } = await supabase
      .from("group_challenge_missions")
      .insert(relations);

    if (linkError) throw linkError;

    res.status(201).json({ missions: insertedMissions });
  } catch (error) {
    console.error("❌ Error al generar misiones de grupo:", error.message);
    res.status(500).json({ message: "Error al generar misiones de grupo", error: error.message });
  }
};

export const joinGroupChallenge = async (req, res) => {
  const userId = req.user?.id;
  const { invite_code } = req.body;

  if (!userId || !invite_code) {
    return res.status(400).json({ message: "Faltan datos: código de invitación requerido" });
  }

  try {
    // 1. Buscar el reto con ese código
    const { data: challenge, error: findError } = await supabase
      .from("group_challenges")
      .select("id")
      .eq("invite_code", invite_code)
      .single();

    if (findError || !challenge) {
      return res.status(404).json({ message: "Reto no encontrado con ese código" });
    }

    // 2. Comprobar si ya es miembro
    const { data: existing, error: existError } = await supabase
      .from("group_challenge_members")
      .select("*")
      .eq("challenge_id", challenge.id)
      .eq("user_id", userId)
      .maybeSingle();

    if (existError) throw existError;

    if (existing) {
      return res.status(200).json({ message: "Ya eres parte de este reto", challenge_id: challenge.id });
    }

    // 3. Insertar como nuevo miembro
    const { error: insertError } = await supabase
      .from("group_challenge_members")
      .insert({
        challenge_id: challenge.id,
        user_id: userId
      });

    if (insertError) throw insertError;

    res.status(200).json({ message: "Te has unido al reto", challenge_id: challenge.id });
  } catch (error) {
    console.error("❌ Error al unirse al reto:", error.message);
    res.status(500).json({ message: "Error al unirse al reto", error: error.message });
  }
};

export const updateGroupMissionStatus = async (req, res) => {
  const userId = req.user?.id;
  const { challengeId, missionId } = req.params;
  const { status } = req.body;

  if (!userId || !challengeId || !missionId || !["assigned", "completed"].includes(status)) {
    return res.status(400).json({ message: "Datos inválidos o incompletos" });
  }

  try {
    // Ver si ya existe esta fila
    const { data: existing, error: findError } = await supabase
      .from("user_group_mission_status")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("mission_id", missionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (findError) throw findError;

    const updateFields = {
      status,
    };

    if (status === "completed") {
      updateFields.completed_at = new Date().toISOString();
    }

    if (existing) {
      // Actualizar
      const { error: updateError } = await supabase
        .from("user_group_mission_status")
        .update(updateFields)
        .eq("challenge_id", challengeId)
        .eq("mission_id", missionId)
        .eq("user_id", userId);

      if (updateError) throw updateError;
    } else {
      // Insertar nueva fila
      const { error: insertError } = await supabase
        .from("user_group_mission_status")
        .insert({
          challenge_id: challengeId,
          mission_id: missionId,
          user_id: userId,
          ...updateFields,
        });

      if (insertError) throw insertError;
    }

    // 🎯 Si completó la misión → dar puntos
    if (status === "completed") {
      await updateUserLevel(userId);

      // 1. Contar misiones totales del reto
      const { data: totalMissions, error: countError1 } = await supabase
        .from("group_challenge_missions")
        .select("mission_id", { count: "exact", head: true })
        .eq("challenge_id", challengeId);

      if (countError1) throw countError1;
      const total = totalMissions.count;

      // 2. Contar cuántas misiones han sido completadas por alguien
      const { data: completedMissions, error: countError2 } = await supabase
        .from("user_group_mission_status")
        .select("mission_id", { count: "exact", head: true })
        .eq("challenge_id", challengeId)
        .eq("status", "completed");

      if (countError2) throw countError2;
      const completadas = completedMissions.count;

      // 3. Si están todas, marcar reto como finalizado
      if (completadas >= total) {
        await supabase
          .from("group_challenges")
          .update({ completed_at: new Date().toISOString() })
          .eq("id", challengeId);

        console.log("🎉 Reto grupal completado");
      }
    }

    res.status(200).json({ message: `Estado actualizado a "${status}"` });
  } catch (error) {
    console.error("❌ Error al actualizar estado de misión grupal:", error.message);
    res.status(500).json({ message: "Error actualizando estado", error: error.message });
  }
};

export const getGroupChallengeMissions = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = req.params.id;

  if (!userId || !challengeId) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    // 1. Obtener misiones del reto
    const { data: missions, error: missionsError } = await supabase
      .from("group_challenge_missions")
      .select(`
        mission_id,
        missions (
          id,
          title,
          description,
          difficulty
        )
      `)
      .eq("challenge_id", challengeId);

    if (missionsError) throw missionsError;

    // 2. Obtener estados por usuario de esas misiones
    const { data: estados, error: estadosError } = await supabase
      .from("user_group_mission_status")
      .select("mission_id, user_id, status")
      .eq("challenge_id", challengeId);

    if (estadosError) throw estadosError;

    // 3. Unir misiones con su estado
    const enriched = missions.map((m) => {
      const estadosMision = estados.filter((e) => e.mission_id === m.mission_id);
      const completada = estadosMision.find((e) => e.status === "completed");
      const asignada = estadosMision.find((e) => e.status === "assigned");

      let estado = "available";
      let por = null;

      if (completada) {
        estado = "completed";
        por = completada.user_id;
      } else if (asignada) {
        estado = "assigned";
        por = asignada.user_id;
      }

      return {
        id: m.missions.id,
        title: m.missions.title,
        description: m.missions.description,
        difficulty: m.missions.difficulty,
        estado,
        user_id: por
      };
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.error("❌ Error al obtener misiones del reto:", error.message);
    res.status(500).json({ message: "Error al obtener misiones", error: error.message });
  }
};
