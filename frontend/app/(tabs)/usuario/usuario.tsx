import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";


// Simulación de datos del usuario
const logros = [
  { id: 1, nombre: "Logro 1", puntos: 50 },
  { id: 2, nombre: "Logro 2", puntos: 80 },
  { id: 3, nombre: "Logro 3", puntos: 100 },
];

const misiones = [
  { id: 1, nombre: "Misión 1", puntos: 60 },
  { id: 2, nombre: "Misión 2", puntos: 90 },
  { id: 3, nombre: "Misión 3", puntos: 70 },
];


/*const [logros, setLogros] = useState([]);
const [misiones, setMisiones] = useState([]);

useEffect(() => {
  const fetchDatos = async () => {
    const resLogros = await fetch("https://api.tuapp.com/usuario/logros");
    const resMisiones = await fetch("https://api.tuapp.com/usuario/misiones");
    const dataLogros = await resLogros.json();
    const dataMisiones = await resMisiones.json();
    setLogros(dataLogros);
    setMisiones(dataMisiones);
  };

  fetchDatos();
}, []);
*/

export default function Usuario() {
  // Cálculo de puntos
  const totalLogros = logros.reduce((acc, l) => acc + l.puntos, 0);
  const totalMisiones = misiones.reduce((acc, m) => acc + m.puntos, 0);
  const nivel = totalLogros + totalMisiones;
  const router = useRouter();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const { logout } = useAuth();

  return (
    <View className="flex-1 bg-[#F4EDE0] relative pt-10 px-4">
    {/* Botón de ajustes arriba a la derecha */}
    <View className="absolute top-10 right-4 z-10">
      <TouchableOpacity onPress={() => setMostrarMenu(!mostrarMenu)}>
        <Ionicons name="settings-outline" size={28} color="#699D81" />
      </TouchableOpacity>

      {/* Menú desplegable */}
      {mostrarMenu && (
  <View className="absolute top-14 right-4 bg-white rounded-xl border border-gray-300 shadow-md z-10 w-56">

    {/* Cabecera del menú */}
    <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
      <Ionicons name="settings-outline" size={20} color="#699D81" />
      <Text className="text-black font-semibold ml-2">Ajustes</Text>
    </View>

    {/* Opción: Editar perfil */}
    <TouchableOpacity
      onPress={() => {
        setMostrarMenu(false);
        router.push("/usuario/editar");
      }}
      className="flex-row items-center px-4 py-3 border-b border-gray-200"
    >
      <MaterialIcons name="edit" size={20} color="#000" />
      <Text className="text-black ml-2">Editar perfil</Text>
    </TouchableOpacity>

    {/* Opción: Cerrar sesión */}
    <TouchableOpacity
      onPress={() => {
        setMostrarMenu(false);
        logout();
      }}
      className="flex-row items-center px-4 py-3 border-b border-gray-200"
    >
      <Ionicons name="lock-closed-outline" size={20} color="#C76F40" />
      <Text className="text-[#C76F40] ml-2 font-semibold">Cerrar sesión</Text>
    </TouchableOpacity>

    {/* Opción: Sobre TravelQuest */}
    <TouchableOpacity
      onPress={() => {
        setMostrarMenu(false);
        router.push("/usuario/sobre"); // ⚠️ asegúrate de tener esta ruta
      }}
      className="flex-row items-center px-4 py-3"
    >
      <Ionicons name="information-circle-outline" size={20} color="#000" />
      <Text className="text-black ml-2">Sobre TravelQuest</Text>
    </TouchableOpacity>
  </View>
)}

    </View>
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 pt-10">
      {/* 📸 Avatar + Nivel + Ranking */}
      <View className="items-center mb-4">
        <Image
          source={require("@/assets/images/avatar.png")}
          className="w-24 h-24 rounded-full mb-2"
        />
        <Text className="text-black font-bold text-lg mb-2">Nivel {nivel}</Text>

        <TouchableOpacity
          onPress={() => router.push("../usuario/2ranking")}
          className="bg-[#699D81] px-4 py-2 rounded-xl"
        >
          <Text className="text-white font-semibold text-sm">Ver Ranking</Text>
        </TouchableOpacity>
      </View>

      {/* 🏅 Logros */}
      <Text className="text-black font-bold text-base mb-2 border-b border-black w-fit">
        Logros ({totalLogros} puntos)
      </Text>

      {logros.map((logro) => (
        <View
          key={logro.id}
          className="flex-row justify-between items-center bg-white p-3 mb-3 rounded-xl border-2 border-[#699D81]"
        >
          <View className="flex-row items-center space-x-2">
            <View className="w-6 h-6 rounded-full bg-[#C76F40]" />
            <Text className="text-black font-semibold">{logro.nombre}</Text>
          </View>
          <Text className="text-[#C76F40] font-bold">{logro.puntos} pts</Text>
        </View>
      ))}

      {/* ✅ Misiones resumen */}
      <Text className="text-black font-bold text-base mt-6 mb-2 border-b border-black w-fit">
        Misiones completadas ({totalMisiones} puntos)
      </Text>

      {/* 🔘 Botón para ir al historial de misiones */}
      <TouchableOpacity
        onPress={() => router.push("/misiones/misiones")}
        className="bg-[#C76F40] py-3 px-4 rounded-xl mb-4 w-full items-center"
      >
        <Text className="text-white font-semibold">Ver misiones completadas</Text>
      </TouchableOpacity>

      {/* 📊 Barra de progreso */}
      <View className="mb-10">
        <Text className="text-black font-semibold mb-1 text-sm">Progreso actual</Text>
        <View className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
          <View
            style={{ width: `${(totalMisiones / 300) * 100}%` }}
            className="h-4 bg-[#699D81]"
          />
        </View>
      </View>
    </ScrollView>
  </View>
  );
}
