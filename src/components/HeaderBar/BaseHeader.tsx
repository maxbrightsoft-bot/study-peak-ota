import { palette } from "@/theme";
import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children?: React.ReactNode;
  style?: any;
};

const BaseHeader = ({ children, style }: Props) => {
  const insets = useSafeAreaInsets();

  console.log({ insets });
  return (
    <View style={[styles.container, { paddingTop: insets.top }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: palette.main[500],
    height: 85,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});

export default BaseHeader;
