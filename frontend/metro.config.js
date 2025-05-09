const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Añadir CSS a las extensiones de activos
config.resolver.assetExts.push('css');

// Configuración simple sin NativeWind
module.exports = config;