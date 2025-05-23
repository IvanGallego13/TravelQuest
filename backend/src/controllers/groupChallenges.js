// controllers/groupChallenges.js
import { supabase } from "../config/supabaseClient.js";
import { generateGroupMissions } from '../ia/generateGroupMissions.js';
import { updateUserLevel } from './userController.js';




export const createOrAssignGroupChallenge = async (req, res) => {
  const userId = req.user?.id;
  const { city_id, quantity, is_solo } = req.body;

  if (!userId || !city_id || !quantity) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  try {
    // 1. Obtener todos los challenge_id de group_challenge_missions
    const { data: allRelations, error: relError } = await supabase
      .from("group_challenge_missions")
      .select("challenge_id");

    if (relError) throw relError;

    // 2. Contar cuántas misiones tiene cada challenge
    const counts = allRelations.reduce((acc, row) => {
      acc[row.challenge_id] = (acc[row.challenge_id] || 0) + 1;
      return acc;
    }, {});

    const matchingChallengeIds = Object.entries(counts)
      .filter(([_, count]) => count === quantity)
      .map(([id]) => id);

    // 3. Buscar retos activos reutilizables en esa ciudad y con la misma cantidad de misiones
    const { data: availableChallenges, error: findError } = await supabase
      .from("group_challenges")
      .select("id")
      .eq("is_solo", is_solo ?? false)
      .is("completed_at", null)
      .eq("city_id", city_id)
      .in("id", matchingChallengeIds);

    if (findError) throw findError;

    for (const ch of availableChallenges || []) {
      const { data: isMember, error: memberError } = await supabase
        .from("group_challenge_members")
        .select("challenge_id")
        .eq("user_id", userId)
        .eq("challenge_id", ch.id)
        .maybeSingle();

      if (memberError) throw memberError;
      if (!isMember) {
        await supabase
          .from("group_challenge_members")
          .insert({ challenge_id: ch.id, user_id: userId });

        return res.status(200).json({ challenge_id: ch.id, reused: true });
      }
    }

    // 4. Crear nuevo reto si no hay reutilizable
    const { data: cityData, error: cityError } = await supabase
      .from("cities")
      .select("name")
      .eq("id", city_id)
      .single();

    if (cityError || !cityData?.name) throw new Error("Ciudad no encontrada");

    //depurar
    console.log("🧭 Nombre de la ciudad:", cityData.name);
    console.log("🎯 Llamando a IA con", quantity, "misiones...");
    //depurar

    const { data: challenge, error: createError } = await supabase
      .from("group_challenges")
      .insert({
        title: `Reto de ${quantity} misiones`,
        description: "Explora la ciudad resolviendo estas misiones 🎯",
        created_by: userId,
        is_solo: is_solo ?? false,
        city_id: city_id,
      })
      .select()
      .single();

    if (createError) throw createError;

    await supabase
      .from("group_challenge_members")
      .insert({ challenge_id: challenge.id, user_id: userId });

    const generatedMissions = await generateGroupMissions(cityData.name, quantity);
    
    //depurar
    console.log("✅ Misiones generadas:", generatedMissions);
    //depurar

    const { data: insertedMissions, error: insertError } = await supabase
      .from("missions")
      .insert(
        generatedMissions.map((m) => ({
          city_id,
          title: m.title,
          description: m.description,
          difficulty: m.difficulty,
          keywords: m.keywords,
          nombre_objeto: m.nombre_objeto,
          historia: m.historia
        }))
      )
      .select();

    if (insertError) throw insertError;

    const relations = insertedMissions.map((m) => ({
      challenge_id: challenge.id,
      mission_id: m.id,
    }));

    const { error: linkError } = await supabase
      .from("group_challenge_missions")
      .insert(relations);

    if (linkError) throw linkError;

    return res.status(201).json({ challenge_id: challenge.id, reused: false });
  } catch (error) {
    console.error("❌ Error en createOrAssignGroupChallenge:", error.message);
    res.status(500).json({ message: "Error al generar o asignar reto", error: error.message });
  }
};

export const getGroupChallengeById = async (req, res) => {
  const userId = req.user?.id;
  const challengeId = req.params.id;

  if (!userId || !challengeId) {
    return res.status(400).json({ message: "Faltan datos requeridos" });
  }

  try {
    const { data: challenge, error } = await supabase
      .from("group_challenges")
      .select("*")
      .eq("id", challengeId)
      .maybeSingle();

    if (error) throw error;

    if (!challenge) {
      return res.status(404).json({ message: "Reto no encontrado" });
    }

    res.status(200).json({ challenge });
  } catch (err) {
    console.error("❌ Error en getGroupChallengeById:", err.message);
    res.status(500).json({ message: "Error interno", error: err.message });
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
//Actualizar el estado de las misiones y asignar puntos si completada
export const updateGroupMissionStatus = async (req, res) => {
  const userId = req.user?.id;
  const { challengeId, missionId } = req.params;
  const { status } = req.body;

  if (!userId || !challengeId || !missionId || !["assigned", "completed"].includes(status)) {
    return res.status(400).json({ message: "Datos inválidos o incompletos" });
  }

  try {
    // Ver si ya existe esta fila en user_group_mission_status
    const { data: existing, error: findError } = await supabase
      .from("user_group_mission_status")
      .select("*")
      .eq("challenge_id", challengeId)
      .eq("mission_id", missionId)
      .eq("user_id", userId)
      .maybeSingle();

    if (findError) throw findError;

    const updateFields = { status };

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

    if (status === "completed") {
      // 🎯 Sumar puntos y actualizar nivel
      await updateUserLevel(userId);

      // ✅ Insertar también en user_missions si no existe
      const { data: existingSolo, error: existSoloErr } = await supabase
        .from("user_missions")
        .select("id")
        .eq("mission_id", missionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (existSoloErr) throw existSoloErr;

      if (!existingSolo) {
        const { error: insertSoloError } = await supabase
          .from("user_missions")
          .insert({
            mission_id: missionId,
            user_id: userId,
            status: "completed",
            completed_at: new Date().toISOString(),
            source: "group", // opcional, por si luego quieres filtrar de dónde vino
          });

        if (insertSoloError) throw insertSoloError;
      }

      // ✅ Ver si todas las misiones del reto están completadas
      const { data: totalMissions, error: countError1 } = await supabase
        .from("group_challenge_missions")
        .select("mission_id", { count: "exact", head: true })
        .eq("challenge_id", challengeId);

      if (countError1) throw countError1;

      const { data: completedMissions, error: countError2 } = await supabase
        .from("user_group_mission_status")
        .select("mission_id", { count: "exact", head: true })
        .eq("challenge_id", challengeId)
        .eq("status", "completed");

      if (countError2) throw countError2;

      if (completedMissions.count >= totalMissions.count) {
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
export const getActiveGroupChallenge = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    // Buscar reto activo con last_active_at menor a 3 días
    const { data: challenge, error } = await supabase
      .from("group_challenges")
      .select(`
        id,
        title,
        description,
        created_at,
        completed_at,
        is_solo,
        invite_code
      `)
      .eq("completed_at", null)
      .in("id",
        supabase
          .from("group_challenge_members")
          .select("challenge_id")
          .eq("user_id", userId)
          .gte("last_active_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // últimos 3 días
      )
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!challenge) {
      return res.status(200).json(null); // no hay reto activo
    }

    res.status(200).json({ challenge });
  } catch (err) {
    console.error("❌ Error al buscar reto activo:", err.message);
    res.status(500).json({ message: "Error interno", error: err.message });
  }
};

export const deleteActiveGroupChallenge = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  try {
    // 1. Buscar el challenge activo del usuario (últimos 3 días)
    const { data: activeMembership, error: membershipError } = await supabase
      .from("group_challenge_members")
      .select("challenge_id")
      .eq("user_id", userId)
      .gte("last_active_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) // 3 días
      .limit(1)
      .maybeSingle();

    if (membershipError) throw membershipError;

    if (!activeMembership) {
      return res.status(404).json({ message: "No tienes retos activos" });
    }

    const challengeId = activeMembership.challenge_id;

    // 2. Eliminar al usuario del reto
    const { error: deleteError } = await supabase
      .from("group_challenge_members")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;

    // 3. ¿El reto se ha quedado sin miembros?
    const { data: members, error: countError } = await supabase
      .from("group_challenge_members")
      .select("user_id", { count: "exact", head: true })
      .eq("challenge_id", challengeId);

    if (countError) throw countError;

    const hasNoMembers = members?.count === 0;

    if (hasNoMembers) {
      // Borrar el reto y relaciones si ya no queda nadie
      await supabase.from("group_challenge_missions").delete().eq("challenge_id", challengeId);
      await supabase.from("group_challenges").delete().eq("id", challengeId);
      console.log(`🗑️ Reto ${challengeId} eliminado por quedar sin miembros`);
    }

    res.status(200).json({ message: "Reto eliminado correctamente" });
  } catch (err) {
    console.error("❌ Error al eliminar reto activo:", err.message);
    res.status(500).json({ message: "Error al eliminar reto activo", error: err.message });
  }
};
//quitat asignacion de una mision en un reto
export const unassignGroupMission = async (req, res) => {
  const userId = req.user?.id;
  const { challengeId, missionId } = req.params;

  if (!userId || !challengeId || !missionId) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    const { error: deleteError } = await supabase
      .from("user_group_mission_status")
      .delete()
      .eq("challenge_id", challengeId)
      .eq("mission_id", missionId)
      .eq("user_id", userId)
      .eq("status", "assigned"); // solo si estaba asignada

    if (deleteError) throw deleteError;

    res.status(200).json({ message: "Asignación eliminada correctamente" });
  } catch (error) {
    console.error("❌ Error al desasignar misión grupal:", error.message);
    res.status(500).json({ message: "Error al desasignar misión", error: error.message });
  }
};

