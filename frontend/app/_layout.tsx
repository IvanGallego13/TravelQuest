import { Stack } from "expo-router";
import { View } from "react-native";
import "../global.css"

export default function RootLayout() {
  return(
    <View className="flex-1 bg-yellow-200 min-h-screen"> 
      <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
      <Stack.Screen name="login/register" options={{ headerShown: false }}/>
      <Stack.Screen name="login/index" options={{ headerShown: false }}/>
      <Stack.Screen name="localizacion/index" options={{ headerShown: false }}/>

      
      </Stack>
    </View>
  );
}
