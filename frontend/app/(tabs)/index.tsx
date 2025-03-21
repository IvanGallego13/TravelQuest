import { Redirect } from "expo-router";
import {Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="bg-red-700">soy el indice</Text>
      <Redirect href={"./Login"}/>
    </View>
  );
}
