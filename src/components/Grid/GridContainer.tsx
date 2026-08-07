import React from "react";
import { View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  spacing?: number;
  style?: ViewStyle;
};

const GridContainer = ({ children, spacing = 8, style }: Props) => {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          marginHorizontal: -spacing / 2,
        },
        style,
      ]}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, { spacing })
      )}
    </View>
  );
};

export default GridContainer;
