import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, ImageBackground } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch } from "../../../lib/api";

// Tipo de entrada individual
type Entry = {
  id: number;
  description: string;
  image?: string | null;
  created_at: string;
};

export default function DayDetail() {
  const router = useRouter();
  const { idDay, bookId, city, image } = useLocalSearchParams();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchEntries = async () => {
        try {
          setLoading(true);
          const res = await apiFetch(`/diarios/entradas/${idDay}`);
          if (!res.ok) throw new Error("Failed to fetch entries");

          const data = await res.json();
          setEntries(data);
        } catch (err) {
          console.error("❌ Error fetching entries:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchEntries();
    }, [idDay])
  );
   return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-8">

        {/* Flecha volver */}
        <TouchableOpacity
          onPress={() =>
            router.replace({
              pathname: "/diario/2ciudad",
              params: { bookId, city, image },
            })
          }
          className="absolute top-10 left-4 z-10 bg-white/70 rounded-full p-2 shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingTop: 70, paddingBottom: 160 }} showsVerticalScrollIndicator={false}>

          {/* Badge fecha + ciudad */}
          {entries.length > 0 && (
            <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-6 flex-row items-center gap-2">
              <Text className="text-black text-lg font-semibold">
                {city} · {new Date(entries[0].created_at).toLocaleDateString("es-ES")}
              </Text>
              <Text className="text-black text-xl">🗓️</Text>
            </View>
          )}

          {/* Tarjeta agrupadora de entradas */}
          <View className="bg-white/80 p-4 rounded-2xl shadow-md">
            <Text className="text-black font-bold text-base mb-4">
              Entradas del día ({entries.length})
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#699D81" />
            ) : (
              entries.map((entry) => (
                <View
                  key={entry.id}
                  className="mb-4 p-3 rounded-xl bg-white/90"
                   style={{
                    elevation: 12, // Aumentar más sombra
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                  }}
                >
                  {/* Imagen */}
                  {entry.image ? (
                    <Image
                      source={{ uri: entry.image }}
                      resizeMode="cover"
                      className="w-full h-48 rounded-xl mb-3"
                    />
                  ) : (
                    <View className="w-full h-48 bg-gray-300 rounded-xl items-center justify-center mb-3">
                      <Text className="text-gray-600">Sin imagen</Text>
                    </View>
                  )}

                  {/* Descripción */}
                  <Text className="text-black text-base leading-relaxed">{entry.description}</Text>
                </View>
              ))
            )}
          </View>

          {/* Botón añadir nueva entrada */}
          <TouchableOpacity
            className="mt-8 bg-white/90 px-6 py-4 rounded-2xl shadow-md flex-row items-center justify-between self-start"
            onPress={() =>
              router.push({
                pathname: "/crear/2.2entradaDiario",
                params: { idDia: idDay },
              })
            }
          >
            <Text className="text-black font-bold text-base">➕ Añadir entrada</Text>
            <Text className="text-black text-xl">→</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </ImageBackground>
  );
}