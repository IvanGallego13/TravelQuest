import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, ImageBackground} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // Íconos decorativos
import {useState,  useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch } from "../../../lib/api";

// Tipo Día para simular mejor la estructura real
type TravelDay = {
  id: number;
  travel_date: string;
  image?: string | null;
};

export default function CityDetail() {
  const router = useRouter();
  const { bookId, city, image } = useLocalSearchParams();

  const [days, setDays] = useState<TravelDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar días cada vez que se entra en esta pantalla (tab focus)
  useFocusEffect(
    useCallback(() => {
      const loadDays = async () => {
        try {
          setLoading(true);
          const res = await apiFetch(`/diarios/dias/${bookId}`);
          if (!res.ok) throw new Error("Failed to fetch travel days");
          const data = await res.json();
          setDays(data);
        } catch (err) {
          console.error("❌ Error loading days:", err);
        } finally {
          setLoading(false);
        }
      };

      loadDays();
    }, [bookId])
  );

  // Navegar al detalle del día
  const handleViewDay = (dayId: string) => {
    router.push({
      pathname: "/diario/3dia",
      params: {
        idDay: dayId,
        bookId: bookId?.toString(),
        city: city?.toString(),
        image: image?.toString(),
      },
    });
  };
   return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-14 justify-start">

        {/* Flecha volver */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-10 left-4 z-10 bg-white/70 rounded-full p-2 shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Encabezado ciudad */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-6 flex-row items-center gap-2">
          <Text className="text-black text-lg font-semibold">{city}</Text>
          <Text className="text-black text-xl">🏙️</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {/* Tarjeta de días de viaje */}
          <View className="bg-white/80 p-4 rounded-2xl shadow-md">
            <Text className="text-black font-bold text-base mb-4">Días del viaje ({days.length})</Text>

            {loading ? (
              <ActivityIndicator size="large" color="#699D81" />
            ) : (
              days.map((day) => {
                const formattedDate = day.travel_date
                  ? new Date(`${day.travel_date}T00:00:00Z`).toLocaleDateString("es-ES")
                  : "Fecha no disponible";

                return (
                  <TouchableOpacity
                    key={day.id}
                    onPress={() => handleViewDay(day.id.toString())}
                    className="mb-4 p-3 rounded-xl bg-white/90 shadow-sm flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center space-x-4">
                      {day.image ? (
                        <Image
                          source={{ uri: day.image }}
                          className="w-16 h-16 rounded-xl"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-16 h-16 bg-gray-300 rounded-xl items-center justify-center">
                          <Text className="text-xs text-gray-500 text-center">Sin imagen</Text>
                        </View>
                      )}
                      <Text className="text-black font-bold text-base">{formattedDate}</Text>
                    </View>
                    <Text className="text-xl">📖</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}