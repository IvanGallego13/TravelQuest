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
      source={require('../../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1  px-6 pt-12 justify-start">

        {/* Encabezado */}
        <View className="mb-8">
          {/* Badge de ciudad */}
          <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2">
            <Text className="text-black text-lg font-semibold">{city}</Text>
            <Text className="text-black text-xl">🏙️</Text>
          </View>

         
        </View>

        {/* Lista de días */}
        <ScrollView showsVerticalScrollIndicator={false}>
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
                  className="bg-white/80 p-4 mb-6 rounded-2xl shadow-md flex-row items-center justify-between"
                  onPress={() => handleViewDay(day.id.toString())}
                >
                  {/* Imagen y fecha */}
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

                    <Text className="text-black font-bold text-lg ms-3">{formattedDate}</Text>
                  </View>

                  {/* Ícono decorativo */}
                  <Text className="text-2xl">📖</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

      </View>
    </ImageBackground>
  );
  
}
