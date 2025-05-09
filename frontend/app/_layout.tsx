import { Stack } from "expo-router";
import { View, StyleSheet } from "react-native";
// Comentamos temporalmente la importación de CSS
// import "../global.css"

export default function RootLayout() {
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
