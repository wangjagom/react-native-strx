const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withMetroConfig } = require('react-native-monorepo-config');

const root = path.resolve(__dirname, '..');

// Resolves `react-native-strx` to the library source in the parent folder and
// makes sure peer dependencies (react, react-native, reanimated, worklets)
// come from this app only, so there is a single copy of each at runtime.
module.exports = withMetroConfig(getDefaultConfig(__dirname), {
  root,
  dirname: __dirname,
  // The library root is a single package, not a workspace monorepo.
  workspaces: [],
});
