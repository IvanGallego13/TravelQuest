import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator} from "react-native";
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
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 py-6">
      {/* Encabezado con ciudad e imagen */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-black mb-2">{city}</Text>
        {image ? (
          <Image
            source={{ uri: image as string }}
            className="w-full h-40 rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-300 rounded-xl items-center justify-center">
            <Text className="text-gray-700">No image</Text>
          </View>
        )}
      </View>
  
      {/* Lista de días */}
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
              className="flex-row justify-between items-center bg-white p-4 mb-4 rounded-xl border-2 border-[#699D81]"
              onPress={() => handleViewDay(day.id.toString())}
            >
              {/* Fecha e imagen */}
              <View className="flex-row items-center space-x-4">
                {day.image ? (
                  <Image
                    source={{ uri: day.image }}
                    className="w-16 h-16 rounded-md"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-16 h-16 bg-gray-300 rounded-md items-center justify-center">
                    <Text className="text-xs text-gray-500 text-center">No image</Text>
                  </View>
                )}
  
                <View>
                  <Text className="text-black font-bold">{formattedDate}</Text>
                </View>
              </View>
  
              {/* Iconos */}
              <View className="flex-row space-x-2">
                <Ionicons name="calendar" size={20} color="#699D81" />
                <FontAwesome5 name="image" size={18} color="#C76F40" />
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}
