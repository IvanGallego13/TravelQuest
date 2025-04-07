import { getUserFromToken } from "../auth.js"; // o ajusta si lo tienes en otro path

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"

    const user = await getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ error: "Token inválido" });
    }

    req.user = user; // ✅ ¡Ya tienes el user disponible en todos tus controladores!
    next();
  } catch (error) {
    console.error("❌ Error en authMiddleware:", error.message);
    res.status(500).json({ error: "Error interno de autenticación" });
  }
};
