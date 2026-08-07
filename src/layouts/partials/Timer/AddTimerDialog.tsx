import React, { FC, useState, useEffect } from "react";
import { Modal, 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Timer } from "../../configs/types";
import { TimerStatus } from "@/utils/enums";
import { DATE_TIME_MIN_VALUE } from "@/utils/constants";
import TimerUpdateItem from "./TimerUpdateItem";
import { ScaledSheet } from 'react-native-size-matters'

export interface AddTimerDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (timer: Timer) => void;
    selectedDate?: moment.Moment;
    addParams?: {
        index: number;
        position: "above" | "below";
        anchorTimer: Timer;
        minStartTime: moment.Moment;
        maxEndTime: moment.Moment;
    };
    subjectId?: number;
    subjectName?: string;
}

const AddTimerDialog: FC<AddTimerDialogProps> = ({
    open,
    onClose,
    onAdd,
    selectedDate,
    addParams,
    subjectId,
    subjectName
}) => {
    const { t } = useTranslation();
    const [hasError, setHasError] = useState(false);

    const createDefaultTimer = (): Timer => {
        const base = addParams 
            ? (addParams.position === "above" ? addParams.maxEndTime.clone() : addParams.minStartTime.clone()) 
            : (selectedDate ? selectedDate.clone() : moment());
        
        let start, end;
        if (addParams) {
            if (addParams.position === "above") {
                end = addParams.maxEndTime.clone();
                start = moment.max(addParams.minStartTime, end.clone().subtract(30, "minutes"));
            } else {
                start = addParams.minStartTime.clone();
                end = moment.min(addParams.maxEndTime, start.clone().add(30, "minutes"));
            }
        } else {
            start = base.clone().set({ hour: 0, minute: 0, second: 0 });
            end = start.clone().add(30, "minutes");
        }

        return {
            id: 0,
            subjectId: subjectId || 0,
            rowVersion: "",
            subjectName: subjectName || "",
            status: TimerStatus.Stopped,
            duration: end.diff(start, 'milliseconds'),
            startTime: start.utc().toISOString(),
            stoppedAt: end.utc().toISOString(),
            lastResumeTime: DATE_TIME_MIN_VALUE,
            lastPauseTime: DATE_TIME_MIN_VALUE,
            limitedTime: 0,
            limitedTimeReached: false
        };
    };

    const [timerData, setTimerData] = useState<Timer>(createDefaultTimer());

    useEffect(() => {
        if (open) {
            setTimerData(createDefaultTimer());
            setHasError(false);
        }
    }, [open, selectedDate]);

    const handleUpdateStart = (_: number, newTime: moment.Moment) => {
        const oldStartTime = moment.utc(timerData.startTime);
        const newStartTimeStr = newTime.utc().toISOString();
        const diff = oldStartTime.diff(newTime, 'milliseconds');
        let newDuration = Math.max(0, timerData.duration + diff);
        
        const endTimeStr = timerData.status === TimerStatus.Stopped ? timerData.stoppedAt : timerData.lastPauseTime;
        if (endTimeStr && endTimeStr !== DATE_TIME_MIN_VALUE) {
            const maxDuration = moment.utc(endTimeStr).diff(newTime, 'milliseconds');
            newDuration = Math.min(newDuration, Math.max(0, maxDuration));
        }
        setTimerData({ ...timerData, startTime: newStartTimeStr, duration: newDuration });
    };

    const handleUpdateEnd = (_: number, newTime: moment.Moment) => {
        const oldEndTimeStr = timerData.status === TimerStatus.Stopped ? timerData.stoppedAt : timerData.lastPauseTime;
        if (!oldEndTimeStr || oldEndTimeStr === DATE_TIME_MIN_VALUE) return;
        const oldEndTime = moment.utc(oldEndTimeStr);
        const newEndTimeStr = newTime.utc().toISOString();
        const diff = newTime.diff(oldEndTime, 'milliseconds');
        let newDuration = Math.max(0, timerData.duration + diff);
        
        const maxDuration = newTime.diff(moment.utc(timerData.startTime), 'milliseconds');
        newDuration = Math.min(newDuration, Math.max(0, maxDuration));

        if (timerData.status === TimerStatus.Stopped) {
            setTimerData({ ...timerData, stoppedAt: newEndTimeStr, duration: newDuration });
        } else {
            setTimerData({ ...timerData, lastPauseTime: newEndTimeStr, duration: newDuration });
        }
    };

    return (
        <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>{t("add_timer")}</Text>

                    <ScrollView style={styles.content}>
                        {addParams && (
                            <View style={styles.anchorBox}>
                                <Text style={styles.anchorTitle}>{t("anchor_timer")}:</Text>
                                <Text style={styles.anchorText}>
                                    {moment.utc(addParams.anchorTimer.startTime).local().format("HH:mm")} - 
                                    {(() => {
                                        const time = addParams.anchorTimer.status === TimerStatus.Stopped 
                                            ? addParams.anchorTimer.stoppedAt 
                                            : addParams.anchorTimer.lastPauseTime;
                                        return (time && time !== DATE_TIME_MIN_VALUE) 
                                            ? moment.utc(time).local().format("HH:mm") 
                                            : t("running");
                                    })()}
                                </Text>
                            </View>
                        )}

                        <TimerUpdateItem
                            data={timerData}
                            timerIndex={0}
                            onUpdateStart={handleUpdateStart}
                            onUpdateEnd={handleUpdateEnd}
                            onUpdateDuration={(_idx, dur) => setTimerData({ ...timerData, duration: dur })}
                            onError={(_idx, err) => setHasError(err)}
                            minAllowedStartTime={addParams?.minStartTime}
                            maxAllowedEndTime={addParams?.maxEndTime}
                            single
                        />
                    </ScrollView>

                    <View style={styles.actions}>
                        <TouchableOpacity onPress={onClose} style={styles.btnSecondary}>
                            <Text style={styles.btnTextSecondary}>{t("cancel")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => !hasError && onAdd(timerData)} 
                            disabled={hasError}
                            style={[styles.btnPrimary, hasError && styles.btnDisabled]}
                        >
                            <Text style={styles.btnTextPrimary}>{t("save")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        maxWidth: '500@ms',
        backgroundColor: 'white',
        borderRadius: '8@ms',
        padding: '16@ms',
        maxHeight: '80%',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: 'bold',
        marginBottom: '16@ms',
    },
    content: {
        marginBottom: '16@ms',
    },
    anchorBox: {
        backgroundColor: '#e3f2fd',
        padding: '12@ms',
        borderRadius: '4@ms',
        marginBottom: '16@ms',
    },
    anchorTitle: {
        fontWeight: '600',
        fontSize: '14@ms',
        color: '#01579b',
    },
    anchorText: {
        fontSize: '14@ms',
        color: '#01579b',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: '12@ms',
    },
    btnSecondary: {
        paddingVertical: '8@ms',
        paddingHorizontal: '16@ms',
    },
    btnTextSecondary: {
        color: '#757575',
        fontWeight: '600',
    },
    btnPrimary: {
        backgroundColor: '#2196f3',
        paddingVertical: '8@ms',
        paddingHorizontal: '20@ms',
        borderRadius: '4@ms',
    },
    btnDisabled: {
        backgroundColor: '#bdbdbd',
    },
    btnTextPrimary: {
        color: 'white',
        fontWeight: '600',
    },
});

export default AddTimerDialog;