import { supabase } from '../config/supabase.js';

/**
 * Registro de usuario con Supabase Auth
 */
export const register = async (req, res) => {
    try {
      const { email, password, username } = req.body;
  
      // 1. Registro con Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
  
      // 2. Login inmediato
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
  
      const userId = loginData.user.id;
  
      // 3. Guardar nombre de usuario en tabla `profiles`
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: userId, username }]); // ← Asegúrate de que `id` es FK al usuario
  
      if (profileError) throw profileError;
  
      // 4. Devolver token como siempre
      res.status(201).json({ token: loginData.session.access_token });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

/**
 * Inicio de sesión con Supabase Auth
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw error;
         // Asegurarse de que hay sesión válida
        if (!data.session) {
            return res.status(401).json({ error: "Sesión no válida" });
        }
        //Devolver token
        res.json({ token: data.session.access_token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Verificar sesión de usuario con token de Supabase
 */
export const getProfile = async (req, res) => {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
  
      // Obtener usuario desde Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) throw authError || new Error("Usuario no encontrado");
  
      const userId = authData.user.id;
  
      // Obtener el username desde la tabla 'profiles'
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
  
      if (profileError) throw profileError;
  
      // Devolver ambos
      res.json({
        user: authData.user,
        profile: {
          username: profileData.username,
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

/**
 * Cerrar sesión de usuario
 */
export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Sesión cerrada (token debe eliminarse en frontend)" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/**
 * Actualizar perfil
 */
export const updateProfile = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.updateUser({
            email,
            password
        });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
