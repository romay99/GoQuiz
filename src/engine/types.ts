import type { Vertex } from './coords';

/** 흑 = 1, 백 = -1 (go-board 규약) */
export type Sign = 1 | -1;

export type Status = 'playing' | 'solved' | 'failed';

/** @sabaki/sgf 가 반환하는 노드 구조 */
export interface SgfNode {
  id: number | null;
  data: Record<string, string[]>;
  parentId: number | null;
  children: SgfNode[];
}

export interface MoveResult {
  /** 이번 수가 정해에 포함됐는가 */
  correct: boolean;
  status: Status;
  /** 정답이어서 상대가 자동 응수한 경우 그 좌표 */
  opponentMove?: Vertex;
}
