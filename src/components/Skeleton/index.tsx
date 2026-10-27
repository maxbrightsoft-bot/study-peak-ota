import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, ViewStyle, StyleProp } from "react-native";
import { ScaledSheet, ms } from "react-native-size-matters";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton = ({
  width = "100%",
  height = ms(16),
  borderRadius = ms(4),
  style,
}: SkeletonProps) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeletonBase,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const TextbookItemSkeleton = () => (
  <View style={styles.textbookCard}>
    <Skeleton width={ms(60)} height={ms(80)} borderRadius={ms(8)} />
    <View style={styles.textbookContent}>
      <View style={styles.rowBetween}>
        <Skeleton width={ms(65)} height={ms(20)} borderRadius={ms(10)} />
        <Skeleton width={ms(45)} height={ms(14)} borderRadius={ms(4)} />
      </View>
      <Skeleton width="85%" height={ms(15)} borderRadius={ms(4)} style={{ marginTop: ms(8) }} />
      <Skeleton width="55%" height={ms(15)} borderRadius={ms(4)} style={{ marginTop: ms(4) }} />
      <Skeleton width="100%" height={ms(6)} borderRadius={ms(3)} style={{ marginTop: ms(10) }} />
    </View>
  </View>
);

export const TextbookListSkeleton = ({ count = 4 }: { count?: number }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <TextbookItemSkeleton key={`textbook-skeleton-${index}`} />
    ))}
  </View>
);

export const QuestionSkeleton = ({ count = 3 }: { count?: number }) => (
  <View style={styles.questionList}>
    {Array.from({ length: count }).map((_, index) => (
      <View key={`question-skeleton-${index}`} style={styles.questionCard}>
        <View style={styles.questionHeader}>
          <Skeleton width={ms(70)} height={ms(24)} borderRadius={ms(12)} />
          <Skeleton width={ms(30)} height={ms(24)} borderRadius={ms(12)} />
        </View>
        <Skeleton width="92%" height={ms(16)} borderRadius={ms(4)} style={{ marginTop: ms(12) }} />
        <Skeleton width="78%" height={ms(16)} borderRadius={ms(4)} style={{ marginTop: ms(6) }} />
        <View style={styles.choicesContainer}>
          {[1, 2, 3, 4].map((choice) => (
            <View key={`choice-${choice}`} style={styles.choiceRow}>
              <Skeleton width={ms(24)} height={ms(24)} borderRadius={ms(12)} />
              <Skeleton width="80%" height={ms(14)} borderRadius={ms(4)} />
            </View>
          ))}
        </View>
      </View>
    ))}
  </View>
);

export const ExamResultCardSkeleton = () => (
  <View style={styles.examCard}>
    <View style={styles.examTopRow}>
      <Skeleton width="65%" height={ms(16)} borderRadius={ms(4)} />
      <Skeleton width={ms(52)} height={ms(20)} borderRadius={ms(10)} />
    </View>
    <View style={styles.examBottomRow}>
      <Skeleton width={ms(95)} height={ms(13)} borderRadius={ms(4)} />
      <Skeleton width={ms(65)} height={ms(24)} borderRadius={ms(12)} />
    </View>
  </View>
);

export const ExamResultGroupSkeleton = () => (
  <View style={styles.examGroupCard}>
    <View style={styles.examGroupHeader}>
      <View>
        <Skeleton width={ms(85)} height={ms(16)} borderRadius={ms(4)} />
        <Skeleton width={ms(50)} height={ms(12)} borderRadius={ms(4)} style={{ marginTop: ms(4) }} />
      </View>
      <Skeleton width={ms(20)} height={ms(20)} borderRadius={ms(10)} />
    </View>
    <ExamResultCardSkeleton />
    <ExamResultCardSkeleton />
  </View>
);

export const ExamResultListSkeleton = ({ count = 3 }: { count?: number }) => (
  <View style={styles.examResultListContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <ExamResultGroupSkeleton key={`exam-result-group-skeleton-${index}`} />
    ))}
  </View>
);

export const ConversationCardSkeleton = () => (
  <View style={styles.chatCard}>
    <View style={styles.chatCardHeader}>
      <Skeleton width={ms(44)} height={ms(44)} borderRadius={ms(22)} style={{ marginRight: ms(12) }} />
      <View style={styles.chatCardHeaderContent}>
        <View style={styles.chatTitleRow}>
          <Skeleton width="45%" height={ms(16)} borderRadius={ms(4)} />
          <Skeleton width={ms(50)} height={ms(12)} borderRadius={ms(4)} />
        </View>
        <Skeleton width="65%" height={ms(13)} borderRadius={ms(4)} style={{ marginTop: ms(4) }} />
      </View>
    </View>
    <View style={styles.chatCardBody}>
      <Skeleton width="92%" height={ms(14)} borderRadius={ms(4)} />
      <Skeleton width="60%" height={ms(14)} borderRadius={ms(4)} />
      <View style={styles.chatCardInfoRow}>
        <Skeleton width={ms(48)} height={ms(20)} borderRadius={ms(6)} />
        <Skeleton width={ms(64)} height={ms(20)} borderRadius={ms(6)} />
      </View>
    </View>
  </View>
);

export const ConversationListSkeleton = ({ count = 4 }: { count?: number }) => (
  <View style={styles.chatListContainer}>
    {Array.from({ length: count }).map((_, index) => (
      <ConversationCardSkeleton key={`chat-skeleton-${index}`} />
    ))}
  </View>
);

export default Skeleton;

const styles = ScaledSheet.create({
  skeletonBase: {
    backgroundColor: "#E4E4E7",
  },
  listContainer: {
    paddingHorizontal: "16@ms",
    gap: "12@ms",
    marginTop: "12@ms",
  },
  textbookCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: "16@ms",
    padding: "12@ms",
    gap: "12@ms",
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  textbookContent: {
    flex: 1,
    justifyContent: "center",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionList: {
    paddingHorizontal: "16@ms",
    paddingTop: "16@ms",
    gap: "16@ms",
  },
  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16@ms",
    padding: "16@ms",
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  choicesContainer: {
    marginTop: "16@ms",
    gap: "10@ms",
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: "10@ms",
    backgroundColor: "#FAFAFB",
    padding: "8@ms",
    borderRadius: "8@ms",
  },
  examResultListContainer: {
    paddingHorizontal: "20@ms",
    paddingTop: "16@ms",
    gap: "16@ms",
  },
  examGroupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "14@ms",
    paddingVertical: "8@ms",
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  examGroupHeader: {
    paddingHorizontal: "20@ms",
    paddingVertical: "10@ms",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "14@ms",
    padding: "18@ms",
    marginHorizontal: "16@ms",
    marginBottom: "14@ms",
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  examTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12@ms",
  },
  examBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatListContainer: {
    gap: "16@ms",
    paddingBottom: "20@ms",
  },
  chatCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16@ms",
    padding: "16@ms",
    marginBottom: "16@ms",
    borderWidth: 1,
    borderColor: "#F2F4F7",
  },
  chatCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: "12@ms",
  },
  chatCardHeaderContent: {
    flex: 1,
    justifyContent: "center",
  },
  chatTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatCardBody: {
    backgroundColor: "#F8FAFC",
    padding: "12@ms",
    borderRadius: "12@ms",
    gap: "8@ms",
  },
  chatCardInfoRow: {
    flexDirection: "row",
    gap: "8@ms",
    alignItems: "center",
    marginTop: "4@ms",
  },
});