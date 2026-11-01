import GoBoard from '@sabaki/go-board';

import { vertexToSgf, type Vertex } from '@/engine/coords';
import { PuzzleSession } from '@/engine/puzzleSession';

export type Color = 'B' | 'W';

export interface PuzzleDraft {
  boardSize: number;
  firstPlayer: Color;
  setupBlack: Vertex[];
  setupWhite: Vertex[];
  /** 정해 수순 (선 색부터 번갈아) */
  solution: Vertex[];
}

const other = (c: Color): Color => (c === 'B' ? 'W' : 'B');
const toSign = (c: Color): 1 | -1 => (c === 'B' ? 1 : -1);

/** solution[index] 를 둔 색 */
export function moveColorAt(firstPlayer: Color, index: number): Color {
  return index % 2 === 0 ? firstPlayer : other(firstPlayer);
}

/** 초기 배치 + 정해 n수까지 적용한 판 상태(따냄 반영) */
export function computeSignMap(draft: PuzzleDraft, uptoMoves?: number): number[][] {
  const { boardSize, firstPlayer, setupBlack, setupWhite, solution } = draft;
  let b = GoBoard.fromDimensions(boardSize);
  setupBlack.forEach((v) => {
    b = b.set(v, 1);
  });
  setupWhite.forEach((v) => {
    b = b.set(v, -1);
  });
  const n = uptoMoves ?? solution.length;
  for (let i = 0; i < n; i++) {
    const sign = toSign(moveColorAt(firstPlayer, i));
    try {
      b = b.makeMove(sign, solution[i]);
    } catch {
      b = b.set(solution[i], sign);
    }
  }
  return b.signMap as number[][];
}

/** 드래프트를 SGF 문자열로 직렬화 */
export function buildSgf(draft: PuzzleDraft): string {
  const { boardSize, firstPlayer, setupBlack, setupWhite, solution } = draft;
  let s = `(;GM[1]FF[4]SZ[${boardSize}]PL[${firstPlayer}]`;
  if (setupBlack.length > 0) s += 'AB' + setupBlack.map((v) => `[${vertexToSgf(v)}]`).join('');
  if (setupWhite.length > 0) s += 'AW' + setupWhite.map((v) => `[${vertexToSgf(v)}]`).join('');
  for (let i = 0; i < solution.length; i++) {
    s += `;${moveColorAt(firstPlayer, i)}[${vertexToSgf(solution[i])}]`;
  }
  return s + ')';
}

/** 엔진으로 정해를 실제로 두어보며 "풀리는 문제"인지 검증 */
export function validateDraft(draft: PuzzleDraft): { ok: boolean; reason?: string } {
  if (draft.solution.length === 0) {
    return { ok: false, reason: '정해 수를 최소 1수 입력하세요.' };
  }
  let session: PuzzleSession;
  try {
    session = new PuzzleSession(buildSgf(draft));
  } catch {
    return { ok: false, reason: 'SGF 생성에 실패했습니다.' };
  }
  // 푸는 사람의 수(짝수 인덱스)를 차례로 둔다. 상대 수는 엔진이 자동 응수.
  for (let i = 0; i < draft.solution.length; i += 2) {
    const r = session.playMove(draft.solution[i]);
    if (!r.correct) {
      return { ok: false, reason: `${i + 1}번째 정해 수가 유효하지 않습니다.` };
    }
  }
  if (session.status !== 'solved') {
    return { ok: false, reason: '정해를 다 두어도 성공 상태가 아닙니다.' };
  }
  return { ok: true };
}
