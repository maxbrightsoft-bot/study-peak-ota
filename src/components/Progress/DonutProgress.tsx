import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { palette } from "@/theme";
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  size?: number;
  strokeWidth?: number;
  percentage: number;
};

const DonutProgress = ({
  size = 100,
  strokeWidth = 10,
  percentage,
}: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (circumference * percentage) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#FFF"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {percentage > 0 && (
          <Circle
            stroke={palette.main[600]}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>

      <View style={styles.center}>
        <Text style={styles.percentText}>{percentage.toFixed(2)}%</Text>
      </View>
    </View>
  );
};

export default DonutProgress;

const styles = ScaledSheet.create({
  center: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  percentText: {
    fontSize: '14@ms',
    fontWeight: "500",
    color: "#222222",
  },
});