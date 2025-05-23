import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { apiFetch } from "../../../lib/api";

// Define types for our data
interface RankingUser {
  id: string;
  username: string;
  score: number;
  avatar_url: string | null;
  position: number;
}

interface CurrentUser {
  id: string;
  username: string;
  score: number;
  avatar_url: string | null;
  position: number;
}

export default function Ranking() {
  const router = useRouter();
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load ranking data on component mount
  useEffect(() => {
    fetchRankingData();
  }, []);

  // Function to fetch ranking data from the backend
  const fetchRankingData = async () => {
    try {
      setRefreshing(true);
      
      // Get global ranking
      const rankingRes = await apiFetch("/ranking");
      
      if (!rankingRes.ok) {
        throw new Error("Error fetching ranking data");
      }
      
      const rankingData = await rankingRes.json();
      
      // Transform data to match our interface
      const formattedUsers = rankingData.map((user: any, index: number) => ({
        id: user.id,
        username: user.username || `Usuario ${index + 1}`,
        score: user.score || 0,
        avatar_url: user.avatar_url,
        position: index + 1
      }));
      
      setUsers(formattedUsers);
      
      // Get current user profile
      const profileRes = await apiFetch("/users/profile/complete");
      
      if (!profileRes.ok) {
        throw new Error("Error fetching user profile");
      }
      
      const profileData = await profileRes.json();
      
      // Find current user's position in the ranking
      const userPosition = formattedUsers.findIndex(
        (user: RankingUser) => user.id === profileData.profile.id
      );
      
      setCurrentUser({
        id: profileData.profile.id,
        username: profileData.profile.username || "Usuario",
        score: profileData.profile.score || 0,
        avatar_url: profileData.profile.avatar_url,
        position: userPosition !== -1 ? userPosition + 1 : formattedUsers.length + 1
      });
      
    } catch (error) {
      console.error("Error loading ranking:", error);
      Alert.alert("Error", "No se pudo cargar el ranking. Intenta nuevamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Default avatar image for users without a custom avatar
  const defaultAvatar = require("../../../assets/images/avatar.png");

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

   return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-14">
        
        {/* Flechas y recarga */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity 
            onPress={handleBack}
            className="bg-white/80 rounded-full p-2 shadow-md"
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={fetchRankingData}
            disabled={refreshing}
            className="bg-white/80 rounded-full p-2 shadow-md"
          >
            <Ionicons name="refresh" size={24} color={refreshing ? "#999" : "#000"} />
          </TouchableOpacity>
        </View>

        {/* Avatar usuario actual */}
        <View className="items-center mb-6">
          {loading ? (
            <ActivityIndicator size="large" color="#699D81" />
          ) : (
            <>
              <Image 
                source={currentUser?.avatar_url ? { uri: currentUser.avatar_url } : defaultAvatar} 
                className="w-24 h-24 rounded-full mb-2"
              />
              <Text className="text-black font-bold text-base">Nivel {currentUser?.score || 0}</Text>
            </>
          )}
        </View>

        {/* Título ranking */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2">
          <Text className="text-black text-lg font-bold">🏅 Ranking Global</Text>
        </View>

        {/* Lista o loader */}
        {loading ? (
          <ActivityIndicator size="large" color="#699D81" style={{ marginTop: 20 }} />
        ) : (
          <>
            {/* Lista de usuarios */}
            <FlatList
              data={users}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              className="mb-6"
              renderItem={({ item }) => (
                <View className="bg-white/90 rounded-xl px-4 py-3 mb-3 shadow-sm flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-black font-bold w-6 text-center">{item.position}</Text>
                    <Image 
                      source={item.avatar_url ? { uri: item.avatar_url } : defaultAvatar} 
                      className="w-8 h-8 rounded-full"
                    />
                    <Text className="text-black text-sm">{item.username}</Text>
                  </View>
                  <Text className="text-[#C76F40] font-bold text-sm">Nivel {item.score}</Text>
                </View>
              )}
            />

            {/* Posición del usuario si está fuera del top */}
            {currentUser && currentUser.position > 10 && (
              <>
                <Text className="text-black font-bold text-base mb-2">Tu posición</Text>
                <View className="bg-white/90 rounded-xl px-4 py-3 shadow-sm flex-row justify-between items-center mb-10">
                  <View className="flex-row items-center space-x-3">
                    <Text className="text-black font-bold w-6 text-center">{currentUser.position}</Text>
                    <Image 
                      source={currentUser.avatar_url ? { uri: currentUser.avatar_url } : defaultAvatar}
                      className="w-8 h-8 rounded-full"
                    />
                    <Text className="text-black text-sm">{currentUser.username}</Text>
                  </View>
                  <Text className="text-[#699D81] font-bold text-sm">Nivel {currentUser.score}</Text>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </ImageBackground>
  );
}