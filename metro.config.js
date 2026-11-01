// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @sabaki/sgf 가 모듈 최상단에서 require 하는 Node 전용/선택적 모듈을 빈 모듈로 대체.
// (parse(문자열) 경로에선 쓰이지 않지만, static import 만으로 번들이 깨지는 것을 막는다)
const emptyModule = require.resolve('./metro-shims/empty.js');
const SHIMMED = new Set(['fs', 'iconv-lite', 'jschardet']);

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SHIMMED.has(moduleName)) {
    return { type: 'sourceFile', filePath: emptyModule };
  }
  const resolver = defaultResolveRequest ?? context.resolveRequest;
  return resolver(context, moduleName, platform);
};

module.exports = config;
