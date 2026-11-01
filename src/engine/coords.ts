/**
 * SGF 좌표 <-> go-board vertex([x, y]) 변환.
 *
 * 주의: @sabaki/go-board 의 parseVertex/stringifyVertex 는 "사람용 좌표"(A~T, I 생략)라
 * SGF 좌표(a~z...)와 다르다. 그래서 SGF 변환은 여기서 직접 처리한다.
 * (@sabaki/sgf 내부 규약과 동일한 알파벳 인덱싱)
 */

export type Vertex = [number, number];

const SGF_ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** "cd" -> [2, 3] */
export function sgfToVertex(coord: string): Vertex {
  return [SGF_ALPHA.indexOf(coord[0]), SGF_ALPHA.indexOf(coord[1])];
}

/** [2, 3] -> "cd" */
export function vertexToSgf([x, y]: Vertex): string {
  return SGF_ALPHA[x] + SGF_ALPHA[y];
}

export function vertexEquals(a: Vertex, b: Vertex): boolean {
  return a[0] === b[0] && a[1] === b[1];
}
