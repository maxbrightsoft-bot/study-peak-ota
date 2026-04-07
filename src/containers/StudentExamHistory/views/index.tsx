import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from "react-native";
import { ExamSessionResponse } from "@/utils/types";
import useStudentExamHistory from "../hooks/useStudentExamHistory";
import SearchInput from "@/components/Input/SearchInput";
import { ScaledSheet } from "react-native-size-matters";
import { palette, TYPO } from "@/theme";
import { utcToLocalTime } from "@/utils/helpers";
import { ConfirmDialog } from "@/components/ModalBase/ConfirmDialog";
import Checkbox from "@/components/Button/Checkbox";
import ExamResult from "@/containers/ExamResult/views";

const StudentExamHistory = ({
  examSessionId,
  examCode
}: {
  examSessionId: string;
  examCode: string;
}) => {
  const {
    t,
    search,
    selectedExam,
    historyData,
    selectedIds,
    handleCloseExamResult,
    handleChangeTextSearch,
    handleViewAttempt,
    handleDelete,
    handleSelect,
    handleSelectSession
  } = useStudentExamHistory({ examSessionId, examCode });

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmSelectOpen, setConfirmSelectOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  const isAllSelected = useMemo(
    () =>
      historyData.length > 0 &&
      selectedIds.length === historyData.length,
    [historyData, selectedIds]
  );

  const handleSelectAll = () => {
    if (isAllSelected) {
      historyData.forEach(item =>
        handleSelect(item.studentExamSessionId!)
      );
    } else {
      historyData.forEach(item => {
        if (!selectedIds.includes(item.studentExamSessionId!)) {
          handleSelect(item.studentExamSessionId!);
        }
      });
    }
  };

  const handleChooseSession = (sessionId: number) => {
    setSelectedSessionId(sessionId);
    setConfirmSelectOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedIds);
    setConfirmDeleteOpen(false);
  };

  const renderItem = ({ item }: { item: ExamSessionResponse }) => {
    const isSelected = selectedIds.includes(
      item.studentExamSessionId!
    );

    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => handleSelect(item.studentExamSessionId!)}
      >
        <Checkbox checked={isSelected} />

        <View style={styles.cell}>
          <View style={styles.row}>
            {item.totalStudentAttemptNumber > 1 && (
              <Text
                style={[
                  TYPO.button4,
                  {
                    color: item.isSelected
                      ? palette.main[600]
                      : palette.red[900]
                  }
                ]}
              >
                #{item.studentAttemptNumber + 1}/
                {item.totalStudentAttemptNumber}
              </Text>
            )}
            <Text style={styles.name}>
              {item.studentName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.meta}>
              {t("score_format", { score: item.score })}
            </Text>
            <Text style={styles.meta}>
              {utcToLocalTime(
                item.startTime,
                "HH:mm YYYY.MM.DD"
              )}
            </Text>
          </View>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            disabled={item.isSelected}
            onPress={() =>
              handleChooseSession(item.studentExamSessionId!)
            }
          >
            <Text
              style={{
                color: item.isSelected
                  ? palette.grey[300]
                  : "#2196F3"
              }}
            >
              {t("choose")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              handleViewAttempt(item)
            }
          >
            <Text style={styles.view}>
              {t("view")}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {t("my_exam_sessions")}
        </Text>
      </View>

      <View style={styles.searchBox}>
        <SearchInput
          value={search}
          onChangeText={handleChangeTextSearch}
          placeholder={t("search_for")}
        />
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={handleSelectAll}
          style={styles.selectAll}
        >
          <Checkbox checked={isAllSelected} />
          <Text style={styles.selectAllText}>
            {t("select_all")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            selectedIds.length === 0 && styles.disabled
          ]}
          disabled={selectedIds.length === 0}
          onPress={() => setConfirmDeleteOpen(true)}
        >
          <Text style={styles.deleteText}>
            {t("delete")}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <FlatList
          data={historyData}
          renderItem={renderItem}
          keyExtractor={(item) =>
            item.studentExamSessionId!.toString()
          }
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>

      <ConfirmDialog
        open={confirmDeleteOpen}
        toggle={() => setConfirmDeleteOpen(false)}
        text={t(
          "are_you_sure_you_want_to_delete_the_selected_student_exam_sessions"
        )}
        onConfirm={handleConfirmDelete}
        isDelete
      />

      <ConfirmDialog
        open={confirmSelectOpen}
        toggle={() => setConfirmSelectOpen(false)}
        text={t(
          "are_you_sure_you_want_to_select_this_session"
        )}
        onConfirm={() => {
          if (selectedSessionId) {
            handleSelectSession(selectedSessionId);
          }
          setConfirmSelectOpen(false);
          setSelectedSessionId(null);
        }}
      />
      {!!selectedExam && (
        <ExamResult
          onClose={handleCloseExamResult}
          examCode={examCode || ''}
          examSessionId={selectedExam.id}
          studentExamSessionId={selectedExam?.studentExamSessionId}
        />
      )}
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[50]
  },

  header: {
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    backgroundColor: "#FFF",
    borderColor: palette.grey[100]
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#222222"
  },

  searchBox: {
    paddingTop: "16@ms",
    paddingHorizontal: "20@ms"
  },

  actionBar: {
    marginTop: "12@ms",
    paddingHorizontal: "20@ms",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  selectAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },

  selectAllText: {
    fontSize: 14,
    fontWeight: "500"
  },

  deleteButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },

  deleteText: {
    color: "#fff",
    fontWeight: "600"
  },

  disabled: {
    backgroundColor: "#f8b4b4"
  },

  scrollContainer: {
    paddingHorizontal: "20@ms",
    paddingTop: "16@ms",
    paddingBottom: "28@vs",
    gap: "12@ms"
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "12@ms",
    borderRadius: 10,
    gap: 10
  },

  selectedItem: {
    backgroundColor: "#eaf3ff"
  },

  cell: {
    flex: 1
  },

  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222"
  },

  meta: {
    fontSize: 12,
    color: palette.grey[600]
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  actionGroup: {
    flexDirection: "row",
    gap: 12
  },

  view: {
    color: "#4CAF50"
  }
});

export default StudentExamHistory;