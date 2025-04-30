import "dotenv/config";

export default {
  expo: {
    name: "myApp",
    slug: "myApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription: "Esta app necesita acceder a la cámara para tomar fotos de las misiones.",
        NSPhotoLibraryUsageDescription: "Esta app necesita acceder a tu galería para seleccionar imágenes.",
      }
    },
    android: {
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
      package: "com.yourcompany.myapp", 
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
  }
}
