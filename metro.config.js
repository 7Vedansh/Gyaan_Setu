const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.resolver.sourceExts = Array.from(
  new Set([...(config.resolver.sourceExts || []), 'mjs', 'cjs'])
);

module.exports = config;
