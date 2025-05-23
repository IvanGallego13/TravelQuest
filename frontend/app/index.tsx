import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";

export default function Index() {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Redirect href="./(tabs)/crear" />;
  } else {
    return <Redirect href="./login" />;
  }
}
