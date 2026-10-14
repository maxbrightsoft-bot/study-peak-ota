import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import BottomSheet from "@/components/ModalBase/BottomSheet";
import { ExamSessionResponse } from "@/utils/types";
import { utcToLocalTime } from "@/utils/helpers";
import { isValidTime } from "@/utils/helpers/times";

interface StudentExamSessionPickerProps {
  isVisible: boolean;
  onClose: () => void;
  sessions: ExamSessionResponse[];
  selectedStudentExamSessionId?: number;
  onSelectSession: (session: ExamSessionResponse) => void;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  hasMore?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const StudentExamSessionPicker: React.FC<StudentExamSessionPickerProps> = ({
  isVisible,
  onClose,
  sessions,
  selectedStudentExamSessionId,
  onSelectSession,
  onLoadMore,
  isLoadingMore,
  hasMore,
}) => {
  const { t } = useTranslation();

  const getSessionDisplayInfo = (item: ExamSessionResponse, index: number) => {
    const title = item.title || item.code || `${t("exam")} ${index + 1}`;
    const rawTime = isValidTime(item.studentStartTime)
      ? item.studentStartTime
      : isValidTime(item.startTime)
      ? item.startTime
      : null;
    const dateStr = rawTime
      ? utcToLocalTime(rawTime, t("date_format"))
      : null;
    const scoreStr =
      item.score !== undefined && item.score !== null
        ? t("score_format", { score: item.score })
        : null;

    let suffix = "";
    if (dateStr) {
      suffix += ` (${dateStr})`;
    }
    if (scoreStr) {
      suffix += ` - ${scoreStr}`;
    }
    return { title, suffix };
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={t("choose_exam")}
      styleContainer={styles.bottomSheetContainer}
      closeChildren={
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color="#222222" />
        </TouchableOpacity>
      }
    >
      <View style={styles.sheetContent}>
        <FlatList
          data={sessions}
          keyExtractor={(item, index) =>
            String(item.studentExamSessionId ?? item.id ?? index)
          }
          showsVerticalScrollIndicator={true}
          persistentScrollbar={true}
          contentContainerStyle={styles.listContainer}
          onEndReached={() => {
            if (hasMore && !isLoadingMore && onLoadMore) {
              onLoadMore();
            }
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#7B2CBF" />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const itemId = item.studentExamSessionId ?? item.id;
            const isSelected = selectedStudentExamSessionId === itemId;
            const { title, suffix } = getSessionDisplayInfo(item, index);

            return (
              <TouchableOpacity
                style={[
                  styles.itemRow,
                  isSelected && styles.itemRowSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  onSelectSession(item);
                  onClose();
                }}
              >
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#7B2CBF"
                    style={styles.checkIcon}
                  />
                )}
                <View style={styles.textContainer}>
                  <Text
                    style={[
                      styles.itemTitle,
                      isSelected && styles.itemTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {title}
                  </Text>
                  {!!suffix && (
                    <Text
                      style={[
                        styles.itemSuffix,
                        isSelected && styles.itemTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {suffix}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t("no_exams_found")}
              </Text>
            </View>
          }
        />
      </View>
    </BottomSheet>
  );
};

export default StudentExamSessionPicker;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    backgroundColor: "#F5F6F9",
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexShrink: 1,
  },
  listContainer: {
    paddingVertical: 8,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  itemRowSelected: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#7B2CBF",
  },
  checkIcon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    color: "#2B2D42",
    fontWeight: "500",
    flexShrink: 1,
  },
  itemSuffix: {
    fontSize: 15,
    color: "#2B2D42",
    fontWeight: "500",
    flexShrink: 0,
  },
  itemTextSelected: {
    color: "#7B2CBF",
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#8D99AE",
  },
  loadingMoreContainer: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
