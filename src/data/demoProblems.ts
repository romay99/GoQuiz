export interface DemoProblem {
  id: string;
  title: string;
  instruction: string;
  /** 문제 + 정해 수순 (SGF) */
  sgf: string;
}

/**
 * 데모용 샘플 문제. 실제 문제는 Phase 5 에디터로 사용자가 업로드한다.
 */
export const DEMO_PROBLEMS: DemoProblem[] = [
  {
    id: 'capture-1',
    title: '흑 선 — 백 한 점을 잡아라',
    instruction: '백 한 점의 마지막 활로를 막아 따내세요. (한 수)',
    // 백 ee 한 점을 흑 de/fe/ed 가 둘러싸고 있고, 흑 ef 로 따낸다.
    sgf: '(;GM[1]FF[4]SZ[9]PL[B]AW[ee]AB[de][fe][ed];B[ef])',
  },
  {
    id: 'capture-2',
    title: '흑 선 — 백 두 점을 잡아라',
    instruction: '둘러싸인 백 두 점의 마지막 활로를 막아 한 번에 따내세요.',
    // 백 ee/ef 두 점을 흑이 둘러싸고, 마지막 활로 eg 를 막아 따낸다.
    sgf: '(;GM[1]FF[4]SZ[9]PL[B]AW[ee][ef]AB[de][ed][fe][df][ff];B[eg])',
  },
];
