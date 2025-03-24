import { useState } from "react";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Función para simular un login
  const login = async () => {
    // Aquí iría la lógica real de login
    setIsLoggedIn(true);
  };

  //función para simular registro
  const register = async () => {
    //aquí iria la lógica real de un registro
    setIsLoggedIn(true);
  }

  return {
    isLoggedIn,
    login,
    register,
  };
}

