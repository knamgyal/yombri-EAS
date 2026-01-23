// apps/mobile/metro.config.js
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo (so packages/* changes are seen)
config.watchFolders = [monorepoRoot];

// Resolve modules from both app and workspace root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Recommended in many monorepo setups to avoid “wrong node_modules” lookups
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
