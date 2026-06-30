import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';
import { Routes } from '@/navigators/RouteName';

import { answerQuestionExam, finishExam } from '@/containers/DoExam/apiClients';
import { toast } from '@/utils/helpers';
import { ExamStatus, QuestionAnswerType } from '@/utils/enums';
import MathRichInput from '@/components/Input/MathRichInput';
import usePopQuizTake from './hooks/usePopQuizTake';
import { navigate } from '@/navigators/NavigationHelpers';

const PopQuizTake = () => {
  const {
    t,
    setTextAnswers,
    quizId,
    code,
    studentExamSessionId,
    loading,
    nextLoading,
    questions,
    currentQuestionIndex,
    answers,
    textAnswers,
    elapsedTime,
    formatTime,
    setAnswers,
    setNextLoading,
    setCurrentQuestionIndex,
    setQuestions,
    sessionStartTime,
    setSessionStartTime,
    initialRunningTime,
    setInitialRunningTime,
    questionStartTime,
    getServerNow,
    setStudentExamSessionId,
    rowVersion,
    setRowVersion,
    user,
    quizInfo,
    isEditingMode,
    setIsEditingMode,
    editAnswers,
    setEditAnswers,
    editTextAnswers,
    setEditTextAnswers,
    saveLoading,
    handleSaveAnswers,
  } = usePopQuizTake();

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.main[500]} />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{t('no_questions_found')}</Text>
        <TouchableOpacity onPress={() => navigate(Routes.Auth.PopQuiz)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t('go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const selectedOptions = answers[currentQuestion.id] || [];

  const isShortAnswer = [
    QuestionAnswerType.ShortAnswer,
    QuestionAnswerType.OrderMatters,
    QuestionAnswerType.OrderDoesNotMatters,
    QuestionAnswerType.SynonymProcessing,
  ].includes(currentQuestion?.questionAnswerType);

  const isMultipleChoice = currentQuestion?.questionAnswerType === QuestionAnswerType.MultipleChoice;
  const isSingleChoice = !isShortAnswer && !isMultipleChoice;

  const optionCount = currentQuestion.answerCount || currentQuestion.numberOfAnswers || 5;
  const options = Array.from({ length: optionCount }, (_, i) => i + 1);

  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  const getHeaderTag = () => {
    if (isShortAnswer) return t('shortanswer') || 'Câu trả lời ngắn';
    if (isMultipleChoice) return t('multiplechoice') || 'Chọn nhiều đáp án';
    return t('singlechoice') || 'Chọn 1 đáp án';
  };

  const getHeaderSubtitle = () => {
    if (isShortAnswer) return t('enter_answer') || 'Nhập câu trả lời';
    if (isMultipleChoice) return t('select_multiple_answers') || 'Chọn tất cả đáp án đúng';
    return t('select_one_answer') || 'Chọn 1 đáp án đúng';
  };

  const handleSelectOption = (opt: number) => {
    setAnswers(prev => {
      const currentList = prev[currentQuestion.id] || [];
      if (isMultipleChoice) {
        if (currentList.includes(opt)) {
          return { ...prev, [currentQuestion.id]: currentList.filter(o => o !== opt) };
        } else {
          return { ...prev, [currentQuestion.id]: [...currentList, opt].sort((a, b) => a - b) };
        }
      } else {
        // Single Choice — replace
        return { ...prev, [currentQuestion.id]: [opt] };
      }
    });
  };

  const handleTextAnswerChange = (text: string, idx: number) => {
    setTextAnswers(prev => {
      const currentList = [...(prev[currentQuestion.id] || [''])];
      currentList[idx] = text;
      return { ...prev, [currentQuestion.id]: currentList };
    });
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    if (code) {
      try {
        setNextLoading(true);
        const now = getServerNow();
        const currentRunningTime = initialRunningTime + (now - sessionStartTime);
        const currentQuestionDurationIncrement = now - questionStartTime;

        // Build the questions payload including all questions to satisfy backend validation
        const questionsPayload = questions.map((q) => {
          const isQShort = [
            QuestionAnswerType.ShortAnswer,
            QuestionAnswerType.OrderMatters,
            QuestionAnswerType.OrderDoesNotMatters,
            QuestionAnswerType.SynonymProcessing,
          ].includes(q.questionAnswerType);

          const isCurrent = q.id === currentQuestion.id;
          const qSelected = isCurrent
            ? (isQShort ? [] : selectedOptions)
            : (answers[q.id] || []);
          const qTextual = isCurrent
            ? (isQShort ? (textAnswers[currentQuestion.id] || []) : [])
            : (textAnswers[q.id] || []);

          let qDuration = q.duration || 0;
          let qAnswerTime = q.answerTime ? new Date(q.answerTime).getTime() : 0;

          if (isCurrent) {
            qDuration += currentQuestionDurationIncrement;
            qAnswerTime = now;
          }

          const hasAnswer = (!isQShort && qSelected.length > 0) || (isQShort && qTextual.some(ans => ans.trim().length > 0));
          if (!hasAnswer) {
            qDuration = 0;
            qAnswerTime = 0;
          } else {
            if (qDuration <= 0) {
              qDuration = 1000;
            }
            if (qAnswerTime <= 0) {
              qAnswerTime = now;
            }
          }

          return {
            questionId: q.id,
            selectedAnswers: qSelected,
            textualAnswers: qTextual,
            duration: Math.round(qDuration),
            isStar: false,
            answerTime: qAnswerTime,
          };
        });

        const totalAnsweredTime = questionsPayload.reduce((sum, q) => sum + q.duration, 0);
        const finalRunningTime = Math.max(currentRunningTime, totalAnsweredTime);

        const body = {
          lastAnswerTime: now,
          runningTime: Math.round(finalRunningTime),
          rowVersion,
          questions: questionsPayload,
        };

        const res = await answerQuestionExam(code, body);
        if (res.data?.data?.rowVersion) {
          setRowVersion(res.data.data.rowVersion);
        }

        // Update local questions state with the new durations and answer times so future submissions have correct base values
        setQuestions((prev: any[]) => prev.map(q => {
          const payloadQ = questionsPayload.find(pq => pq.questionId === q.id);
          if (payloadQ) {
            return {
              ...q,
              selectedAnswers: payloadQ.selectedAnswers,
              textualAnswers: payloadQ.textualAnswers,
              duration: payloadQ.duration,
              answerTime: payloadQ.answerTime > 0 ? new Date(payloadQ.answerTime).toISOString() : undefined,
            };
          }
          return q;
        }));

        // Lock in the new running time
        setInitialRunningTime(finalRunningTime);
        setSessionStartTime(now);

        if (res.data?.status === 0) {
          throw new Error(res.data?.message || 'API Validation Error');
        }

        if (currentQuestionIndex === questions.length - 1) {
          try {
            const finishRes = await finishExam(code);
            const finishedStudentExamSessionId = finishRes.data?.data?.studentExamSessionId
              || finishRes.data?.studentExamSessionId
              || studentExamSessionId;
            if (finishedStudentExamSessionId) {
              setStudentExamSessionId(finishedStudentExamSessionId);
            }
            navigate(Routes.Auth.PopQuizResult, { code, studentExamSessionId: finishedStudentExamSessionId || studentExamSessionId });
          } catch (finishErr: any) {
            // If already finished or session expired, still navigate to result
            console.warn('[PopQuiz] finishExam error (navigating to result anyway):', finishErr?.response?.data || finishErr?.message);
            navigate(Routes.Auth.PopQuizResult, { code, studentExamSessionId });
          }
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
        }

      } catch (err: any) {
        console.error('Failed to submit answer', err?.response?.data || err);
        const errMsg =
          err?.response?.data?.detail || err?.response?.data?.message || err?.message || t('failed_to_save_answer') || '답변 저장에 실패했습니다';
        
        if (err?.response?.status === 420 || (err?.response?.status === 400 && errMsg.toLowerCase().includes('finish'))) {
          // toast.info(t('exam_has_been_finished_by_teacher'));
          navigate(Routes.Auth.PopQuizResult, { quizId, code, studentExamSessionId });
        } else {
          toast.error(errMsg);
        }
      } finally {
        setNextLoading(false);
      }
    } else if (quizId) {
      // Preview mode
      if (currentQuestionIndex === questions.length - 1) {
        toast.success(t('preview_finished') || '팝퀴즈 미리보기를 완료했습니다!');
        navigate(Routes.Auth.PopQuiz);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
      }
    }
  };

  const isCreator = quizInfo && 
    quizInfo.popQuizStatus !== ExamStatus.Completed && 
    (quizInfo.createdById === user?.superId || quizInfo.createdBy?.id === user?.superId || quizInfo.createdBy?.superId === user?.superId);

  const isPreviewMode = !code && !!quizId;

  const canProceed = isPreviewMode || (isShortAnswer
    ? (textAnswers[currentQuestion.id] || []).some(ans => ans.trim().length > 0)
    : selectedOptions.length > 0);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: palette.main[500] }} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigate(Routes.Auth.PopQuiz)} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.progressText}>{currentQuestionIndex + 1}/{questions.length}</Text>
        </View>
        <View style={styles.headerTagRow}>
          <Text style={styles.headerTag}>{getHeaderTag()}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {!!isCreator && (
              <TouchableOpacity
                onPress={() => setIsEditingMode(!isEditingMode)}
                style={styles.editModeToggleBtn}
                activeOpacity={0.7}
              >
                <Ionicons name={isEditingMode ? "close-circle" : "create-outline"} size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.editModeToggleText}>
                  {isEditingMode ? t('cancel_edit') : t('edit_answer')}
                </Text>
              </TouchableOpacity>
            )}
            {!!code && (
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.headerTitle}>{t('question') || '질문'} {currentQuestionIndex + 1}</Text>
        <Text style={styles.headerSubtitle}>{getHeaderSubtitle()}</Text>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {isEditingMode ? (
          isShortAnswer ? (
            /* ── Short Answer Edit Mode ── */
            <View style={styles.answersContainer}>
              {editTextAnswers.map((ans, idx) => (
                <View key={`edit-${currentQuestion.id}-${idx}`} style={styles.answerItem}>
                  <Text style={styles.answerLabel}>
                    {t('enter_correct_answers')} {idx + 1}
                  </Text>
                  <View style={styles.answerInputContainer}>
                    <MathRichInput
                      key={`edit-math-input-${currentQuestion.id}-${idx}`}
                      style={styles.mathInput}
                      initialValue={ans}
                      onChange={(text) => {
                        setEditTextAnswers(prev => {
                          const currentList = [...prev];
                          currentList[idx] = text;
                          return currentList;
                        });
                      }}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addTextAnswerBtn}
                onPress={() => setEditTextAnswers(prev => [...prev, ''])}
              >
                <Ionicons name="add" size={14} color={palette.main[500]} />
                <Text style={styles.addTextAnswerBtnText}>{t('add_answer_field')}</Text>
              </TouchableOpacity>
              {editTextAnswers.length > 1 && (
                <TouchableOpacity
                  style={[styles.addTextAnswerBtn, { borderColor: '#EF4444', marginTop: 8 }]}
                  onPress={() => setEditTextAnswers(prev => prev.slice(0, -1))}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text style={[styles.addTextAnswerBtnText, { color: '#EF4444' }]}>{t('delete') || 'Xoá'}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* ── Choice Edit Mode ── */
            options.map((opt) => {
              const isSelectedCorrect = editAnswers.includes(opt);
              return (
                <TouchableOpacity
                  key={`edit-opt-${opt}`}
                  style={[
                    styles.optionCard,
                    isSelectedCorrect && { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#ECFDF5' }
                  ]}
                  onPress={() => {
                    if (isMultipleChoice) {
                      setEditAnswers(prev => {
                        if (prev.includes(opt)) {
                          return prev.filter(o => o !== opt);
                        } else {
                          return [...prev, opt].sort((a, b) => a - b);
                        }
                      });
                    } else {
                      setEditAnswers([opt]);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  {/* Number badge */}
                  <View style={[
                    styles.optionNumber,
                    isSelectedCorrect && { backgroundColor: '#10B981' }
                  ]}>
                    <Text style={[
                      styles.optionNumberText,
                      isSelectedCorrect && { color: '#FFF' }
                    ]}>
                      {opt}
                    </Text>
                  </View>

                  {/* Label */}
                  <Text style={[
                    styles.optionText,
                    isSelectedCorrect && { color: '#10B981' }
                  ]}>
                    {t('option_number', { number: opt })} {isSelectedCorrect && `(${t('correct') || 'Đúng'})`}
                  </Text>

                  {/* Indicator */}
                  <View style={styles.indicatorWrapper}>
                    {isSingleChoice ? (
                      <View style={[styles.radioOuter, isSelectedCorrect && { borderColor: '#10B981' }]}>
                        {isSelectedCorrect && <View style={[styles.radioDot, { backgroundColor: '#10B981' }]} />}
                      </View>
                    ) : (
                      <View style={[styles.checkboxOuter, isSelectedCorrect && { borderColor: '#10B981', backgroundColor: '#10B981' }]}>
                        {isSelectedCorrect && <Ionicons name="checkmark" size={14} color="#FFF" />}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )
        ) : (
          /* ── Normal Solving Mode ── */
          isShortAnswer ? (
            <View style={styles.answersContainer}>
              {(textAnswers[currentQuestion.id] || Array.from({ length: currentQuestion.numberOfAnswers || currentQuestion.correctTextualAnswers?.length || 1 }, () => '')).map((ans, idx) => (
                <View key={`${currentQuestion.id}-${idx}`} style={styles.answerItem}>
                  <Text style={styles.answerLabel}>
                    {t('answer') || 'Trả lời'} {idx + 1}
                  </Text>
                  <View style={styles.answerInputContainer}>
                    <MathRichInput
                      key={`math-input-${currentQuestion.id}-${idx}`}
                      style={styles.mathInput}
                      initialValue={ans}
                      onChange={(text) => handleTextAnswerChange(text, idx)}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addTextAnswerBtn}
                onPress={() => setTextAnswers(prev => {
                  const currentList = prev[currentQuestion.id] || Array.from({ length: currentQuestion.numberOfAnswers || 1 }, () => '');
                  return { ...prev, [currentQuestion.id]: [...currentList, ''] };
                })}
              >
                <Ionicons name="add" size={14} color={palette.main[500]} />
                <Text style={styles.addTextAnswerBtnText}>{t('add_answer_field')}</Text>
              </TouchableOpacity>
              
              {((textAnswers[currentQuestion.id] || []).length > 1 || (!textAnswers[currentQuestion.id] && currentQuestion.numberOfAnswers > 1)) && (
                <TouchableOpacity
                  style={[styles.addTextAnswerBtn, { borderColor: '#EF4444', marginTop: 8 }]}
                  onPress={() => setTextAnswers(prev => {
                    const currentList = prev[currentQuestion.id] || Array.from({ length: currentQuestion.numberOfAnswers || 1 }, () => '');
                    return { ...prev, [currentQuestion.id]: currentList.slice(0, -1) };
                  })}
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <Text style={[styles.addTextAnswerBtnText, { color: '#EF4444' }]}>{t('delete')}</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            /* ── SingleChoice / MultipleChoice ── */
            options.map((opt) => {
              const isSelected = selectedOptions.includes(opt);
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.optionCard, isSelected && styles.optionCardActive]}
                  onPress={() => handleSelectOption(opt)}
                  activeOpacity={0.7}
                >
                  {/* Number badge */}
                  <View style={[styles.optionNumber, isSelected && styles.optionNumberActive]}>
                    <Text style={[styles.optionNumberText, isSelected && styles.optionNumberTextActive]}>
                      {opt}
                    </Text>
                  </View>

                  {/* Label */}
                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                    {t('option_number', { number: opt })}
                  </Text>

                  {/* Right indicator: radio circle (Single) or checkbox square (Multiple) */}
                  <View style={styles.indicatorWrapper}>
                    {isSingleChoice ? (
                      <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                        {isSelected && <View style={styles.radioDot} />}
                      </View>
                    ) : (
                      <View style={[styles.checkboxOuter, isSelected && styles.checkboxOuterActive]}>
                        {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )
        )}

        <Text style={styles.footerHint}>
          {isEditingMode
            ? t('editing_correct_answer_hint')
            : isShortAnswer
            ? (t('type_your_answer_hint') || 'Nhập câu trả lời vào ô trên')
            : (t('look_at_paper_and_select') || '시험지를 보고 여기서 답을 선택하세요')}
        </Text>
      </ScrollView>

      {isEditingMode ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: '#10B981' }]}
            onPress={handleSaveAnswers}
            disabled={saveLoading}
          >
            {saveLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.nextBtnText}>{t('save_answer')}</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        (canProceed || currentQuestionIndex > 0) && (
          <View style={[styles.footer, { flexDirection: 'row', gap: 12 }]}>
            {currentQuestionIndex > 0 && (
              <TouchableOpacity
                style={[styles.prevBtn, { flex: 1 }]}
                onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                disabled={nextLoading}
              >
                <Text style={styles.prevBtnText}>{t('previous')}</Text>
              </TouchableOpacity>
            )}
            {canProceed && (
              <TouchableOpacity
                style={[styles.nextBtn, { flex: 1 }]}
                onPress={handleNext}
                disabled={nextLoading}
              >
                {nextLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.nextBtnText}>
                    {currentQuestionIndex === questions.length - 1 ? (t('finish')) : (t('next'))}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )
      )}
    </View>
  );
};

export default PopQuizTake;

const styles = ScaledSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { justifyContent: 'center', alignItems: 'center' },
  editModeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms',
    marginRight: '8@ms',
  },
  editModeToggleText: { color: '#FFF', fontSize: '12@ms', fontWeight: 'bold' },
  addTextAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.main[500],
    borderStyle: 'dashed',
    borderRadius: '8@ms',
    paddingVertical: '12@ms',
    backgroundColor: '#FFF',
  },
  addTextAnswerBtnText: {
    color: palette.main[500],
    fontWeight: 'bold',
    fontSize: '14@ms',
    marginLeft: '6@ms',
  },
  header: {
    backgroundColor: palette.main[500],
    paddingHorizontal: '20@ms',
    paddingBottom: '24@ms',
    paddingTop: '12@ms',
    borderBottomLeftRadius: '24@ms',
    borderBottomRightRadius: '24@ms',
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: '24@ms' },
  closeButton: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '16@ms',
  },
  progressBarBg: {
    flex: 1,
    height: '6@ms',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '3@ms',
    marginRight: '12@ms',
  },
  progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: '3@ms' },
  progressText: { color: '#FFF', fontWeight: 'bold', fontSize: '12@ms' },
  headerTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8@ms',
  },
  headerTag: {
    color: '#FFF',
    fontSize: '12@ms',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: '10@ms',
    paddingVertical: '3@ms',
    borderRadius: '10@ms',
    overflow: 'hidden',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms',
  },
  timerText: { color: '#FFF', fontSize: '12@ms', fontWeight: 'bold' },
  headerTitle: { color: '#FFF', fontSize: '28@ms', fontWeight: 'bold', marginBottom: '8@ms' },
  headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: '13@ms' },
  body: { flex: 1 },
  bodyContent: { padding: '20@ms' },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: '12@ms',
    padding: '16@ms',
    marginBottom: '12@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  optionCardActive: { borderColor: palette.main[500], borderWidth: 2, backgroundColor: '#F9F5FF' },
  optionNumber: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '8@ms',
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12@ms',
  },
  optionNumberActive: { backgroundColor: palette.main[500] },
  optionNumberText: { color: palette.main[500], fontWeight: 'bold', fontSize: '15@ms' },
  optionNumberTextActive: { color: '#FFF' },
  optionText: { flex: 1, fontSize: '15@ms', fontWeight: '600', color: '#374151' },
  optionTextActive: { color: palette.main[500] },
  indicatorWrapper: { marginLeft: '8@ms' },
  radioOuter: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '10@ms',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  radioOuterActive: { borderColor: palette.main[500] },
  radioDot: {
    width: '10@ms',
    height: '10@ms',
    borderRadius: '5@ms',
    backgroundColor: palette.main[500],
  },
  checkboxOuter: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '4@ms',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxOuterActive: { borderColor: palette.main[500], backgroundColor: palette.main[500] },
  answersContainer: { marginBottom: '16@ms' },
  answerItem: { marginBottom: '20@ms' },
  answerLabel: { fontSize: '13@ms', fontWeight: '600', color: '#374151', marginBottom: '8@ms' },
  answerInputContainer: { flexDirection: 'row', alignItems: 'center' },
  mathInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '8@ms',
    flex: 1,
    backgroundColor: '#FFF',
    minHeight: '100@ms',
  },
  footerHint: {
    textAlign: 'center',
    color: palette.grey[400],
    fontSize: '12@ms',
    marginTop: '16@ms',
    marginBottom: '8@ms',
  },
  errorText: { color: palette.grey[600], fontSize: '16@ms', fontWeight: 'bold', marginBottom: '16@ms' },
  backBtn: {
    backgroundColor: palette.main[500],
    borderRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingVertical: '10@ms',
  },
  backBtnText: { color: '#FFF', fontWeight: 'bold' },
  footer: { padding: '20@ms', backgroundColor: '#F8F9FA' },
  nextBtn: {
    backgroundColor: palette.main[500],
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
    alignItems: 'center',
  },
  nextBtnText: { color: '#FFF', fontSize: '16@ms', fontWeight: 'bold' },
  prevBtn: {
    borderWidth: 1.5,
    borderColor: palette.main[500],
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  prevBtnText: { color: palette.main[500], fontSize: '16@ms', fontWeight: 'bold' },
});
