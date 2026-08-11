import React, { FC, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform } from "react-native";
import { useTranslation } from "react-i18next";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";

import TimeLineTabs from "./TimeLineTabs";
import TimeLineTabPanel from "./TimeLineTabPanel";
import TimerUpdateItem from "./TimerUpdateItem";
import AddTimerDialog from "./AddTimerDialog";

import useTimeUpdate from "../../hooks/useTimeUpdate";
import { Timer } from "../../configs/types";
import { SubjectTimerResponse } from "../../../utils/types";
import { DATE_TIME_MIN_VALUE, MS_IN_MINUTE } from "@/utils/constants";
import { palette } from "@/theme";
import SlideDrawerRoot from "@/components/ModalBase/SlideDrawerRoot";
import { ScaledSheet } from 'react-native-size-matters'

export interface TimeUpdateDialogProps {
  open: boolean;
  data?: SubjectTimerResponse;
  seconds?: number;
  activeTimerId?: number;
  onClose: () => void;
  onStopTimer?: (data: Timer, stopTime?: number, callback?: () => void) => void;
}

const TimeUpdateDialog: FC<TimeUpdateDialogProps> = ({
  open,
  data,
  seconds,
  activeTimerId,
  onClose,
  onStopTimer,
}) => {
  const { t } = useTranslation();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    isTimeError,
    value,
    selectedDate,
    loading,
    isEdited,
    totalTime,
    currentTimeLines,
    today,
    handleUpdateTimerRecords,
    handleChangeDate,
    handleClose,
    handleUpdateStart,
    handleUpdateEnd,
    handleUpdateDuration,
    handleAddTimerAt,
    handleRemoveTimer,
    handleChange,
    handleTimeErrors,
    getTimerDetail,
    getTimersByDate,
  } = useTimeUpdate(open, onClose, data);

  const handleStopTimerWithRefresh = (timer: Timer, stopTime?: number, callback?: () => void) => {
    if (onStopTimer) {
      onStopTimer(timer, stopTime, () => {
        if (value === 0) {
          getTimerDetail();
        } else {
          getTimersByDate();
        }
        callback?.();
      });
    }
  };

  const [addTimerState, setAddTimerState] = useState<{
    index: number;
    position: "above" | "below";
    anchorTimer: Timer;
    minStartTime: moment.Moment;
    maxEndTime: moment.Moment;
  } | null>(null);

  const handleAddTimerAbove = (index: number) => {
    const cur = currentTimeLines[index];
    const prev = currentTimeLines[index - 1];
    const prevStoppedStr =
      prev?.stoppedAt && prev.stoppedAt !== DATE_TIME_MIN_VALUE
        ? prev.stoppedAt
        : prev?.lastPauseTime && prev.lastPauseTime !== DATE_TIME_MIN_VALUE
          ? prev.lastPauseTime
          : prev?.startTime;
    const minStartTime =
      index === 0
        ? moment.utc(cur.startTime).local().startOf("day")
        : moment.utc(prevStoppedStr).local();
    const maxEndTime = moment.utc(cur.startTime).local();
    setAddTimerState({ index, position: "above", anchorTimer: cur, minStartTime, maxEndTime });
  };

  const onAddTimer = (timer: Timer) => {
    if (!addTimerState) return;
    const targetIndex = addTimerState.position === "above" ? addTimerState.index : addTimerState.index + 1;
    handleAddTimerAt(targetIndex, timer);
    setAddTimerState(null);
  };

  const handleAddTimerBelow = (index: number) => {
    const cur = currentTimeLines[index]
    const curStoppedStr = (cur.stoppedAt && cur.stoppedAt !== DATE_TIME_MIN_VALUE) ? cur.stoppedAt : ((cur.lastPauseTime && cur.lastPauseTime !== DATE_TIME_MIN_VALUE) ? cur.lastPauseTime : cur.startTime);
    const minStartTime = moment.utc(curStoppedStr).local()
    const maxEndTime = index === currentTimeLines.length - 1 ? moment() : moment.utc(currentTimeLines[index + 1].startTime).local()
    setAddTimerState({ index, position: "below", anchorTimer: cur, minStartTime, maxEndTime })
  }

  return (
    <SlideDrawerRoot visible={open} onClose={handleClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>{t("updating_timeline")}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Ionicons name="close" size={24} color={palette.grey[600]} />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.tabsWrapper}>
            <TimeLineTabs
              value={value}
              onChange={handleChange}
              data={data}
              activeTimerId={activeTimerId}
              seconds={seconds}
              selectedDate={selectedDate}
            />
          </View>

          <View style={styles.content}>
            {loading ? (
              <View style={styles.loadingCenter}>
                <ActivityIndicator color={palette.main[600]} size="large" />
              </View>
            ) : (
              <>
                <TimeLineTabPanel value={value} index={0}>
                  <FlatList
                    data={currentTimeLines}
                    keyExtractor={(item, index) => `${index}_${item.id}`}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                      <TimerUpdateItem
                        data={item}
                        timerIndex={index}
                        onUpdateStart={handleUpdateStart}
                        onUpdateEnd={handleUpdateEnd}
                        onUpdateDuration={handleUpdateDuration}
                        onStopTimer={onStopTimer}
                        onError={handleTimeErrors}
                        loading={loading}
                        single
                      />
                    )}
                  />
                </TimeLineTabPanel>

                <TimeLineTabPanel value={value} index={1}>
                  <View style={styles.dateHeader}>
                    <TouchableOpacity
                      style={styles.datePickerBtn}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Ionicons name="calendar-outline" size={18} color={palette.main[700]} style={{ marginRight: 8 }} />
                      <Text style={styles.dateText}>{moment(selectedDate).format("DD/MM/YYYY")}</Text>
                    </TouchableOpacity>

                    <View style={styles.totalBadge}>
                      <Text style={styles.totalText}>
                        {t("total_timers")}: <Text style={{ fontWeight: '700' }}>{currentTimeLines.length}</Text>
                      </Text>
                    </View>
                  </View>

                  <FlatList
                    data={currentTimeLines}
                    keyExtractor={(item, index) => `${index}_${item.id}`}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                      const getGapBefore = () => {
                        if (index === 0) return moment.utc(item.startTime).diff(moment.utc(item.startTime).startOf("day"), "milliseconds");
                        const prev = currentTimeLines[index - 1];
                        const prevStoppedStr = (prev.stoppedAt && prev.stoppedAt !== DATE_TIME_MIN_VALUE) ? prev.stoppedAt : ((prev.lastPauseTime && prev.lastPauseTime !== DATE_TIME_MIN_VALUE) ? prev.lastPauseTime : prev.startTime);
                        return moment.utc(item.startTime).diff(moment.utc(prevStoppedStr), "milliseconds");
                      };
                      const getGapAfter = () => {
                        const stoppedTime = (item.stoppedAt && item.stoppedAt !== DATE_TIME_MIN_VALUE) ? item.stoppedAt : ((item.lastPauseTime && item.lastPauseTime !== DATE_TIME_MIN_VALUE) ? item.lastPauseTime : undefined);
                        if (item.status === 1 || !stoppedTime) return 0;
                        if (index === currentTimeLines.length - 1) return moment().diff(moment.utc(stoppedTime), "milliseconds");
                        const next = currentTimeLines[index + 1];
                        return moment.utc(next.startTime).diff(moment.utc(stoppedTime), "milliseconds");
                      };
                      const disableAddAbove = getGapBefore() < 5 * MS_IN_MINUTE;
                      const disableAddBelow = getGapAfter() < 5 * MS_IN_MINUTE;

                      return (
                        <TimerUpdateItem
                          data={item}
                          timerIndex={index}
                          onUpdateStart={handleUpdateStart}
                          onUpdateEnd={handleUpdateEnd}
                          onUpdateDuration={handleUpdateDuration}
                          onAddTimerAbove={handleAddTimerAbove}
                          onAddTimerBelow={handleAddTimerBelow}
                          onRemoveTimer={handleRemoveTimer}
                          disableAddAbove={disableAddAbove}
                          disableAddBelow={disableAddBelow}
                          onStopTimer={handleStopTimerWithRefresh}
                          onError={handleTimeErrors}
                          loading={loading}
                          date={selectedDate}
                        />
                      )
                    }}
                  />
                </TimeLineTabPanel>
              </>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.btnSecondary} onPress={onClose}>
            <Text style={styles.btnSecondaryText}>{t("cancel")}</Text>
          </TouchableOpacity>

          {!loading && currentTimeLines.length > 0 && value === 1 && (
            <View style={styles.chip}>
              <Ionicons name="time" size={14} color={palette.main[700]} style={{ marginRight: 4 }} />
              <Text style={styles.chipText}>{totalTime}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.btnPrimary,
              (loading || !isEdited || isTimeError) && styles.btnPrimaryDisabled
            ]}
            disabled={loading || !isEdited || isTimeError}
            onPress={handleUpdateTimerRecords}
          >
            <Text style={styles.btnPrimaryText}>{t("save")}</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={showDatePicker}
          date={new Date(selectedDate)}
          maximumDate={new Date()}
          mode="date"
          onConfirm={(date) => {
            setShowDatePicker(false);
            handleChangeDate(moment(date));
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {addTimerState && (
          <AddTimerDialog
            open={!!addTimerState}
            onClose={() => setAddTimerState(null)}
            onAdd={onAddTimer}
            selectedDate={selectedDate}
            addParams={addTimerState}
            subjectId={data?.id}
            subjectName={data?.name}
          />
        )}
      </SafeAreaView>
    </SlideDrawerRoot>
  );
};

const styles = ScaledSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    backgroundColor: '#ffffff',
    borderBottomWidth: '1@ms',
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: '2@ms' },
        shadowOpacity: 0.03,
        shadowRadius: '4@ms',
      },
      android: {
        elevation: '2@ms',
      }
    }),
  },
  title: { fontSize: '18@ms', fontWeight: "700", color: '#1a1a1a' },
  closeBtn: {
    padding: '4@ms',
    borderRadius: '20@ms',
    backgroundColor: '#f5f5f5',
  },
  tabsWrapper: {
    backgroundColor: '#ffffff',
    paddingBottom: '8@ms',
  },
  content: { flex: 1 },
  listContainer: { padding: '16@ms', paddingBottom: '40@ms' },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: '16@ms',
    paddingTop: '16@ms',
    marginBottom: '-4@ms',
  },
  datePickerBtn: {
    flexDirection: "row",
    backgroundColor: '#ffffff',
    borderWidth: '1@ms',
    borderColor: '#e0e0e0',
    paddingVertical: '10@ms',
    paddingHorizontal: '16@ms',
    borderRadius: '12@ms',
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: '1@ms' },
    shadowOpacity: 0.05,
    shadowRadius: '2@ms',
    elevation: '1@ms',
  },
  dateText: {
    fontSize: '14@ms',
    fontWeight: "600",
    color: '#333',
  },
  totalBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '12@ms',
  },
  totalText: { fontSize: '13@ms', color: '#1976d2' },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: '16@ms',
    backgroundColor: '#ffffff',
    borderTopWidth: '1@ms',
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  btnSecondary: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '100@ms',
    backgroundColor: '#f5f5f5',
  },
  btnSecondaryText: { color: "#666", fontWeight: "600", fontSize: '15@ms' },
  btnPrimary: {
    paddingVertical: '12@ms',
    paddingHorizontal: '32@ms',
    borderRadius: '100@ms',
    backgroundColor: palette.main[600],
    shadowColor: palette.main[600],
    shadowOffset: { width: 0, height: '4@ms' },
    shadowOpacity: 0.3,
    shadowRadius: '8@ms',
    elevation: '4@ms',
  },
  btnPrimaryDisabled: {
    backgroundColor: palette.grey[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "700", fontSize: '15@ms' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms',
    borderRadius: '100@ms',
    backgroundColor: palette.main[50],
    borderWidth: '1@ms',
    borderColor: palette.main[100],
  },
  chipText: { fontSize: '14@ms', fontWeight: "700", color: palette.main[600] },
});

export default TimeUpdateDialog;