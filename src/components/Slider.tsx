import { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';

import { useTheme } from '@/theme';

/**
 * Dependency-free draggable slider used for seek + volume. Handles taps and
 * drags, exposes accessible increment/decrement actions on the wrapper buttons.
 */
export function Slider({
  value,
  onChange,
  onChangeEnd,
  height = 22,
  color,
  trackColor,
  disabled = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  height?: number;
  color?: string;
  trackColor?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const dragging = useRef(false);

  const clampedValue = useMemo(
    () => Math.min(1, Math.max(0, dragValue ?? value)),
    [dragValue, value]
  );

  const fromEvent = (event: GestureResponderEvent): number => {
    if (width <= 0) return 0;
    const x = event.nativeEvent.locationX;
    return Math.min(1, Math.max(0, x / width));
  };

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel="Playback position"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedValue * 100) }}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderGrant={(event) => {
        dragging.current = true;
        const next = fromEvent(event);
        setDragValue(next);
        onChange?.(next);
      }}
      onResponderMove={(event) => {
        if (!dragging.current) return;
        const next = fromEvent(event);
        setDragValue(next);
        onChange?.(next);
      }}
      onResponderRelease={(event) => {
        if (!dragging.current) return;
        dragging.current = false;
        const next = fromEvent(event);
        setDragValue(null);
        onChangeEnd?.(next);
      }}
      onResponderTerminate={() => {
        dragging.current = false;
        setDragValue(null);
      }}
      style={[styles.hitArea, { height, opacity: disabled ? 0.5 : 1 }]}
    >
      <View
        style={[
          styles.track,
          { backgroundColor: trackColor ?? theme.colors.surfaceHi, height: 4, borderRadius: 2 },
        ]}
      >
        <View
          style={{
            width: `${clampedValue * 100}%`,
            height: 4,
            borderRadius: 2,
            backgroundColor: color ?? theme.colors.accent,
          }}
        />
      </View>
      <View
        style={{
          position: 'absolute',
          left: `${clampedValue * 100}%`,
          width: 12,
          height: 12,
          borderRadius: 6,
          marginLeft: -6,
          backgroundColor: color ?? theme.colors.accent,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hitArea: { justifyContent: 'center', width: '100%' },
  track: { width: '100%', overflow: 'hidden' },
});
