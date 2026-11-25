import React from "react";
import { DimensionValue, View, ViewStyle } from "react-native";
import { GRID_COLUMNS } from "./configs/constans";

type Props = {
  children: React.ReactNode;
  xs?: number;
  spacing?: number;
  style?: ViewStyle;
};

const GridItem = ({ children, xs = GRID_COLUMNS, spacing = 8, style }: Props) => {
  const widthPercent = `${(xs / GRID_COLUMNS) * 100}%` as DimensionValue;
  return (
    <View
      style={[
        {
          width: widthPercent,
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
