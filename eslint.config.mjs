import rnConfig from '@react-native/eslint-config/flat';

export default [
  { ignores: ['lib/', 'example/', 'node_modules/', 'outputs/'] },
  ...rnConfig,
];
