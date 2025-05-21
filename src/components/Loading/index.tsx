import React from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";

type Props = {
  fullScreen?: boolean;
  color?: string;
  size?: "small" | "large";
  text?: string;
  style?: ViewStyle;
};

const Loading = ({
  fullScreen = true,
  color = "#4F46E5",
  size = "large",
  text,
  style,
}: Props) => {
  if (fullScreen) {
    return (
      <View style={[styles.overlay, style]}>
        <View style={styles.center}>
          <ActivityIndicator color={color} size={size} />
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.inline, style]}>
      <ActivityIndicator color={color} size={size} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  center: {
    alignItems: "center",
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
