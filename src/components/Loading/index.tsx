import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

type Props = {
  fullScreen?: boolean;
  color?: string;
  size?: "small" | "large";
  text?: string;
  isOverlay?: boolean;
  style?: ViewStyle;
};

const DEFAULT_GOLD = "#FFB800";
const LIGHT_GOLD = "#FFE169";

const Loading = ({
  fullScreen = true,
  color = DEFAULT_GOLD,
  text,
  isOverlay = false,
  style,
}: Props) => {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;

  const bar1Anim = useRef(new Animated.Value(0)).current;
  const bar2Anim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true,
    }).start();

    // Loop Bar 1 (Primary sweeping wave)
    const anim1 = Animated.loop(
      Animated.timing(bar1Anim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      })
    );

    // Loop Bar 2 (Secondary trailing wave)
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(bar2Anim, {
          toValue: 1,
          duration: 900,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ])
    );

    anim1.start();
    anim2.start();

    return () => {
      anim1.stop();
      anim2.stop();
    };
  }, []);

  // Bar 1 transforms
  const bar1TranslateX = bar1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth * 0.55, screenWidth * 1.15],
  });

  const bar1ScaleX = bar1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1.4, 0.3],
  });

  // Bar 2 transforms
  const bar2TranslateX = bar2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth * 0.45, screenWidth * 1.15],
  });

  const bar2ScaleX = bar2Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.9, 0.2],
  });

  const topPosition = fullScreen ? Math.max(insets.top, 0) : 0;

  return (
    <Animated.View
      onStartShouldSetResponder={() => true}
      style={[
        styles.overlay,
        isOverlay ? styles.overlayColor : styles.transparentOverlay,
        { opacity: fadeAnim },
        style,
      ]}
    >
      {/* Top Linear Progress Bar */}
      <View style={[styles.progressWrapper, { top: topPosition }]}>
        <View style={styles.track}>
          {/* Animated Wave 1 (Deep Rich Gold) */}
          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: color,
                width: screenWidth * 0.55,
                transform: [
                  { translateX: bar1TranslateX },
                  { scaleX: bar1ScaleX },
                ],
              },
            ]}
          />

          {/* Animated Wave 2 (Bright Light Gold Highlight) */}
          <Animated.View
            style={[
              styles.bar,
              {
                backgroundColor: color === DEFAULT_GOLD ? LIGHT_GOLD : color,
                width: screenWidth * 0.45,
                opacity: 0.9,
                transform: [
                  { translateX: bar2TranslateX },
                  { scaleX: bar2ScaleX },
                ],
              },
            ]}
          />
        </View>

        {/* Optional floating chip for text */}
        {text ? (
          <View style={styles.chipWrapper}>
            <View style={styles.chip}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text numberOfLines={1} style={styles.chipText}>
                {text}
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

export default Loading;

const styles = ScaledSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  overlayColor: {
    backgroundColor: "rgba(16, 24, 40, 0.15)",
  },
  transparentOverlay: {
    backgroundColor: "rgba(255, 255, 255, 0.001)",
  },
  progressWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 99999,
  },
  track: {
    height: "3.5@ms",
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.32)",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#FFB800",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.65,
    shadowRadius: 5,
    elevation: 6,
  },
  bar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: "2@ms",
  },
  chipWrapper: {
    alignItems: "center",
    marginTop: "8@ms",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: "6@ms",
    backgroundColor: "rgba(16, 24, 40, 0.88)",
    paddingHorizontal: "14@ms",
    paddingVertical: "6@ms",
    borderRadius: "14@ms",
    borderWidth: 1,
    borderColor: "rgba(255, 184, 0, 0.25)",
    shadowColor: "#101828",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  dot: {
    width: "6@ms",
    height: "6@ms",
    borderRadius: "3@ms",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: "11@ms",
    fontWeight: "600",
  },
});