import { useMemo } from 'react';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';

interface Props {
  /** 0=빈 곳, 1=흑, -1=백 */
  signMap: number[][];
  boardSize: number;
  /** 정사각형 픽셀 크기 */
  size: number;
  onPlay?: (vertex: [number, number]) => void;
  lastMove?: [number, number] | null;
}

const COLORS = {
  board: '#e4b25c',
  line: '#4a3418',
  black: '#1a1a1a',
  white: '#f7f7f7',
  whiteBorder: '#8a8a8a',
};

function starPoints(n: number): [number, number][] {
  if (n === 9) return [[2, 2], [6, 2], [2, 6], [6, 6], [4, 4]];
  if (n === 13) return [[3, 3], [9, 3], [3, 9], [9, 9], [6, 6]];
  return [];
}

/**
 * 순수 React Native View 기반 바둑판 (Expo Go 에서 바로 실행 가능).
 * 성능이 필요해지면 나중에 @shopify/react-native-skia 로 교체.
 */
export function GoBoardView({ signMap, boardSize, size, onPlay, lastMove }: Props) {
  const margin = size / (boardSize + 1);
  const cell = (size - margin * 2) / (boardSize - 1);
  const pos = (i: number) => margin + i * cell;
  const r = cell * 0.45;
  const span = pos(boardSize - 1) - pos(0);
  const stars = useMemo(() => starPoints(boardSize), [boardSize]);

  const handleRelease = (e: GestureResponderEvent) => {
    if (!onPlay) return;
    const { locationX, locationY } = e.nativeEvent;
    const x = Math.round((locationX - margin) / cell);
    const y = Math.round((locationY - margin) / cell);
    if (x < 0 || y < 0 || x >= boardSize || y >= boardSize) return;
    onPlay([x, y]);
  };

  return (
    <View
      style={[styles.board, { width: size, height: size }]}
      onStartShouldSetResponder={() => true}
      onResponderRelease={handleRelease}>
      {/* 격자 - 가로선 */}
      {Array.from({ length: boardSize }).map((_, i) => (
        <View
          key={`h${i}`}
          style={{ position: 'absolute', left: pos(0), top: pos(i), width: span, height: StyleSheet.hairlineWidth + 0.5, backgroundColor: COLORS.line }}
        />
      ))}
      {/* 격자 - 세로선 */}
      {Array.from({ length: boardSize }).map((_, i) => (
        <View
          key={`v${i}`}
          style={{ position: 'absolute', top: pos(0), left: pos(i), height: span, width: StyleSheet.hairlineWidth + 0.5, backgroundColor: COLORS.line }}
        />
      ))}
      {/* 화점 */}
      {stars.map(([sx, sy], idx) => {
        const d = Math.max(4, cell * 0.16);
        return (
          <View
            key={`s${idx}`}
            style={{ position: 'absolute', left: pos(sx) - d / 2, top: pos(sy) - d / 2, width: d, height: d, borderRadius: d / 2, backgroundColor: COLORS.line }}
          />
        );
      })}
      {/* 돌 */}
      {signMap.map((row, y) =>
        row.map((s, x) => {
          if (s === 0) return null;
          const isLast = !!lastMove && lastMove[0] === x && lastMove[1] === y;
          return (
            <View
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: pos(x) - r,
                top: pos(y) - r,
                width: r * 2,
                height: r * 2,
                borderRadius: r,
                backgroundColor: s === 1 ? COLORS.black : COLORS.white,
                borderWidth: s === -1 ? 1 : 0,
                borderColor: COLORS.whiteBorder,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {isLast && (
                <View
                  style={{ width: r * 0.55, height: r * 0.55, borderRadius: r * 0.3, backgroundColor: s === 1 ? COLORS.white : COLORS.black }}
                />
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: { backgroundColor: COLORS.board, borderRadius: 6, position: 'relative' },
});
