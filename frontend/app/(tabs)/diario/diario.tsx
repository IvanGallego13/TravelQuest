import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { apiFetch } from "../../../lib/api";
import { useFocusEffect } from "@react-navigation/native";

// Tipo de diario
type TripSummary = {
  id: string;
  city: string;
  date: string; // formato "YYYY-MM-DD"
  image?:string;
};
export default function JournalIndex() {
  const router = useRouter();
  // Estado local para los diarios cargados
  const [trips, setTrips] = useState<TripSummary[]>([]);
  const [loading, setLoading] = useState(true);

  //cargar diarios desde el backend
  useFocusEffect(
    useCallback(() => {
    const loadTripsFromAPI = async () => {
      try {
        setLoading(true);
        const res = await apiFetch("/diarios/resumen");
        console.log("📡 Llamada a /diarios/resumen:", res.status);

        const data = await res.json();
        console.log("📦 Respuesta JSON recibida:", data);

        if (!Array.isArray(data)) {
          console.error("❌ Respuesta inesperada: no es un array.");
          setTrips([]); // fallback
          return;
        }

        setTrips(data);
      } catch (error) {
        console.error("❌ Error loading trips:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTripsFromAPI();
   }, [])
  );

  // Navegación al detalle del diario de una ciudad
  const goToTripDetail = (tripId: string, city: string, image?: string) => {
    router.push({
      pathname: "../diario/2ciudad",
      params: {
        bookId: tripId,
        city: city,
        image: image ?? "",
      },
    });
  };
  
   return (
    <ImageBackground
      source={require('../../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-14">


        {/* Título sección */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-6 flex-row items-center gap-2">
          <Text className="text-black text-xl font-bold">Viajes</Text>
          <Text className="text-black text-2xl">🌍</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>

          {/* Tarjeta agrupadora de viajes */}
          <View className="bg-white/80 p-4 rounded-2xl shadow-md">
            <Text className="text-black font-bold text-base mb-4">
              Historial de viajes ({trips.length})
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#699D81" />
            ) : (
              trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  onPress={() => goToTripDetail(trip.id, trip.city, trip.image)}
                  className="mb-4 p-3 rounded-xl bg-white/90 shadow-sm"
                >
                  <View className="flex-row items-center justify-between">
                    {/* Icono + ciudad + fecha */}
                    <View className="flex-row items-center space-x-3 flex-1">
                      <Text className="text-2xl">🧳</Text>
                      <View className="flex-1">
                        <Text className="text-black font-bold">{trip.city}</Text>
                        <Text className="text-gray-600 text-sm">
                          {new Date(trip.date).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                    </View>

                    {/* Imagen miniatura si hay */}
                    {trip.image ? (
                      <Image
                        source={{ uri: trip.image }}
                        style={{ width: 50, height: 50, borderRadius: 10 }}
                      />
                    ) : (
                      <View className="w-[50px] h-[50px] bg-gray-300 rounded-xl items-center justify-center">
                        <Text className="text-[10px] text-gray-500 text-center">Sin imagen</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}