/**
 * @sabaki/sgf 는 타입 정의를 제공하지 않으므로 우리가 필요한 부분만 선언한다.
 */
declare module '@sabaki/sgf' {
  export interface SgfNode {
    id: number | null;
    data: Record<string, string[]>;
    parentId: number | null;
    children: SgfNode[];
  }

  export function parse(contents: string, options?: unknown): SgfNode[];
  export function stringify(nodes: SgfNode[] | SgfNode, options?: unknown): string;
  export function parseVertex(input: string): [number, number];
  export function stringifyVertex(vertex: [number, number]): string;
}
