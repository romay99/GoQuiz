import { useMemo, useReducer, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoBoardView } from '@/components/go-board-view';
import { DEMO_PROBLEMS } from '@/data/demoProblems';
import { PuzzleSession } from '@/engine/puzzleSession';

const BOARD_PX = Math.min(Dimensions.get('window').width - 32, 380);

export default function SolveScreen() {
  const [index, setIndex] = useState(0);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [, forceRender] = useReducer((c: number) => c + 1, 0);

  const problem = DEMO_PROBLEMS[index];
  const session = useMemo(() => new PuzzleSession(problem.sgf), [problem.sgf]);

  const onPlay = (v: [number, number]) => {
    if (session.status !== 'playing') return;
    const result = session.playMove(v);
    setLastMove(result.opponentMove ?? v);
    forceRender();
  };

  const reset = () => {
    session.reset();
    setLastMove(null);
    forceRender();
  };

  const next = () => {
    setIndex((i) => (i + 1) % DEMO_PROBLEMS.length);
    setLastMove(null);
  };

  const banner =
    session.status === 'solved'
      ? { text: '정답입니다! 🎉', color: '#1a7f42' }
      : session.status === 'failed'
        ? { text: '아쉬워요. 다시 시도해 보세요.', color: '#c53030' }
        : { text: problem.instruction, color: '#666' };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>{problem.title}</Text>
        <Text style={styles.sub}>
          {session.solverSign === -1 ? '백' : '흑'} 차례 · {session.boardSize}×{session.boardSize}
        </Text>
      </View>

      <Text style={[styles.banner, { color: banner.color }]}>{banner.text}</Text>

      <View style={styles.boardWrap}>
        <GoBoardView
          signMap={session.signMap}
          boardSize={session.boardSize}
          size={BOARD_PX}
          onPlay={onPlay}
          lastMove={lastMove}
        />
      </View>

      <View style={styles.buttons}>
        <ActionButton label="다시" onPress={reset} />
        <ActionButton label="다음 문제" onPress={next} primary />
      </View>
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, primary && styles.btnPrimary, pressed && styles.btnPressed]}>
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, alignItems: 'center', paddingHorizontal: 16, gap: 16 },
  header: { alignItems: 'center', marginTop: 12, gap: 4 },
  title: { fontSize: 20, fontWeight: '700' },
  sub: { fontSize: 14, color: '#888' },
  banner: { fontSize: 16, fontWeight: '600', textAlign: 'center', minHeight: 22 },
  boardWrap: { alignItems: 'center', justifyContent: 'center' },
  buttons: { flexDirection: 'row', gap: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  btnPrimary: { backgroundColor: '#2b6cb0', borderColor: '#2b6cb0' },
  btnPressed: { opacity: 0.7 },
  btnText: { fontSize: 15, fontWeight: '600', color: '#333' },
  btnTextPrimary: { color: '#fff' },
});
