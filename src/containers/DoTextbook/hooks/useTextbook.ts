import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChangeAnswerTimeRequest,
  PreparedQuestionGroupResponse,
  PreparedQuestionResponse,
  SimplePreparedTextbookResponse
} from "../config/types";
import useTextbookSolving from "./useTextbookSolving";
import { useTextbookTimer } from "./useTextbookTimer";
import _ from "lodash";
import { isNull } from "../config/helpers";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getQuestionsTextbookApi, pauseOrFinished } from "../apiClients";
import { DATE_TIME_MIN_VALUE } from "@/utils/constants";
import { getErrorMessage, toast } from "@/utils/helpers";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { TextbookEditorType } from "@/utils/enums";
import { findNodeHandle, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ScrollView, UIManager, View } from "react-native";
import { setDataStorage } from "@/utils/storage";
import { useFocusEffect } from "@react-navigation/native";

type Props = {
  textbookId: string
  page?: string
}
const useTextbook = ({ textbookId, page }: Props) => {
  const { t } = useTranslation();
  const { user, setLoading } = useAuthStore()
  const firstLoadRef = useRef<boolean>(true);
  const [textbook, setTextbook] = useState<SimplePreparedTextbookResponse>();
  const [questionGroupList, setQuestionGroupList] = useState<
    PreparedQuestionGroupResponse[]
  >([]);
  const [questionList, setQuestionList] = useState<PreparedQuestionResponse[]>(
    []
  );
  const [isNotFoundTextbook, setNotFoundTextbook] = useState<boolean>();
  const [completedTasks, setCompletedTasks] = useState(0);
  const userId: number | undefined = user?.id;
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const questionRefs = useRef<Array<View | null>>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const sectionPositions = useRef<Record<number, number>>({}).current;
  const [activePage, setActivePage] = useState(0);

  const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    sectionPositions[index] = y;
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const sortedSections = Object.entries(sectionPositions)
      .map(([index, position]) => ({
        index: parseInt(index),
        position
      }))
      .sort((a, b) => a.position - b.position);

    for (let i = 0; i < sortedSections.length; i++) {
      const currentSection = sortedSections[i];
      const nextSection = sortedSections[i + 1];

      if (offsetY >= currentSection.position &&
        (nextSection === undefined || offsetY < nextSection.position)) {
        if (activePage !== currentSection.index) {
          setActivePage(currentSection.index);
        }
        break;
      }
    }
  };

  const scrollToPage = (page: string) => {
    if (scrollViewRef.current && sectionPositions[page as any] !== undefined) {
      setActivePage(parseInt(page))
      scrollViewRef.current.scrollTo({
        y: sectionPositions[page as any],
        animated: true
      });
    }
  };

  useEffect(() => {
    if (!!page) scrollToPage(page)
  }, [page])

  const scrollToNextQuestion = (index: number) => {

    const nextRef = questionRefs.current[index + 1]
    const scrollViewNode = scrollViewRef.current && findNodeHandle(scrollViewRef.current)

    if (nextRef && scrollViewNode) {
      toggleExpand(questionList[index + 1].id)

      setCurrentIndex(questionList[index + 1].questionOrder)
      UIManager.measureLayout(
        findNodeHandle(nextRef)!,
        scrollViewNode,
        () => {
          console.warn('MeasureLayout error')
        },
        (left, top, width, height) => {
          scrollViewRef.current?.scrollTo({ y: top - height, animated: true })
        }
      )
    }
  }

  const toggleExpand = (id: number | null) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const getQuestionsTextbook = async (showErrorMessage: boolean = false) => {
    if (!textbookId || !userId) return;

    setNotFoundTextbook(false);
    firstLoadRef.current && setLoading(true)

    try {
      const res = await getQuestionsTextbookApi(Number(textbookId));
      const data = res.data?.data;
      const responseTextbook: SimplePreparedTextbookResponse = {
        id: data?.id ?? 0,
        studentTextbookId: data?.studentTextbookId ?? 0,
        name: data?.name ?? "",
        lastAnswerTime: data?.lastAnswerTime ?? DATE_TIME_MIN_VALUE,
        startTime: data?.startTime ?? DATE_TIME_MIN_VALUE,
        totalAnswerTime: data?.totalAnswerTime ?? 0,
        stopTime: data?.stopTime ?? DATE_TIME_MIN_VALUE,
        type: data?.type ?? TextbookEditorType.Default
      };
      setTextbook(responseTextbook);
      const questions = _.flatMap(data?.questionGroups || [], "questions").map((i, index) => ({ ...i, questionIndex: index }));

      setQuestionGroupList(data?.questionGroups || []);
      setQuestionList(questions);
    } catch (err) {
      (firstLoadRef.current || showErrorMessage) &&
        toast.error(getErrorMessage(t, err));
      setNotFoundTextbook(true);
    }

    setLoading(false)
    if (firstLoadRef.current) firstLoadRef.current = false;
  };

  useEffect(() => {
    getQuestionsTextbook();
  }, [textbookId, userId]);

  const handleUpdateQuestionList = (questions: PreparedQuestionResponse[]) => {
    setQuestionList(questions);
  };

  const handleTextbookLastAnswerTime = (answerTime: string) => {
    setTextbook((state?: SimplePreparedTextbookResponse) => {
      if (!state) return undefined;
      return {
        ...state,
        lastAnswerTime: answerTime,
        totalAnswerTime: elapsedTime
      };
    });
  };

  const totalAnswerTime = textbook?.totalAnswerTime ?? 0;
  const { textbookElapsedTimeKey, elapsedTime, formattedTime } =
    useTextbookTimer({
      studyTime: totalAnswerTime,
      textbookId: Number(textbookId)
    });

  const { stopTimeKey, updateQuestionAnswer, updateQuestionStar } =
    useTextbookSolving({
      startTime: new Date().toISOString(),
      textbook,
      textbookId: Number(textbookId),
      totalAnswersTime: elapsedTime,
      questionList,
      updateQuestionList: handleUpdateQuestionList,
      updateTextbookLastTimeAnswer: handleTextbookLastAnswerTime,
    });

  const questionPage = questionGroupList.length;

  const totalTasks = questionList.length;
  useEffect(() => {
    const completedTasksCount = questionList.filter(
      (q) => q.selectedAnswers?.length || !isNull(q.textualAnswers)
    ).length;
    setCompletedTasks(completedTasksCount);
  }, [JSON.stringify(questionList)]);

  const handleApi = async () => {
    if (!textbook || !textbookId) return;
    try {
      const nowTime = new Date().toISOString();
      const currentElapsedTime = elapsedTime;
      const totalAnswersTime = Math.max(
        currentElapsedTime,
        textbook?.totalAnswerTime || 0
      );

      const req: ChangeAnswerTimeRequest = {
        totalAnswersTime,
        stopTime: nowTime
      };

      if (stopTimeKey) await setDataStorage(stopTimeKey, nowTime);
      if (textbookElapsedTimeKey) {
        await setDataStorage(
          textbookElapsedTimeKey,
          currentElapsedTime.toString()
        );
      }

      await pauseOrFinished(Number(textbookId), req);
    } catch (error) {
      console.error(
        `Failed to update last answer time for textbookId ${textbookId}:`,
        error
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        setExpandedId(null);
      };
    }, []))

  const onFinishedTextbook = async () => {
    await handleApi();
    navigate(Routes.Auth.Textbook);
  };

  return {
    t,
    currentIndex,
    expandedId,
    toggleExpand,
    questionRefs,
    scrollViewRef,
    questionGroupList,
    questionPage,
    textbook,
    handleLayout,
    activePage,
    handleScroll,
    setCurrentIndex,
    scrollToNextQuestion,
    updateQuestionAnswer,
    updateQuestionStar,
    questionList,
    isNotFoundTextbook,
    formattedTime,
    totalTasks,
    completedTasks,
    onFinishedTextbook
  };
};

export default useTextbook;
