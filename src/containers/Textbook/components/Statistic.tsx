import { palette } from "@/theme";
import { ChapterResponse } from "@/utils/types";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  t: any;
  isEnglish: boolean;
  chapter: ChapterResponse;
};

const Statistic = ({ t, isEnglish, chapter }: Props) => {
  const accuracyRate = chapter.accuracyRate || 0;
  const total = chapter.totalChapterQuestions || 0;
  const completed = chapter.completedChapterQuestions || 0;
  const progress = total !== 0 ? (completed / total) * 100 : 0;

  const getLabelPosition = (percent: number) => {
    return percent > 90 ? `${percent - 7}%` : `${percent + 5}%`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.chapterName}>{chapter.name}</Text>
        <View style={styles.row}>
          {isEnglish ? (
            <>
              <Text style={styles.lightText}>
                {`${completed} ${t("questions")}`}
              </Text>
              <Text style={styles.grayText}>
                {t("chapter_progress", { total })}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.grayText}>
                {t("chapter_progress", { total })}
              </Text>
              <Text style={styles.lightText}>
                {`${completed} ${t("questions")}`}
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.barContainer}>
        {/* Accuracy Rate */}
        <View style={styles.barRow}>
          <Text style={styles.label}>{t("correct_answer_rate")}</Text>
          <View style={styles.barWrapper}>
            <View
              style={[styles.bar, { width: `${accuracyRate}%`, backgroundColor: palette.main[500] }]}
            />
            <View style={styles.barLine} />
            <Text style={[styles.barLabel, { left: getLabelPosition(accuracyRate) }]}>
              {`${accuracyRate}%`}
            </Text>
            <View
              style={[styles.barLine, { left: `${progress}%` }]}
            />
          </View>
        </View>

        {/* Progress */}
        <View style={styles.barRow}>
          <Text style={styles.label}>{t("progress")}</Text>
          <View style={styles.barWrapper}>
            <View
              style={[styles.bar, { width: `${progress}%`, backgroundColor: palette.main[500] }]}
            />
            <View style={styles.barLine} />
            <Text style={[styles.barLabel, { left: getLabelPosition(progress) }]}>
              {`${progress.toFixed(2)}%`}
            </Text>
            <View style={[styles.barLine, { left: `${progress}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 16,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  chapterName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  lightText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  grayText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  barContainer: {
    width: "100%",
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  label: {
    width: 140,
    fontSize: 12,
    fontWeight: "700",
  },
  barWrapper: {
    flex: 1,
    height: 20,
    backgroundColor: "#eee",
    position: "relative",
    justifyContent: "center",
  },
  bar: {
    height: "100%",
    position: "absolute",
    left: 0,
  },
  barLine: {
    position: "absolute",
    width: 1,
    height: "100%",
    backgroundColor: "#333",
    left: 0,
  },
  barLabel: {
    position: "absolute",
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    top: -20,
  },
});

export default Statistic;
