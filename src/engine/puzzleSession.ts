import GoBoard from '@sabaki/go-board';
import { parse } from '@sabaki/sgf';

import { sgfToVertex, vertexEquals, type Vertex } from './coords';
import type { MoveResult, Sign, SgfNode, Status } from './types';

/**
 * 정해 수순 기반 사활문제 풀이 세션.
 *
 * 저작 규칙(= 트리 모양):
 *  - 루트: 초기 배치(AB/AW) + 선(PL). 착수 없음.
 *  - 이후 노드는 "푸는 사람 색 -> 상대 색" 번갈아 등장.
 *  - 푸는 사람 차례 노드의 children = 인정하는 정답 수들(복수 가능).
 *  - 상대 차례 노드의 children = 상대 응수(MVP: 첫 번째만 사용).
 *  - leaf(자식 없는 노드) 도달 = 성공. 트리에 없는 수 = 자동 오답.
 */
export class PuzzleSession {
  board: GoBoard;
  readonly boardSize: number;
  readonly solverSign: Sign;
  status: Status = 'playing';

  private readonly root: SgfNode;
  private current: SgfNode;

  constructor(sgf: string) {
    const roots = parse(sgf) as unknown as SgfNode[];
    if (roots.length === 0) throw new Error('Invalid SGF: no root node');

    this.root = roots[0];
    this.boardSize = Number(this.root.data.SZ?.[0] ?? 19);
    this.solverSign = this.root.data.PL?.[0] === 'W' ? -1 : 1;
    this.board = this.buildInitialBoard();
    this.current = this.root;
  }

  /** 푸는 사람이 한 수 둔다. */
  playMove(vertex: Vertex): MoveResult {
    if (this.status !== 'playing') {
      return { correct: false, status: this.status };
    }

    // 1) 내 수가 정답(children) 중에 있는가?
    const match = this.current.children.find((child) => {
      const mv = moveOf(child);
      return mv != null && mv.sign === this.solverSign && vertexEquals(mv.vertex, vertex);
    });

    if (match == null) {
      this.status = 'failed';
      return { correct: false, status: 'failed' };
    }

    // 2) 내 수 반영
    this.board = this.board.makeMove(this.solverSign, vertex);
    this.current = match;
    if (match.children.length === 0) {
      this.status = 'solved';
      return { correct: true, status: 'solved' };
    }

    // 3) 상대 자동 응수 (첫 번째 변화)
    const replyNode = match.children[0];
    const reply = moveOf(replyNode);
    let opponentMove: Vertex | undefined;
    if (reply != null) {
      this.board = this.board.makeMove(reply.sign, reply.vertex);
      opponentMove = reply.vertex;
    }
    this.current = replyNode;
    if (replyNode.children.length === 0) {
      this.status = 'solved';
    }

    return { correct: true, status: this.status, opponentMove };
  }

  /** 처음 상태로 되돌린다. */
  reset(): void {
    this.board = this.buildInitialBoard();
    this.current = this.root;
    this.status = 'playing';
  }

  /** 렌더링용 현재 판 상태 (0=빈 곳, 1=흑, -1=백) */
  get signMap(): number[][] {
    return this.board.signMap as number[][];
  }

  private buildInitialBoard(): GoBoard {
    let board = GoBoard.fromDimensions(this.boardSize);
    for (const coord of this.root.data.AB ?? []) {
      board = board.set(sgfToVertex(coord), 1);
    }
    for (const coord of this.root.data.AW ?? []) {
      board = board.set(sgfToVertex(coord), -1);
    }
    return board;
  }
}

/** 노드에서 착수(색 + 좌표)를 꺼낸다. 착수 없는 노드(루트/패스)면 null. */
function moveOf(node: SgfNode): { sign: Sign; vertex: Vertex } | null {
  const b = node.data.B?.[0];
  if (b != null && b !== '') return { sign: 1, vertex: sgfToVertex(b) };
  const w = node.data.W?.[0];
  if (w != null && w !== '') return { sign: -1, vertex: sgfToVertex(w) };
  return null;
}
