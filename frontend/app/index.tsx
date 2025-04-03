
import { Redirect } from "expo-router";
import { useAuth } from "../hooks/useAuth";
import React from "react";

export default function Index() {
  const { session } = useAuth();

  if (session) {
    return <Redirect href="./(tabs)/crear" />;
  } else {
    return <Redirect href="./login" />;
  }
}
