import { palette } from "@/theme";
import { useMemo } from "react";

const useBarData = (
  categories: string[],
  pData: number[] = [],
  sData: number[] = [],
  isTimerTab: boolean,
  t: any
) => {
  return useMemo(() => {
    return categories.map((label, index) => {
      const primary = pData[index] ?? 0;
      const secondary = sData[index] ?? 0;

      return {
        label,
        spacing: 2,
        barWidth: 12,
        frontColor: palette.main[500],
        value: isTimerTab ? primary / 1000 / 3600 : primary,
        secondaryValue: isTimerTab
          ? secondary / 1000 / 3600
          : secondary,
        secondaryColor: '#E5E7EB',
      };
    });
  }, [categories, pData, sData, isTimerTab]);
};

export default useBarData;
