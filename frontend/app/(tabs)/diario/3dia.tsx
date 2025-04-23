import { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
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
    <View className="flex-1 bg-[#F4EDE0]">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* Botón volver */}
        <TouchableOpacity 
          onPress={() => 
            router.replace({
              pathname: "/diario/2ciudad",
              params: {
                bookId,
                city,
                image,
              },
            })
          }
          className="mb-4 self-start"
        >
          <Ionicons name="arrow-back" size={28} color="#699D81" />
        </TouchableOpacity>

        {/* Fecha del día (de la primera entrada si hay) */}
        {entries.length > 0 && (
          <Text className="text-lg font-bold text-black mb-4">
            {new Date(entries[0].created_at).toLocaleDateString("es-ES")}
          </Text>
        )}

        {loading ? (
          <ActivityIndicator size="large" color="#699D81" />
        ) : (
          entries.map((entry) => (
            <View key={entry.id} className="mb-6">
              {/* Imagen */}
              {entry.image ? (
                <Image
                  source={{ uri: entry.image }}
                  resizeMode="cover"
                  className="w-full h-48 rounded-xl mb-2 bg-gray-300"
                />
              ) : (
                <View className="w-full h-48 rounded-xl bg-gray-300 items-center justify-center mb-2">
                  <Text className="text-gray-600">No image</Text>
                </View>
              )}

              {/* Texto */}
              <Text className="text-black">{entry.description}</Text>
            </View>
          ))
        )}

        {/* Botón para añadir nueva entrada */}
        <TouchableOpacity
          className="bg-[#C76F40] px-4 py-3 rounded-xl self-start"
          onPress={() =>
            router.push({
              pathname: "/crear/2.2entradaDiario",
              params: { idDia: idDay },
            })
          }
        >
          <Text className="text-white font-bold">Añadir entrada</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
