import React, { FC, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTranslation } from "react-i18next";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Timer } from "@/layouts/configs/types";
import { TimerStatus } from "@/utils/enums";
import { DATE_TIME_MIN_VALUE, MS_IN_MINUTE, MS_IN_SECOND } from "@/utils/constants";
import { palette } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import CommonDialog from "@/components/ModalBase/CommonDialog";
import { ConfirmDialog } from "@/components/ModalBase/ConfirmDialog";

interface Props {
  data: Timer;
  timerIndex: number;
  onUpdateStart: (index: number, newTime: moment.Moment) => void;
  onUpdateEnd: (index: number, newTime: moment.Moment) => void;
  onUpdateDuration: (index: number, newDuration: number) => void;
  onStopTimer?: (data: Timer, stopTime?: number, callback?: () => void) => void;
  onError: (index: number, hasError: boolean) => void;
  single?: boolean;
  date?: moment.Moment;
  onAddTimerAbove?: (index: number) => void;
  onAddTimerBelow?: (index: number) => void;
  onRemoveTimer?: (index: number) => void;
  disableAddAbove?: boolean;
  disableAddBelow?: boolean;
  minAllowedStartTime?: moment.Moment;
  maxAllowedEndTime?: moment.Moment;
  loading?: boolean;
}

const TimerUpdateItem: FC<Props> = ({
  data,
  timerIndex,
  onUpdateStart,
  onUpdateEnd,
  onUpdateDuration,
  onStopTimer,
  onError,
  single,
  onAddTimerAbove,
  onAddTimerBelow,
  onRemoveTimer,
  disableAddAbove,
  disableAddBelow,
  minAllowedStartTime,
  maxAllowedEndTime,
  loading,
}) => {
  const { t } = useTranslation();
  const { startTime, lastPauseTime, stoppedAt, duration, status, subjectName } = data;

  const [stepMinutes, setStepMinutes] = useState<string>("10");
  const [showPicker, setShowPicker] = useState<"start" | "end" | "duration" | null>(null);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openStopConfirm, setOpenStopConfirm] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const startTimeValue = useMemo(() => moment.utc(startTime).local(), [startTime]);
  const isStopped = status === TimerStatus.Stopped;
  const isRunning = status === TimerStatus.Started;

  const stoppedTimeValue = useMemo(() => {
    const time = status === TimerStatus.Stopped ? stoppedAt : lastPauseTime;
    if (!time || time === DATE_TIME_MIN_VALUE) return undefined;
    return moment.utc(time).local();
  }, [lastPauseTime, stoppedAt, status]);

  const maxStartTime = stoppedTimeValue
    ? moment.min(stoppedTimeValue, maxAllowedEndTime || moment())
    : moment.min(moment(), maxAllowedEndTime || moment());
  const minStartTime = minAllowedStartTime;

  const minEndTime = startTimeValue;
  const endOfDay = (stoppedTimeValue ? stoppedTimeValue : startTimeValue).clone().endOf("day");
  const maxEndTime = maxAllowedEndTime
    ? moment.min(startTimeValue.isSame(moment(), "day") ? moment() : endOfDay, maxAllowedEndTime)
    : startTimeValue.isSame(moment(), "day")
      ? moment()
      : endOfDay;

  const isDifferentDay = stoppedTimeValue && !startTimeValue.isSame(stoppedTimeValue, "day");

  const startError = useMemo(() => {
    if (minStartTime && startTimeValue.isBefore(minStartTime, "minute")) return "minTime";
    if (maxStartTime && startTimeValue.isAfter(maxStartTime, "minute")) return "maxTime";
    return null;
  }, [startTimeValue, minStartTime, maxStartTime]);

  const endError = useMemo(() => {
    if (!stoppedTimeValue) return null;
    if (minEndTime && stoppedTimeValue.isBefore(minEndTime, "minute")) return "minTime";
    if (maxEndTime && stoppedTimeValue.isAfter(maxEndTime, "minute")) return "maxTime";
    return null;
  }, [stoppedTimeValue, minEndTime, maxEndTime]);

  const startErrorMessage = useMemo(() => {
    if (!startError) return undefined;
    if (startError.toLowerCase().includes("min"))
      return `${t("must_be_after")} ${minStartTime ? minStartTime.local().format("HH:mm") : ""}`;
    if (startError.toLowerCase().includes("max"))
      return `${t("must_be_before")} ${maxStartTime.local().format("HH:mm")}`;
    return t("invalid_time");
  }, [startError, minStartTime, maxStartTime, t]);

  const endErrorMessage = useMemo(() => {
    if (!endError) return undefined;
    if (endError.toLowerCase().includes("min"))
      return `${t("must_be_after")} ${minEndTime.local().format("HH:mm")}`;
    if (endError.toLowerCase().includes("max"))
      return `${t("must_be_before")} ${maxEndTime.local().format("HH:mm")}`;
    return t("invalid_time");
  }, [endError, minEndTime, maxEndTime, t]);

  const maxAllowedDuration = stoppedTimeValue
    ? stoppedTimeValue.diff(startTimeValue, "milliseconds")
    : undefined;

  const stepMs = (parseInt(stepMinutes) || 0) * MS_IN_MINUTE;
  const canIncrease = !maxAllowedDuration || duration + stepMs <= maxAllowedDuration;
  const canDecrease = duration - stepMs > 0;

  useMemo(() => {
    let hasError = false;
    if (stoppedTimeValue && startTimeValue.isAfter(stoppedTimeValue)) hasError = true;
    if (duration <= 0) hasError = true;
    if (stoppedTimeValue && duration > stoppedTimeValue.diff(startTimeValue, "milliseconds")) hasError = true;
    if (minAllowedStartTime && startTimeValue.isBefore(minAllowedStartTime)) hasError = true;
    if (maxAllowedEndTime) {
      if (startTimeValue.isAfter(maxAllowedEndTime)) hasError = true;
      if (stoppedTimeValue && stoppedTimeValue.isAfter(maxAllowedEndTime)) hasError = true;
    }
    if (!!startError || !!endError) hasError = true;
    onError(timerIndex, hasError);
  }, [startTimeValue, stoppedTimeValue, duration, timerIndex, minAllowedStartTime, maxAllowedEndTime, startError, endError]);

  const handleStopTimer = () => {
    if (data.status === TimerStatus.Stopped) return;
    setOpenStopConfirm(true);
  };

  const confirmStop = () => {
    setOpenStopConfirm(false);
    setIsStopping(true);
    if (onStopTimer) {
      onStopTimer(
        data,
        data.status === TimerStatus.Paused && stoppedTimeValue ? stoppedTimeValue.valueOf() : undefined,
        () => setIsStopping(false)
      );
    } else {
      setIsStopping(false);
    }
  };

  const handleIncreaseDuration = () => {
    if (!canIncrease || isRunning || isStopping || loading) return;
    onUpdateDuration(timerIndex, duration + stepMs);
  };

  const handleDecreaseDuration = () => {
    if (!canDecrease || isRunning || isStopping || loading) return;
    onUpdateDuration(timerIndex, Math.max(MS_IN_SECOND, duration - stepMs));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(null);
    if (!selectedDate || event.type === "dismissed") return;

    const newMoment = moment(selectedDate);
    if (showPicker === "start") onUpdateStart(timerIndex, newMoment);
    if (showPicker === "end") onUpdateEnd(timerIndex, newMoment);
    if (showPicker === "duration") {
      const dayStart = newMoment.clone().startOf("day");
      let newDur = newMoment.diff(dayStart, "ms");
      if (maxAllowedDuration && newDur > maxAllowedDuration) newDur = maxAllowedDuration;
      onUpdateDuration(timerIndex, newDur);
    }
  };

  const getStatusColor = () => {
    if (status === TimerStatus.Started) return { bg: "#e8f5e9", text: "#2e7d32" };
    if (status === TimerStatus.Paused) return { bg: "#fff3e0", text: "#e65100" };
    return { bg: "#ffebee", text: "#c62828" };
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.row}>
          <Text style={styles.subjectName}>{subjectName || t("timer")}</Text>
          {!isStopped && (
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.badgeText, { color: statusColor.text }]}>
                {status === TimerStatus.Started
                  ? t("running")
                  : status === TimerStatus.Paused
                    ? t("paused")
                    : t("stopped")}
              </Text>
            </View>
          )}
          {!isStopped && (
            <TouchableOpacity
              style={[styles.stopBtn, isStopping && styles.stopBtnDisabled]}
              onPress={handleStopTimer}
              disabled={isStopping || loading}
            >
              <Text style={styles.stopBtnText}>
                {isStopping ? t("stopping", "Stopping...") : t("stop_timer")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!single && (
          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onAddTimerAbove?.(timerIndex)}
              disabled={disableAddAbove}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={disableAddAbove ? palette.grey[300] : palette.main[600]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onAddTimerBelow?.(timerIndex)}
              disabled={disableAddBelow || isRunning}
            >
              <Ionicons
                name="arrow-down"
                size={18}
                color={disableAddBelow || isRunning ? palette.grey[300] : palette.main[600]}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setOpenDeleteConfirm(true)}>
              <Ionicons name="trash-outline" size={18} color="#d32f2f" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.timeRow}>
        <View style={styles.flex1}>
          <Text style={[styles.label, { color: palette.main[700] }]}>{t("start_time")}</Text>
          <TouchableOpacity
            style={[styles.timeInput, !!startError && styles.timeInputError]}
            onPress={() => setShowPicker("start")}
            disabled={isRunning || isStopping || loading}
          >
            <Ionicons name="time-outline" size={16} color={palette.main[600]} style={{ marginRight: 6 }} />
            <Text style={[styles.timeValueText, { color: palette.main[600] }]}>
              {startTimeValue.format(isDifferentDay ? "MM-DD HH:mm" : "HH:mm")}
            </Text>
          </TouchableOpacity>
          {!!startErrorMessage && <Text style={styles.errorText}>{startErrorMessage}</Text>}
        </View>

        <View style={styles.flex1}>
          <Text
            style={[
              styles.label,
              {
                color:
                  status === TimerStatus.Paused
                    ? "#ed6c02"
                    : status === TimerStatus.Stopped
                      ? "#d32f2f"
                      : "#666",
              },
            ]}
          >
            {status === TimerStatus.Paused ? t("paused") : t("end_time")}
          </Text>
          <TouchableOpacity
            style={[
              styles.timeInput,
              !stoppedTimeValue && { backgroundColor: palette.grey[100] },
              !!endError && styles.timeInputError,
            ]}
            onPress={() => stoppedTimeValue && setShowPicker("end")}
            disabled={isRunning || isStopping || !stoppedTimeValue || loading}
          >
            {stoppedTimeValue && (
              <Ionicons name="time-outline" size={16} color={palette.grey[600]} style={{ marginRight: 6 }} />
            )}
            <Text style={styles.timeValueText}>
              {stoppedTimeValue
                ? stoppedTimeValue.format(isDifferentDay ? "MM-DD HH:mm" : "HH:mm")
                : "--:--"}
            </Text>
          </TouchableOpacity>
          {!!endErrorMessage && <Text style={styles.errorText}>{endErrorMessage}</Text>}
        </View>
      </View>

      <View style={[styles.timeRow, { marginTop: 16 }]}>
        <View style={styles.flex1}>
          <Text style={styles.label}>{t("total_time")}</Text>
          <TouchableOpacity
            style={styles.timeInput}
            onPress={() => setShowPicker("duration")}
            disabled={isRunning || isStopping || loading}
          >
            <Ionicons name="hourglass-outline" size={16} color={palette.grey[600]} style={{ marginRight: 6 }} />
            <Text style={styles.timeValueText}>
              {moment().startOf("day").add(duration, "ms").format("HH:mm:ss")}
            </Text>
          </TouchableOpacity>
          {maxAllowedDuration !== undefined && (
            <Text style={styles.maxDurationText}>
              {t("max_time")}: {moment().startOf("day").add(maxAllowedDuration, "ms").format("HH:mm:ss")}
            </Text>
          )}
        </View>

        <View style={styles.adjusterContainer}>
          <Text style={[styles.label, { textAlign: "center" }]}>{t("adjust_total_duration_step")}</Text>
          <View style={styles.stepperControl}>
            <TouchableOpacity
              style={[
                styles.stepBtn,
                { backgroundColor: canDecrease && !isRunning && !isStopping && !loading ? palette.main[600] : palette.grey[200] },
              ]}
              onPress={handleDecreaseDuration}
              disabled={!canDecrease || isRunning || isStopping || loading}
            >
              <Ionicons
                name="remove"
                size={16}
                color={canDecrease && !isRunning && !isStopping && !loading ? "#fff" : palette.grey[400]}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.stepInput}
              value={stepMinutes}
              onChangeText={(val) => {
                const parsed = parseInt(val);
                if (val === "") { setStepMinutes(""); return; }
                if (isNaN(parsed)) return;
                if (parsed < 1) { setStepMinutes("1"); return; }
                if (parsed > 60) { setStepMinutes("60"); return; }
                setStepMinutes(String(parsed));
              }}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[
                styles.stepBtn,
                { backgroundColor: canIncrease && !isRunning && !isStopping && !loading ? palette.main[600] : palette.grey[200] },
              ]}
              onPress={handleIncreaseDuration}
              disabled={!canIncrease || isRunning || isStopping || loading}
            >
              <Ionicons
                name="add"
                size={16}
                color={canIncrease && !isRunning && !isStopping && !loading ? "#fff" : palette.grey[400]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={
            showPicker === "duration"
              ? moment().startOf("day").add(duration, "ms").toDate()
              : showPicker === "start"
                ? startTimeValue.toDate()
                : stoppedTimeValue?.toDate() ?? new Date()
          }
          mode="time"
          is24Hour={true}
          onChange={onDateChange}
        />
      )}

      {openDeleteConfirm && (
        <ConfirmDialog
          toggle={() => setOpenDeleteConfirm(false)}
          open={openDeleteConfirm}
          onConfirm={() => { setOpenDeleteConfirm(false); onRemoveTimer?.(timerIndex); }}
          onCancel={() => setOpenDeleteConfirm(false)}
          title={t("delete")}
          cancelText={t("cancel")}
          text={t("delete_timer_confirm")}
        />
      )}

      {openStopConfirm && (
        <ConfirmDialog
          toggle={() => setOpenStopConfirm(false)}
          open={openStopConfirm}
          onConfirm={confirmStop}
          onCancel={() => setOpenStopConfirm(false)}
          title={t("stop_timer")}
          cancelText={t("cancel")}
          text={t("stop_timer_confirm")}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  subjectName: { fontSize: 15, fontWeight: "700", color: "#1a1a1a" },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  stopBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d32f2f",
  },
  stopBtnDisabled: {
    borderColor: "#ccc",
  },
  stopBtnText: { fontSize: 10, fontWeight: "700", color: "#d32f2f" },
  actionIcons: { flexDirection: "row", alignItems: "center" },
  iconBtn: { padding: 6, marginLeft: 4 },
  timeRow: { flexDirection: "row", gap: 16 },
  flex1: { flex: 1 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 6, color: "#666" },
  timeInput: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  timeInputError: {
    borderColor: "#d32f2f",
    backgroundColor: "#fff5f5",
  },
  timeValueText: { fontSize: 14, fontWeight: "600", color: "#333" },
  errorText: { fontSize: 10, color: "#d32f2f", marginTop: 4 },
  maxDurationText: { fontSize: 10, color: "#666", marginTop: 4 },
  adjusterContainer: { flex: 1, justifyContent: "center" },
  stepperControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  stepInput: {
    width: 40,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 4,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  dialogBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dialogBtnDanger: {
    backgroundColor: "#d32f2f",
    borderColor: "#d32f2f",
  },
  dialogText: {
    fontSize: 14,
    color: "#333",
  },
  dialogBtnText: {
    fontSize: 14,
    color: "#555",
  },
  dialogBtnDangerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
});

export default TimerUpdateItem;