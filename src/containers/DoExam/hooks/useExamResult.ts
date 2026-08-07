
import { useEffect, useState, useMemo } from "react";
import { getExamResult } from "../apiClients/index"
import { QuestionResponse, ResolveType } from "../config/types";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import { useTranslation } from "react-i18next";
import { AnswerResponseSignal } from "@/utils/enums";


type Props = {
    examCode: string
}

const useExamResult = ({ examCode }: Props ) => { 
    const { language, setLoading  } = useAuthStore()
    const { t } = useTranslation();
    const [infoStudent, setInfoStudent] = useState<any>();
    const [infoExam, setInfoExam] = useState<any>();
    const [infoQuestionAnswer, setInfoQuestionAnswer] = useState<QuestionResponse[]>([]);
    const [duration, setDuration] = useState<string>()

    const handleCheckExamStatus = async () => {
        if(!examCode) return
        setLoading(true)
        await getStudentExamResult()
        setLoading(false)
    }

    const getStudentExamResult = async () => {
        try {
            const res = await getExamResult(examCode);
            const data = res.data?.data;
            let examInfo = {
                id: data?.id,
                title: data?.title,
                startTime: data?.startTime,
                finishTime: data?.finishTime,
                teacherName: data?.teacherName,
                teacherAvatar: data?.teacherAvatar,
                placeOrder: data?.placeOrder,
                totalStudent: data?.totalStudent,
                totalTime: data?.totalTime || 0,
                teacherId: data?.teacherId
            }
            const questions: QuestionResponse[] = data?.questions || []
            setInfoQuestionAnswer(questions)
            setInfoStudent(data?.student);
            setInfoExam(examInfo)
            setDuration(data?.duration)
        } catch(error: any) {
            console.log({error});
            toast.error(getErrorMessage(t, error))
        }
    }

    useEffect(() => {
        handleCheckExamStatus();
    }, [examCode]);

    const getResolveTimeType = (question: any) => {
        if(typeof question?.answerResponseSignal != 'number') return ResolveType.Empty
        switch (question?.answerResponseSignal) {
            case AnswerResponseSignal.Purple:
                return ResolveType.VeryHigh
            case AnswerResponseSignal.Black:
                return ResolveType.VeryLow
            case AnswerResponseSignal.Green:
                return ResolveType.Low
            case AnswerResponseSignal.Red:
                return ResolveType.High
            default:
                return ResolveType.Medium
        }
    }

    const liveExamTotalTime = useMemo(() => {
        if(!duration) return ""
        var times = duration.split(':');
        return t('mins_mins', { mins : (+times[0])*60 + (+times[1])})
    }, [duration])
    
    const totalTime = useMemo(() => {
        if(!infoQuestionAnswer?.length) return `0${t("seconds")}`
        const totalTime = infoQuestionAnswer.reduce((val: number, current: any) => val + Math.round(current?.duration || 0), 0)
        return totalTime < 60 ? `${totalTime}${t("seconds")}` : t("mins_mins_seconds_seconds", {
            mins: Math.floor(totalTime/60),
            seconds: totalTime % 60
        })
    }, [JSON.stringify(infoQuestionAnswer), language])
    
    const series = useMemo(() => {
        let index = 0;
        const dataListBoth = Array.from({length: 45}, (_,i)=> {
            if (index % 14 === 0) { index = 0 }
            let objNew: any = {
                x: `<View style={{ fontWeight: "bold" }}>${t("problem")}</View>: ${(i + 1)}`,
                z: 0
            }
            if (i < infoQuestionAnswer.length) {
                objNew["y"] = getResolveTimeType(infoQuestionAnswer[i])
                objNew["t"] = `<View style={{ fontWeight: "bold" }}>${t("problem_solving_time")}</View>: ${(infoQuestionAnswer[i]?.duration || 0)?.toFixed(1)}`
                objNew["z"] = `<View style={{ fontWeight: "bold" }}>${t("problem_solving_time")}</View>: ${infoQuestionAnswer[i]?.classAverageTime?.toFixed(1)}`
            } else {
                objNew["y"] = 0;
            }
                index ++;
                return objNew;
            })
        return Array.from({length: 4}, (_,i)=>({
            name: '',
            data: dataListBoth.slice(i * 14, i * 14 + 14)
        })).reverse()
    }, [language, JSON.stringify(infoQuestionAnswer)])

    return {
        totalTime,
        infoExam,
        infoStudent,
        infoQuestionAnswer,
        liveExamTotalTime,
        series
    }
}
export default useExamResult;