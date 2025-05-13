import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import "../global.css";

export default function RootLayout() {
  const { checkAuth } = useAuth();
  
  useEffect(() => {
    // Check authentication status on app startup
    const verifyAuth = async () => {
      await checkAuth();
    };
    
    verifyAuth();
  }, []);
  
  return(
    <View style={styles.container}> 
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
        <Stack.Screen name="login/register" options={{ headerShown: false }}/>
        <Stack.Screen name="login/index" options={{ headerShown: false }}/>
        <Stack.Screen name="login/localizacion" options={{ headerShown: false }}/>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4EDE0",
    minHeight: '100%'
  }
});
