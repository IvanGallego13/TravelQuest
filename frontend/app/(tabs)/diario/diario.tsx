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
        ciudad: city,
        imagen: image ?? "",
      },
    });
  };
  
  return (
    <ImageBackground
      source={require('../../../assets/images/ciudad2.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-12 justify-start">

        {/* Título viajes */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-8 flex-row items-center gap-2">
          <Text className="text-black text-xl font-bold">
            Viajes
          </Text>
          <Text className="text-black text-2xl">🌍</Text>
        </View>

        {/* Lista de viajes */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {loading ? (
            <ActivityIndicator size="large" color="#699D81" />
          ) : (
            trips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => goToTripDetail(trip.id, trip.city, trip.image)}
                className="bg-white/80 mb-6 p-5 rounded-2xl shadow-md"
              >
                <View className="flex-row items-center">

                  {/* Imagen del viaje */}
                  {trip.image ? (
                    <Image
                      source={{ uri: trip.image }}
                      className="w-20 h-20 rounded-xl mr-4"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-20 h-20 bg-gray-300 rounded-xl items-center justify-center mr-4">
                      <Text className="text-xs text-gray-500 text-center">Sin imagen</Text>
                    </View>
                  )}

                  {/* Información del viaje */}
                  <View className="flex-1">
                    <Text className="text-black font-bold text-lg">{trip.city}</Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {new Date(trip.date).toLocaleDateString("es-ES")}
                    </Text>
                  </View>

                  {/* Icono decorativo de viaje */}
                  <Text className="text-3xl">🧳</Text>

                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

      </View>
    </ImageBackground>
  );
 
}