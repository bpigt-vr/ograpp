import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

const mark = require('../../assets/images/brand-mark.png');

export function Artwork({
  gradient,
  title,
  size,
  radius = 16,
  showMark = true,
  showTitle = true,
}: {
  gradient: readonly string[];
  title?: string;
  size: number;
  radius?: number;
  showMark?: boolean;
  showTitle?: boolean;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        backgroundColor: '#0B0A09',
      }}
    >
      <LinearGradient
        colors={gradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {showMark ? (
        <Image
          source={mark}
          style={{
            position: 'absolute',
            width: size * 0.82,
            height: size * 0.82,
            right: -size * 0.16,
            bottom: -size * 0.14,
            opacity: 0.24,
          }}
          contentFit="contain"
        />
      ) : null}
      {showTitle && title && size >= 96 ? (
        <View style={{ flex: 1, justifyContent: 'flex-end', padding: size * 0.09 }}>
          <AppText
            style={{
              color: '#FFF6EA',
              fontSize: Math.max(12, size * 0.115),
              lineHeight: Math.max(14, size * 0.12),
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
            numberOfLines={2}
          >
            {title}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
