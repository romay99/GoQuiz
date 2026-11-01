import { useMemo, useReducer, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoBoardView } from '@/components/go-board-view';
import { vertexEquals, type Vertex } from '@/engine/coords';
import { PuzzleSession } from '@/engine/puzzleSession';
import {
  buildSgf,
  computeSignMap,
  moveColorAt,
  validateDraft,
  type Color,
  type PuzzleDraft,
} from '@/editor/sgf';

const BOARD_PX = Math.min(Dimensions.get('window').width - 32, 360);

type Mode = 'setup' | 'solution' | 'done';

export default function EditorScreen() {
  const [boardSize, setBoardSize] = useState(9);
  const [firstPlayer, setFirstPlayer] = useState<Color>('B');
  const [placeColor, setPlaceColor] = useState<Color>('B');
  const [setupBlack, setSetupBlack] = useState<Vertex[]>([]);
  const [setupWhite, setSetupWhite] = useState<Vertex[]>([]);
  const [solution, setSolution] = useState<Vertex[]>([]);
  const [mode, setMode] = useState<Mode>('setup');

  const [sgf, setSgf] = useState('');
  const [validation, setValidation] = useState<{ ok: boolean; reason?: string } | null>(null);
  const [lastMove, setLastMove] = useState<Vertex | null>(null);
  const [, forceRender] = useReducer((c: number) => c + 1, 0);

  const draft: PuzzleDraft = { boardSize, firstPlayer, setupBlack, setupWhite, solution };

  const testSession = useMemo(() => {
    if (mode !== 'done' || !sgf) return null;
    try {
      return new PuzzleSession(sgf);
    } catch {
      return null;
    }
  }, [mode, sgf]);

  const displaySignMap =
    mode === 'done' && testSession ? testSession.signMap : computeSignMap(draft);

  // ----- 착수 핸들러 (모드별) -----
  const onPlay = (v: Vertex) => {
    if (mode === 'setup') {
      const inB = setupBlack.some((s) => vertexEquals(s, v));
      const inW = setupWhite.some((s) => vertexEquals(s, v));
      if (inB) setSetupBlack((xs) => xs.filter((s) => !vertexEquals(s, v)));
      else if (inW) setSetupWhite((xs) => xs.filter((s) => !vertexEquals(s, v)));
      else if (placeColor === 'B') setSetupBlack((xs) => [...xs, v]);
      else setSetupWhite((xs) => [...xs, v]);
      return;
    }
    if (mode === 'solution') {
      if (displaySignMap[v[1]][v[0]] !== 0) return; // 이미 돌이 있는 자리
      setSolution((xs) => [...xs, v]);
      return;
    }
    if (mode === 'done' && testSession) {
      if (testSession.status !== 'playing') return;
      const r = testSession.playMove(v);
      setLastMove(r.opponentMove ?? v);
      forceRender();
    }
  };

  const finish = () => {
    const result = validateDraft(draft);
    setSgf(buildSgf(draft));
    setValidation(result);
    setLastMove(null);
    setMode('done');
  };

  const startOver = () => {
    setSetupBlack([]);
    setSetupWhite([]);
    setSolution([]);
    setSgf('');
    setValidation(null);
    setLastMove(null);
    setMode('setup');
  };

  const currentTurn = moveColorAt(firstPlayer, solution.length);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>문제 만들기</Text>

        {/* 상단 컨트롤 */}
        {mode === 'setup' && (
          <View style={styles.controls}>
            <Segment label="판 크기" options={[['9x9', 9], ['13x13', 13]]} value={boardSize} onChange={(v) => { startOver(); setBoardSize(v as number); }} />
            <Segment label="선(先)" options={[['흑', 'B'], ['백', 'W']]} value={firstPlayer} onChange={(v) => setFirstPlayer(v as Color)} />
            <Segment label="놓을 돌" options={[['흑', 'B'], ['백', 'W']]} value={placeColor} onChange={(v) => setPlaceColor(v as Color)} />
            <Text style={styles.hint}>빈 점을 누르면 돌을 놓고, 놓인 돌을 누르면 지웁니다.</Text>
          </View>
        )}

        {mode === 'solution' && (
          <View style={styles.controls}>
            <Text style={styles.turn}>
              {solution.length + 1}수째 · {currentTurn === 'B' ? '흑' : '백'} 차례
            </Text>
            <Text style={styles.hint}>정해 수순을 순서대로 두세요 (내 수 → 상대 수 → …).</Text>
          </View>
        )}

        {mode === 'done' && validation && (
          <View style={styles.controls}>
            <Text style={[styles.banner, { color: validation.ok ? '#1a7f42' : '#b7791f' }]}>
              {validation.ok ? '✅ 검증 통과 — 풀리는 문제입니다!' : `⚠️ ${validation.reason}`}
            </Text>
            <Text style={styles.hint}>
              {testSession?.status === 'solved'
                ? '정답! 🎉'
                : testSession?.status === 'failed'
                  ? '아쉬워요. [다시 풀기]를 눌러 보세요.'
                  : '아래 판에서 직접 풀어볼 수 있어요.'}
            </Text>
          </View>
        )}

        {/* 바둑판 */}
        <View style={styles.boardWrap}>
          <GoBoardView
            signMap={displaySignMap}
            boardSize={boardSize}
            size={BOARD_PX}
            onPlay={onPlay}
            lastMove={mode === 'done' ? lastMove : null}
          />
        </View>

        {/* 하단 버튼 */}
        {mode === 'setup' && (
          <View style={styles.row}>
            <Btn label="전체 지우기" onPress={() => { setSetupBlack([]); setSetupWhite([]); }} />
            <Btn label="정해 입력 →" primary onPress={() => setMode('solution')} />
          </View>
        )}

        {mode === 'solution' && (
          <View style={styles.row}>
            <Btn label="되돌리기" onPress={() => setSolution((xs) => xs.slice(0, -1))} disabled={solution.length === 0} />
            <Btn label="← 배치 수정" onPress={() => { setSolution([]); setMode('setup'); }} />
            <Btn label="완료 ✓" primary onPress={finish} disabled={solution.length === 0} />
          </View>
        )}

        {mode === 'done' && (
          <>
            <View style={styles.row}>
              <Btn label="다시 풀기" onPress={() => { testSession?.reset(); setLastMove(null); forceRender(); }} />
              <Btn label="정해 다시" onPress={() => setMode('solution')} />
              <Btn label="새 문제" primary onPress={startOver} />
            </View>
            <Text style={styles.sgfLabel}>생성된 SGF (길게 눌러 복사)</Text>
            <Text selectable style={styles.sgf}>{sgf}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Segment({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: [string, string | number][];
  value: string | number;
  onChange: (v: string | number) => void;
}) {
  return (
    <View style={styles.segRow}>
      <Text style={styles.segLabel}>{label}</Text>
      <View style={styles.segGroup}>
        {options.map(([text, val]) => {
          const active = val === value;
          return (
            <Pressable key={text} onPress={() => onChange(val)} style={[styles.seg, active && styles.segActive]}>
              <Text style={[styles.segText, active && styles.segTextActive]}>{text}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Btn({
  label,
  onPress,
  primary,
  disabled,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        primary && styles.btnPrimary,
        disabled && styles.btnDisabled,
        pressed && !disabled && { opacity: 0.7 },
      ]}>
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 14 },
  title: { fontSize: 20, fontWeight: '700' },
  controls: { alignSelf: 'stretch', gap: 8 },
  segRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  segLabel: { fontSize: 14, color: '#666' },
  segGroup: { flexDirection: 'row', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  seg: { paddingVertical: 6, paddingHorizontal: 16 },
  segActive: { backgroundColor: '#2b6cb0' },
  segText: { fontSize: 14, color: '#333' },
  segTextActive: { color: '#fff', fontWeight: '600' },
  turn: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  hint: { fontSize: 13, color: '#888', textAlign: 'center' },
  banner: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  boardWrap: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  btn: { paddingVertical: 11, paddingHorizontal: 18, borderRadius: 10, borderWidth: 1, borderColor: '#ccc' },
  btnPrimary: { backgroundColor: '#2b6cb0', borderColor: '#2b6cb0' },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 14, fontWeight: '600', color: '#333' },
  btnTextPrimary: { color: '#fff' },
  sgfLabel: { fontSize: 12, color: '#888', alignSelf: 'stretch' },
  sgf: { fontSize: 12, fontFamily: 'monospace', color: '#444', alignSelf: 'stretch', backgroundColor: '#f2f2f2', padding: 10, borderRadius: 8 },
});
