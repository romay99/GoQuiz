/**
 * 테스트용 SGF 사활문제 픽스처 (9x9).
 * 좌표: a=0, b=1, c=2, ... i=8
 */

/** 한 수로 바로 성공 (정해 1수가 leaf) */
export const ONE_MOVE = '(;GM[1]FF[4]SZ[9]PL[B];B[ee])';

/** 복수 정답 (ee 또는 cc 둘 다 정답) */
export const MULTIPLE_CORRECT = '(;GM[1]FF[4]SZ[9]PL[B](;B[ee])(;B[cc]))';

/** 다단계: 흑ee -> 백ce(자동응수) -> 흑cg(leaf) */
export const MULTI_STEP = '(;GM[1]FF[4]SZ[9]PL[B];B[ee];W[ce];B[cg])';

/** 따냄: 우상귀 백 한 점(aa)을 흑ba 가 이미 있고, 흑ab 로 따낸다 */
export const CAPTURE = '(;GM[1]FF[4]SZ[9]PL[B]AW[aa]AB[ba];B[ab])';

/** 초기 배치가 있는 문제 (실패 후 판 불변 확인용) */
export const WITH_SETUP = '(;GM[1]FF[4]SZ[9]PL[B]AB[cc];B[ee])';

/** 백 선(先) 문제 */
export const WHITE_TO_PLAY = '(;GM[1]FF[4]SZ[9]PL[W];W[ee])';
