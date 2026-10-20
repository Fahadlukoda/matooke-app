const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

config.transformer.minifierConfig = {
  keep_classnames: true,
  keep_fnames: true,
};

module.exports = config;