import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { formatMonth, formatNumber } from "@/dashboard/format";
import { useTheme } from "@/theme/theme";

type Point = { mes: string; media: number; p10: number; p90: number; n_personas: number };
type Frame = { scale: number; originX: number };

const HEIGHT = 232;
const PAD_L = 46;
const PAD_R = 8;
const PAD_T = 12;
const PAD_B = 32;
const IDENTITY: Frame = { scale: 1, originX: 0 };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function maxChartScale(count: number) {
  if (count < 4) return 1;
  return Math.min(6, Math.max(1, (count - 1) / 3));
}

function zoomWindow(savedScale: number, savedOrigin: number, nextScale: number, focalFraction: number, count: number): Frame {
  if (count < 2 || nextScale <= 1) return IDENTITY;
  const span = (count - 1) / savedScale;
  const dataX = savedOrigin * (count - 1) + focalFraction * span;
  const nextSpan = (count - 1) / nextScale;
  const start = clamp(dataX - focalFraction * nextSpan, 0, Math.max(0, count - 1 - nextSpan));
  return { scale: nextScale, originX: start / (count - 1) };
}

function panWindow(scale: number, savedOrigin: number, translationX: number, plotWidth: number, count: number): Frame {
  if (count < 2 || plotWidth <= 0 || scale <= 1) return { scale: 1, originX: 0 };
  const span = (count - 1) / scale;
  const start = clamp(savedOrigin * (count - 1) - (translationX / plotWidth) * span, 0, Math.max(0, count - 1 - span));
  return { scale, originX: start / (count - 1) };
}

function monotonePath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  const slopes: number[] = [];
  const dx: number[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    dx[i] = points[i + 1].x - points[i].x || 1;
    slopes[i] = (points[i + 1].y - points[i].y) / dx[i];
  }
  const tangents = points.map((_, index) => {
    if (index === 0) return slopes[0];
    if (index === points.length - 1) return slopes[slopes.length - 1];
    if (slopes[index - 1] * slopes[index] <= 0) return 0;
    return (slopes[index - 1] + slopes[index]) / 2;
  });
  for (let i = 0; i < slopes.length; i++) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const hypot = Math.hypot(a, b);
    if (hypot > 3) {
      const scale = 3 / hypot;
      tangents[i] = scale * a * slopes[i];
      tangents[i + 1] = scale * b * slopes[i];
    }
  }
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const step = dx[i] / 3;
    path += ` C ${points[i].x + step} ${points[i].y + tangents[i] * step}, ${points[i + 1].x - step} ${points[i + 1].y - tangents[i + 1] * step}, ${points[i + 1].x} ${points[i + 1].y}`;
  }
  return path;
}

function costTicks(min: number, max: number) {
  return [0, 1, 2, 3].map((step) => min + ((max - min) * step) / 3);
}

function axisMillions(value: number) {
  return `${(value / 1_000_000).toFixed(1)}M`;
}

export function EvolucionCostoChart({ points }: { points: Point[] }) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const [active, setActive] = useState<number | null>(null);
  const [frame, setFrame] = useState<Frame>(IDENTITY);
  const frameRef = useRef(frame);
  const savedRef = useRef(frame);
  const hostRef = useRef<View>(null);
  frameRef.current = frame;

  const seriesKey = points.map((point) => point.mes).join("|");
  const pointCount = points.length;
  const plotW = Math.max(width - PAD_L - PAD_R, 0);
  const canZoom = maxChartScale(pointCount) > 1;

  const applyFrame = useCallback((next: Frame) => {
    frameRef.current = next;
    setFrame(next);
  }, []);

  const resetZoom = useCallback(() => {
    savedRef.current = IDENTITY;
    applyFrame(IDENTITY);
  }, [applyFrame]);

  useEffect(() => {
    savedRef.current = IDENTITY;
    applyFrame(IDENTITY);
    setActive(null);
  }, [seriesKey, applyFrame]);

  useEffect(() => {
    if (Platform.OS !== "web" || plotW <= 0) return;
    const node = hostRef.current as unknown as HTMLElement | null;
    if (!node?.addEventListener) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const count = pointCount;
      const rect = node.getBoundingClientRect();
      const focal = clamp((event.clientX - rect.left - PAD_L) / plotW, 0, 1);
      const current = frameRef.current;
      const notch = Math.abs(event.deltaY) > 40;
      const factor = notch ? (event.deltaY > 0 ? 0.82 : 1.22) : Math.exp(-event.deltaY * 0.01);
      const nextScale = clamp(current.scale * factor, 1, maxChartScale(count));
      const next = zoomWindow(current.scale, current.originX, nextScale, focal, count);
      savedRef.current = next;
      applyFrame(next);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [applyFrame, plotW, pointCount]);

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onBegin(() => {
        savedRef.current = frameRef.current;
      })
      .onUpdate((event) => {
        if (plotW <= 0) return;
        const saved = savedRef.current;
        const focal = clamp((event.focalX - PAD_L) / plotW, 0, 1);
        const nextScale = clamp(saved.scale * event.scale, 1, maxChartScale(pointCount));
        applyFrame(zoomWindow(saved.scale, saved.originX, nextScale, focal, pointCount));
      })
      .onFinalize(() => {
        savedRef.current = frameRef.current;
      });

    const pan = Gesture.Pan()
      .runOnJS(true)
      .maxPointers(1)
      .activeOffsetX([-12, 12])
      .failOffsetY([-14, 14])
      .onBegin(() => {
        savedRef.current = frameRef.current;
      })
      .onUpdate((event) => {
        const saved = savedRef.current;
        if (saved.scale <= 1) return;
        applyFrame(panWindow(saved.scale, saved.originX, event.translationX, plotW, pointCount));
      })
      .onFinalize(() => {
        savedRef.current = frameRef.current;
      });

    const doubleTap = Gesture.Tap()
      .runOnJS(true)
      .numberOfTaps(2)
      .onEnd((_event, success) => {
        if (!success) return;
        savedRef.current = IDENTITY;
        applyFrame(IDENTITY);
      });

    const singleTap = Gesture.Tap()
      .runOnJS(true)
      .numberOfTaps(1)
      .onEnd((event, success) => {
        if (!success || plotW <= 0 || pointCount === 0) return;
        const current = frameRef.current;
        const zoom = current.scale <= 1 ? 1 : current.scale;
        const origin = zoom === 1 ? 0 : current.originX;
        const span = pointCount <= 1 ? 1 : (pointCount - 1) / zoom;
        const start = origin * Math.max(pointCount - 1, 0);
        const relX = clamp((event.x - PAD_L) / plotW, 0, 1);
        const index = Math.round(start + relX * span);
        if (index < 0 || index >= pointCount) return;
        const pointX = PAD_L + ((index - start) / span) * plotW;
        const slot = plotW / Math.max(span, 1);
        if (Math.abs(event.x - pointX) > Math.max(22, slot * 0.55)) return;
        setActive((currentIndex) => (currentIndex === index ? null : index));
      });

    return Gesture.Simultaneous(pinch, Gesture.Exclusive(pan, doubleTap, singleTap));
  }, [applyFrame, plotW, pointCount]);

  if (points.length === 0) {
    return <Text style={{ color: colors.muted, fontSize: 13 }}>No hay suficientes períodos para la serie.</Text>;
  }

  const costs = points.flatMap((point) => [point.media, point.p10, point.p90]);
  const dataMin = Math.min(...costs);
  const dataMax = Math.max(...costs);
  const span = dataMax - dataMin || Math.abs(dataMax) || 1;
  let minCost = dataMin - span * 0.06;
  let maxCost = dataMax + span * 0.08;
  if (dataMin >= 0) minCost = Math.max(0, minCost);
  const peopleMax = Math.max(...points.map((point) => point.n_personas), 1);
  const plotH = HEIGHT - PAD_T - PAD_B;
  const zoom = frame.scale <= 1 ? 1 : frame.scale;
  const origin = zoom === 1 ? 0 : frame.originX;
  const indexSpan = points.length <= 1 ? 1 : (points.length - 1) / zoom;
  const start = origin * Math.max(points.length - 1, 0);
  const end = start + indexSpan;
  const slot = indexSpan > 0 ? plotW / indexSpan : 0;
  const yOf = (value: number) => PAD_T + ((maxCost - value) / (maxCost - minCost)) * plotH;
  const xOf = (index: number) => (end === start ? plotW / 2 : ((index - start) / (end - start)) * plotW);
  const ticks = costTicks(minCost, maxCost);
  const selected = active === null ? null : points[active];
  const zoomed = zoom > 1.01;
  const tooltipRows = selected
    ? [
        { name: "P90", amount: selected.p90, text: `$${selected.p90.toLocaleString("es-AR")}`, people: false },
        { name: "Promedio", amount: selected.media, text: `$${selected.media.toLocaleString("es-AR")}`, people: false },
        { name: "P10", amount: selected.p10, text: `$${selected.p10.toLocaleString("es-AR")}`, people: false },
        { name: "Personas lesionadas", amount: selected.n_personas, text: formatNumber(selected.n_personas), people: true },
      ].sort((a, b) => {
        if (a.people) return 1;
        if (b.people) return -1;
        return b.amount - a.amount;
      })
    : [];
  const xLabels: { mes: string; x: number }[] = [];
  let lastLabelX = -Infinity;
  points.forEach((point, index) => {
    const x = xOf(index);
    if (x < 8 || x > plotW - 8 || x - lastLabelX < 48) return;
    lastLabelX = x;
    xLabels.push({ mes: point.mes, x });
  });

  return (
    <View style={styles.wrap} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      <GestureDetector gesture={gesture}>
        <View
          ref={hostRef}
          collapsable={false}
          accessible
          accessibilityLabel="Evolución del costo por punto"
          accessibilityHint="Pellizca con dos dedos para ampliar, arrastra para recorrer y toca dos veces para restablecer"
          style={styles.plot}
        >
          <View style={styles.axis} pointerEvents="none">
            {width > 0
              ? ticks.map((tick) => (
                  <Text key={`label-${tick}`} style={[styles.axisLabel, { color: colors.muted, top: yOf(tick) - 7 }]}>
                    {axisMillions(tick)}
                  </Text>
                ))
              : null}
          </View>
          {width > 0 ? (
            <View style={styles.canvas} pointerEvents="none">
              <Svg width={plotW} height={HEIGHT}>
                {ticks.map((tick) => (
                  <Line key={tick} x1={0} x2={plotW} y1={yOf(tick)} y2={yOf(tick)} stroke={colors.track} strokeWidth={1} />
                ))}
                <Line x1={0} x2={plotW} y1={PAD_T + plotH} y2={PAD_T + plotH} stroke={colors.line} strokeWidth={1} />
                {points.map((point, index) => {
                  const barH = (point.n_personas / peopleMax) * plotH;
                  const barW = Math.min(36, Math.max(4, slot * 0.55));
                  const x = xOf(index);
                  if (x < -barW || x > plotW + barW) return null;
                  return (
                    <Rect
                      key={point.mes}
                      x={x - barW / 2}
                      y={PAD_T + plotH - barH}
                      width={barW}
                      height={barH}
                      rx={3}
                      fill={colors.chartBand}
                      fillOpacity={0.7}
                    />
                  );
                })}
                <Path d={monotonePath(points.map((point, index) => ({ x: xOf(index), y: yOf(point.p10) })))} fill="none" stroke={colors.chartMuted} strokeWidth={1.5} strokeDasharray="4 4" />
                <Path d={monotonePath(points.map((point, index) => ({ x: xOf(index), y: yOf(point.p90) })))} fill="none" stroke={colors.chartMuted} strokeWidth={1.5} strokeDasharray="4 4" />
                <Path d={monotonePath(points.map((point, index) => ({ x: xOf(index), y: yOf(point.media) })))} fill="none" stroke={colors.primary} strokeWidth={2} />
                {points.map((point, index) => {
                  const x = xOf(index);
                  if (x < -8 || x > plotW + 8) return null;
                  return <Circle key={`dot-${point.mes}`} cx={x} cy={yOf(point.media)} r={active === index ? 4.5 : 3} fill={colors.primary} />;
                })}
                {xLabels.map((label) => (
                  <SvgText key={`x-${label.mes}`} x={label.x} y={HEIGHT - 8} fill={colors.muted} fontSize={11} textAnchor="middle">
                    {formatMonth(label.mes)}
                  </SvgText>
                ))}
              </Svg>
            </View>
          ) : (
            <View style={{ height: HEIGHT }} />
          )}
        </View>
      </GestureDetector>
      {canZoom ? (
        <View style={styles.tools}>
          <Text style={[styles.hint, { color: colors.subtle }]} numberOfLines={1}>
            {zoomed ? "Arrastra para recorrer el período" : "Pellizca para ampliar el período"}
          </Text>
          {zoomed ? (
            <Pressable onPress={resetZoom} hitSlop={8} accessibilityRole="button" accessibilityLabel="Restablecer zoom">
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{zoom.toFixed(1)}× · Restablecer</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      <View style={styles.legend}>
        <LegendItem color={colors.chartBand} label="Personas lesionadas" bar />
        <LegendItem color={colors.primary} label="Promedio" />
        <LegendItem color={colors.chartMuted} label="P10" />
        <LegendItem color={colors.chartMuted} label="P90" />
      </View>
      {selected ? (
        <View style={[styles.tooltip, { backgroundColor: colors.surface, borderColor: colors.line }]}>
          <Text style={{ color: colors.ink, fontWeight: "600", fontSize: 12 }}>{formatMonth(selected.mes)}</Text>
          {tooltipRows.map((row) => (
            <Text key={row.name} style={{ color: colors.inkSoft, fontSize: 12 }}>
              {row.name}: {row.text}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function LegendItem({ color, label, bar = false }: { color: string; label: string; bar?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.legendItem}>
      <View style={{ width: bar ? 10 : 16, height: bar ? 8 : 2, borderRadius: 99, backgroundColor: color, opacity: bar ? 0.7 : 1 }} />
      <Text style={{ color: colors.muted, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  plot: { height: HEIGHT },
  axis: { position: "absolute", left: 0, top: 0, width: PAD_L, height: HEIGHT },
  axisLabel: { position: "absolute", right: 6, fontSize: 11, textAlign: "right" },
  canvas: { position: "absolute", left: PAD_L, right: PAD_R, top: 0, bottom: 0, overflow: "hidden" },
  tools: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 18 },
  hint: { flex: 1, fontSize: 11 },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  tooltip: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
});
