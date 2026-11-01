module.exports = {
  preset: 'jest-expo',
  // @sabaki/* 는 CommonJS 라 변환 불필요하지만, 혹시 몰라 허용 목록에 포함
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sabaki/.*))',
  ],
};
