const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.unstable_enablePackageExports = false;
defaultConfig.resolver.sourceExts.push("cjs");

// Remove the react-native-dotenv configuration that's causing issues
// defaultConfig.transformer.babelTransformerPath = require.resolve(
//   "react-native-dotenv/babel"
// );

module.exports = defaultConfig;
