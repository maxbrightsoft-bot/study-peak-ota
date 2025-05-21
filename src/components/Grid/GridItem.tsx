import React from "react";
import { View, ViewStyle } from "react-native";
import { GRID_COLUMNS, getColumnWidth } from "./configs/constans";

type Props = {
  children: React.ReactNode;
  xs?: number;
  spacing?: number;
  style?: ViewStyle;
};

const GridItem = ({ children, xs = GRID_COLUMNS, spacing = 8, style }: Props) => {
  return (
    <View
      style={[
        {
          width: getColumnWidth(xs),
          paddingHorizontal: spacing / 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

export default GridItem;
