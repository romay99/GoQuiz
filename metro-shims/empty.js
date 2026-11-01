// @sabaki/sgf 가 참조하는 Node 전용/선택적 모듈(fs, iconv-lite, jschardet)을
// RN 번들에서 비우기 위한 빈 shim. parse(문자열) 경로에선 실제로 사용되지 않는다.
module.exports = {};
