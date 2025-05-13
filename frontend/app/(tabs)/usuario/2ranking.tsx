import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
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
    <View className="flex-1 bg-[#F4EDE0] px-4 pt-10">
      {/* Back button and refresh button */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity 
          onPress={handleBack}
          className="bg-white/70 rounded-full p-2 shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={fetchRankingData}
          disabled={refreshing}
          className="bg-white/70 rounded-full p-2 shadow-md"
        >
          <Ionicons name="refresh" size={24} color={refreshing ? "#999" : "#000"} />
        </TouchableOpacity>
      </View>

      {/* Current user avatar and level */}
      <View className="items-center mb-6">
        {loading ? (
          <ActivityIndicator size="large" color="#699D81" />
        ) : (
          <>
            <Image 
              source={currentUser?.avatar_url ? { uri: currentUser.avatar_url } : defaultAvatar} 
              className="w-20 h-20 rounded-full mb-2" 
            />
            <Text className="text-black font-bold text-base">
              Nivel {currentUser?.score || 0}
            </Text>
          </>
        )}
      </View>

      {/* Ranking title */}
      <Text className="text-black font-bold text-lg mb-4">Ranking Global</Text>

      {/* Loading indicator or ranking list */}
      {loading ? (
        <ActivityIndicator size="large" color="#699D81" style={{ marginTop: 20 }} />
      ) : (
        <>
          {/* Global ranking list */}
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            className="mb-6"
            renderItem={({ item }) => (
              <View
                className="flex-row items-center justify-between bg-white px-3 py-1 h-12 mb-2 rounded-md border border-[#699D81]"
              >
                <View className="flex-row items-center space-x-2">
                  <Text className="text-black font-bold text-xs w-5 text-center">{item.position}</Text>
                  <Image 
                    source={item.avatar_url ? { uri: item.avatar_url } : defaultAvatar} 
                    style={{ width: 20, height: 20, borderRadius: 999 }}
                  />
                  <Text className="text-black text-sm">{item.username}</Text>
                </View>
                <Text className="text-[#C76F40] font-semibold text-sm">
                  Nivel {item.score}
                </Text>
              </View>
            )}
          />

          {/* Current user position (if not in top visible users) */}
          {currentUser && currentUser.position > 10 && (
            <>
              <Text className="text-black font-bold text-base mb-2">Tu posición</Text>
              <View className="flex-row items-center justify-between bg-white px-3 py-1 h-12 mb-10 rounded-md border border-[#699D81]">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-black font-bold text-xs w-5 text-center">
                    {currentUser.position}
                  </Text>
                  <Image 
                    source={currentUser.avatar_url ? { uri: currentUser.avatar_url } : defaultAvatar} 
                    style={{ width: 20, height: 20, borderRadius: 999 }} 
                  />
                  <Text className="text-black text-sm">{currentUser.username}</Text>
                </View>
                <Text className="text-[#699D81] font-semibold text-sm">
                  Nivel {currentUser.score}
                </Text>
              </View>
            </>
          )}
        </>
      )}
    </View>
  );
}


