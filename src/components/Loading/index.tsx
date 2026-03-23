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
  isOverlay?: boolean
  style?: ViewStyle;
};

const Loading = ({
  fullScreen = true,
  color = "#FFC570",
  isOverlay = false,
  size = "large",
  text,
  style,
}: Props) => {
  if (fullScreen) {
    return (
      <View style={[isOverlay ? styles.overlayColor : null, styles.overlay, style]}>
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
  overlayColor: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99999,
  },
  center: {
    alignItems: "center",
  },
  inline: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    position: 'absolute',
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center'
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
});
