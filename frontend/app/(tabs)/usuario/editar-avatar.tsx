/* import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";

export default function EditarUsuario() {
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await SecureStore.getItemAsync("travelquest_token");

        const res = await apiFetch("/api/ajustes/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUsername(data.profile.username);
      } catch (err) {
        Alert.alert("Error", "No se pudo cargar el perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUsernameChange = async () => {
    try {
      const token = await SecureStore.getItemAsync("travelquest_token");

      const res = await apiFetch("/api/ajustes/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      Alert.alert("Nombre actualizado", "Tu nombre de usuario ha sido cambiado.");
      router.back();
    } catch (err) {
      Alert.alert("Error", "No se pudo cambiar el nombre.");
      console.error(err);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      return Alert.alert("Error", "Completa ambos campos.");
    }

    try {
      const token = await SecureStore.getItemAsync("travelquest_token");

      const res = await apiFetch("/api/ajustes/cambiar-contrasena", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actual: oldPassword,
          nueva: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo cambiar la contraseña.");
        return;
      }

      Alert.alert("Contraseña actualizada", "Tu nueva contraseña se ha guardado.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la contraseña.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F4EDE0]">
        <ActivityIndicator size="large" color="#699D81" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black text-xl font-bold mb-6">Editar usuario</Text>

      {/* 📝 Cambiar nombre de usuario */ /*}
      <Text className="text-black font-semibold mb-1">Nuevo nombre de usuario:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Ej: viajero23"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      <TouchableOpacity
        onPress={handleUsernameChange}
        className="bg-[#C76F40] py-3 rounded-xl items-center mb-10"
      >
        <Text className="text-white font-semibold text-base">Guardar nombre</Text>
      </TouchableOpacity>

      {/* 🔐 Cambiar contraseña *//*}
      <Text className="text-black text-lg font-bold mb-4">Cambiar contraseña</Text>
      <Text className="text-black font-semibold mb-1">Contraseña actual:</Text>
      <TextInput
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Contraseña actual"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />

      <Text className="text-black font-semibold mb-1">Nueva contraseña:</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
      />

      <TouchableOpacity
        onPress={handlePasswordChange}
        className="bg-[#699D81] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Actualizar contraseña</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
*/
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";

export default function EditarUsuario() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await SecureStore.getItemAsync("travelquest_token");

        const res = await apiFetch("/api/ajustes/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setUsername(data.profile.username);
        setEmail(data.user.email);
      } catch (err) {
        Alert.alert("Error", "No se pudo cargar el perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUsernameChange = async () => {
    try {
      const token = await SecureStore.getItemAsync("travelquest_token");

      const res = await apiFetch("/api/ajustes/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      Alert.alert("Nombre actualizado", "Tu nombre de usuario ha sido cambiado.");
    } catch (err) {
      Alert.alert("Error", "No se pudo cambiar el nombre.");
      console.error(err);
    }
  };

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      return Alert.alert("Error", "Completa ambos campos.");
    }

    try {
      const token = await SecureStore.getItemAsync("travelquest_token");

      const res = await apiFetch("/api/ajustes/cambiar-contrasena", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actual: oldPassword,
          nueva: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo cambiar la contraseña.");
        return;
      }

      Alert.alert("Contraseña actualizada", "Tu nueva contraseña se ha guardado.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la contraseña.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F4EDE0]">
        <ActivityIndicator size="large" color="#699D81" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black text-xl font-bold mb-6">Editar perfil</Text>

      {/* 📧 Correo electrónico */}
      <Text className="text-black font-semibold mb-1">Correo electrónico:</Text>
      <TextInput
        value={email}
        editable={false}
        className="bg-gray-200 border border-gray-400 rounded-md px-4 py-2 mb-6 text-black"
      />

      {/* 📝 Cambiar nombre de usuario */}
      <Text className="text-black font-semibold mb-1">Nombre de usuario:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Ej: viajero23"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      <TouchableOpacity
        onPress={handleUsernameChange}
        className="bg-[#C76F40] py-3 rounded-xl items-center mb-10"
      >
        <Text className="text-white font-semibold text-base">Guardar nombre</Text>
      </TouchableOpacity>

      {/* 🔐 Cambiar contraseña */}
      <Text className="text-black text-lg font-bold mb-4">Cambiar contraseña</Text>

      <Text className="text-black font-semibold mb-1">Contraseña actual:</Text>
      <TextInput
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Contraseña actual"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />

      <Text className="text-black font-semibold mb-1">Nueva contraseña:</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
      />

      <TouchableOpacity
        onPress={handlePasswordChange}
        className="bg-[#699D81] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Actualizar contraseña</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
