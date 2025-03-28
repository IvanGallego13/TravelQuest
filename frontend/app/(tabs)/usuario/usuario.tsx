import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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

  return (
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
  );
}
