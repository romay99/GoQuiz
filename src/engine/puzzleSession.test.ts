import { describe, expect, it } from '@jest/globals';

import { sgfToVertex } from './coords';
import { PuzzleSession } from './puzzleSession';
import {
  CAPTURE,
  MULTIPLE_CORRECT,
  MULTI_STEP,
  ONE_MOVE,
  WHITE_TO_PLAY,
  WITH_SETUP,
} from './__fixtures__/sampleProblems';

const v = sgfToVertex;

describe('PuzzleSession', () => {
  it('1. 한 수로 정답이면 solved', () => {
    const s = new PuzzleSession(ONE_MOVE);
    const r = s.playMove(v('ee'));
    expect(r.correct).toBe(true);
    expect(r.status).toBe('solved');
    expect(s.status).toBe('solved');
  });

  it('2. 트리에 없는 수는 failed', () => {
    const s = new PuzzleSession(ONE_MOVE);
    const r = s.playMove(v('aa'));
    expect(r.correct).toBe(false);
    expect(r.status).toBe('failed');
  });

  it('3. 복수 정답은 어느 쪽이든 solved', () => {
    expect(new PuzzleSession(MULTIPLE_CORRECT).playMove(v('ee')).status).toBe('solved');
    expect(new PuzzleSession(MULTIPLE_CORRECT).playMove(v('cc')).status).toBe('solved');
  });

  it('4. 다단계: 첫 수는 playing, 마지막 수에서 solved', () => {
    const s = new PuzzleSession(MULTI_STEP);
    const r1 = s.playMove(v('ee'));
    expect(r1.correct).toBe(true);
    expect(r1.status).toBe('playing');

    const r2 = s.playMove(v('cg'));
    expect(r2.status).toBe('solved');
  });

  it('5. 정답 후 상대 자동 응수 좌표를 반환', () => {
    const s = new PuzzleSession(MULTI_STEP);
    const r = s.playMove(v('ee'));
    expect(r.opponentMove).toEqual(v('ce'));
  });

  it('6. 따냄: 정해 수가 상대 돌을 잡으면 판에서 제거된다', () => {
    const s = new PuzzleSession(CAPTURE);
    s.playMove(v('ab'));
    const [x, y] = v('aa');
    expect(s.board.get([x, y])).toBe(0); // 백 한 점이 따내졌다
    expect(s.status).toBe('solved');
  });

  it('7. 실패 후 추가 입력은 무시된다 (판 불변)', () => {
    const s = new PuzzleSession(WITH_SETUP);
    expect(s.playMove(v('ii')).status).toBe('failed'); // 오답
    const r = s.playMove(v('ee')); // 원래라면 정답이지만 무시돼야 함
    expect(r.status).toBe('failed');
    const [x, y] = v('ee');
    expect(s.board.get([x, y])).toBe(0); // 두어지지 않음
  });

  it('8. 백 선(先) 문제는 solverSign = -1 로 동작', () => {
    const s = new PuzzleSession(WHITE_TO_PLAY);
    expect(s.solverSign).toBe(-1);
    expect(s.playMove(v('ee')).status).toBe('solved');
  });

  it('reset() 하면 처음 상태로 돌아온다', () => {
    const s = new PuzzleSession(ONE_MOVE);
    s.playMove(v('ee'));
    expect(s.status).toBe('solved');
    s.reset();
    expect(s.status).toBe('playing');
  });
});
