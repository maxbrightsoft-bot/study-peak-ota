import React, { FC, memo } from 'react';
import { G, Line, Text as SvgText } from 'react-native-svg';
import { palette } from '@/theme/colors';
import {
  ACTIVE_TICK_WIDTH,
  TICK_SPACING,
  TICK_WIDTH,
} from '../../configs/constants';

interface Props {
  index: number;
  isDragging: boolean;
  isActive: boolean;
  isHovering: boolean;
}

const Tick: FC<Props> = ({
  index,
  isDragging,
  isActive,
  isHovering,
}) => {
  const isMajor = index % 5 === 0;
  const tickX = index * TICK_SPACING;

  const highlight =
    (isDragging || isHovering) && isActive;

  return (
    <G>
      <Line
        x1={tickX}
        y1={isMajor ? -12 : 0}
        x2={tickX}
        y2={12}
        stroke={
          highlight
            ? palette.main[500]
            : palette.grey[300]
        }
        strokeWidth={
          highlight
            ? ACTIVE_TICK_WIDTH
            : TICK_WIDTH
        }
      />

      {isMajor && (isDragging || isHovering) && (
        <SvgText
          x={tickX}
          y={24}
          fontSize={8}
          fontWeight={isActive ? '600' : '500'}
          fill={
            isActive
              ? palette.main[500]
              : palette.grey[300]
          }
          textAnchor="middle"
        >
          {index}
        </SvgText>
      )}
    </G>
  );
};

export default memo(Tick);
