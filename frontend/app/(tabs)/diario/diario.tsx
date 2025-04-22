import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { apiFetch } from "@/lib/api";

// Tipo de diario (puedes ampliarlo luego)
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
  useEffect(() => {
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
  }, []);

  // Navegación al detalle del diario de una ciudad
  const goToTripDetail = (tripId: string, city: string, image?: string) => {
    router.push({
      pathname: "../diario/2ciudad",
      params: {
        idDiario: tripId,
        ciudad: city,
        imagen: image ?? "",
      },
    });
  };
  

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 pt-8">
      <Text className="text-black text-lg font-bold mb-4 border-b border-black w-fit">
        Viajes
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#699D81" />
      ) : (
        trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            onPress={() => goToTripDetail(trip.id, trip.city, trip.image)}
            className="bg-white mb-4 p-3 rounded-xl border-2 border-[#699D81]"
          >
            <View className="flex-row space-x-4 items-center">
              {/* Imagen si existe */}
              {trip.image ? (
                <Image
                  source={{ uri: trip.image }}
                  className="w-20 h-20 rounded-md"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 bg-gray-300 rounded-md items-center justify-center">
                  <Text className="text-xs text-gray-500 text-center">Sin imagen</Text>
                </View>
              )}

              {/*Info del diario */}
              <View className="flex-1">
                <Text className="text-black font-bold text-base">{trip.city}</Text>
                <Text className="text-gray-600 text-xs">
                  {new Date(trip.date).toLocaleDateString("es-ES")}
                </Text>
              </View>

              {/* Íconos decorativos */}
              <View className="flex-col items-end space-y-2">
                <Ionicons name="location-sharp" size={20} color="#699D81" />
                <FontAwesome5 name="book" size={18} color="#C76F40" />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

