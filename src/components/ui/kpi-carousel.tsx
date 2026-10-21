import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { KpiCard } from "@/components/ui/kpi-card";
import { useTheme } from "@/theme/theme";

export type KpiItem = { label: string; value: string; detail?: string };

const GAP = 10;

export function KpiCarousel({ items }: { items: KpiItem[] }) {
  const { colors } = useTheme();
  const scroller = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const cardWidth = width === 0 ? 0 : width >= 720 ? 240 : Math.round(width * 0.82);
  const stride = cardWidth + GAP;

  function syncIndex(offsetX: number) {
    if (stride <= 0) return;
    const next = Math.round(offsetX / stride);
    setIndex(Math.max(0, Math.min(items.length - 1, next)));
  }

  return (
    <View style={styles.frame} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {cardWidth > 0 ? (
        <ScrollView
          ref={scroller}
          horizontal
          nestedScrollEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          snapToInterval={stride}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={{ gap: GAP, paddingRight: Math.max(width - cardWidth, 0) }}
          onMomentumScrollEnd={(event) => syncIndex(event.nativeEvent.contentOffset.x)}
          onScrollEndDrag={(event) => syncIndex(event.nativeEvent.contentOffset.x)}
        >
          {items.map((item) => (
            <KpiCard
              key={item.label}
              label={item.label}
              value={item.value}
              detail={item.detail}
              style={{ width: cardWidth, flexGrow: 0, flexBasis: cardWidth }}
            />
          ))}
        </ScrollView>
      ) : null}
      <View style={styles.dots}>
        {items.map((item, dot) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={() => {
              scroller.current?.scrollTo({ x: dot * stride, animated: true });
              setIndex(dot);
            }}
            style={[styles.dot, { backgroundColor: dot === index ? colors.primary : colors.lineStrong, width: dot === index ? 16 : 6 }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: "hidden" },
  dots: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 10 },
  dot: { height: 6, borderRadius: 99 },
});
