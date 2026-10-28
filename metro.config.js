const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
// expo-sqlite ships a wasm build for web previews.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './global.css' });
