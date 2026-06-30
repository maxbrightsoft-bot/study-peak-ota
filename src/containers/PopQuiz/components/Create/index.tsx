import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView, ActivityIndicator, Share } from 'react-native';
import { palette } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';

import { QuestionAnswerType } from '@/utils/enums';
import MathRichInput from '@/components/Input/MathRichInput';
import usePopQuizCreate from './hooks/usePopQuizCreate';
import CustomSelect from '@/components/Select/CustomSelect';
import { toast } from '@/utils/helpers';
import { navigate } from '@/navigators/NavigationHelpers';
import { Routes } from '@/navigators/RouteName';

const PopQuizCreate = () => {
  const {
    t,
    step,
    subjects,
    setSubject,
    loadingSubjects,
    categories,
    loadingCategories,
    isCreating,
    handleCopyCode,
    handleShareLink,
    handlePreviewQuiz,
    subCategory,
    subCategories,
    loadingSubCategories,
    questionType,
    questionTypes,
    loadingQuestionTypes,
    categoryOptions,
    subCategoryOptions,
    questionTypeOptions,
    fetchCategories,
    fetchSubCategories,
    fetchQuestionTypes,
    debounceFetchCategories,
    debounceFetchSubCategories,
    debounceFetchQuestionTypes,
    questions,
    changeQuestionType,
    handleNext,
    handlePrev,
    handleClose,
    title,
    setTitle,
    subject,
    category,
    setCategory,
    setQuestionType,
    setSubCategory,
    setQuestionCount,
    questionCount,
    solveTarget,
    setSolveTarget,
    setQuestions,
    createdQuizCode
  } = usePopQuizCreate()

  const renderHeader = () => {
    const titles = [t('make_pop_quiz'), t('enter_answers'), t('share')];
    const subtitles = [t('pop_quiz_create_desc'), t('pop_quiz_create_desc'), ''];

    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.dots}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
            ))}
          </View>
        </View>
        <Text style={styles.headerTitle}>{titles[step - 1]}</Text>
        {subtitles[step - 1] ? (
          <Text style={styles.headerSubtitle}>{subtitles[step - 1]}</Text>
        ) : null}
      </View>
    );
  };

  const renderStep1 = () => (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      <Text style={styles.label}>{t('pop_quiz_title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('pop_quiz_title_placeholder') as string}
        placeholderTextColor={palette.grey[400]}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { marginTop: 24 }]}>{t('subject')}</Text>
      <View style={styles.subjectsContainer}>
        {loadingSubjects ? (
          <ActivityIndicator size="small" color={palette.main[500]} />
        ) : subjects?.length > 0 ? (
          subjects.map((s, idx) => {
            const isSelected = subject?.id === s.id;
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.subjectChip,
                  isSelected ? styles.subjectChipActive : { backgroundColor: ['#F3E8FF', '#DBEAFE', '#FCE7F3', '#FEF3C7', '#D1FAE5', '#F3E8FF'][idx % 6] }
                ]}
                onPress={() => setSubject(s)}
              >
                <Text style={[styles.subjectText, isSelected && styles.subjectTextActive]}>{s.name || s.title}</Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={{ color: palette.grey[500] }}>{t('no_subjects_found')}</Text>
        )}
      </View>

      {subject && (
        <>
          <Text style={[styles.label, { marginTop: 24 }]}>{t('category') || 'Category'}</Text>
          <CustomSelect
            value={category?.superId || category?.id}
            onValueChange={setCategory}
            options={categoryOptions}
            placeholder={t('select_category') || 'Select Category'}
            emptyText={t('no_categories_found') || 'No categories found'}
            search={true}
            searchPlaceholder={t('search') || 'Search'}
            maxHeight={250}
            onChangeText={debounceFetchCategories}
            onFocus={() => {
              if (subject?.id) {
                fetchCategories(subject.id);
              }
            }}
          />
        </>
      )}

      {subject && (
        <>
          <Text style={[styles.label, { marginTop: 24 }]}>{t('sub_category')}</Text>
          <CustomSelect
            value={subCategory?.superId || subCategory?.id}
            onValueChange={setSubCategory}
            options={subCategoryOptions}
            placeholder={t('select_subcategory')}
            emptyText={t('no_subcategories_found')}
            search={true}
            searchPlaceholder={t('search')}
            maxHeight={250}
            onChangeText={debounceFetchSubCategories}
            onFocus={() => {
              if (subject?.id) {
                fetchSubCategories(subject.id, category?.id);
              }
            }}
          />
        </>
      )}

      {subject && (
        <>
          <Text style={[styles.label, { marginTop: 24 }]}>{t('question_type')}</Text>
          <CustomSelect
            value={questionType?.id}
            onValueChange={setQuestionType}
            options={questionTypeOptions}
            placeholder={t('select_question_type')}
            emptyText={t('no_question_types_found')}
            search={true}
            searchPlaceholder={t('search')}
            maxHeight={250}
            onChangeText={debounceFetchQuestionTypes}
            onFocus={() => {
              if (subject?.id) {
                fetchQuestionTypes(subject.id, category?.id, subCategory?.id);
              }
            }}
          />
        </>
      )}

      <Text style={[styles.label, { marginTop: 24 }]}>{t('number_of_questions')}</Text>
      <View style={styles.counterContainer}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => setQuestionCount(Math.max(1, questionCount - 1))}
        >
          <Ionicons name="remove" size={20} color={palette.grey[600]} />
        </TouchableOpacity>
        <Text style={styles.counterText}><Text style={{ fontWeight: 'bold', fontSize: 20 }}>{questionCount}</Text> {t('quiz_count_unit')}</Text>
        <TouchableOpacity
          style={[styles.counterBtn, { backgroundColor: palette.main[500] }]}
          onPress={() => setQuestionCount(questionCount + 1)}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      {questions.map((q, index) => {
        const isShort = [
          QuestionAnswerType.ShortAnswer,
          QuestionAnswerType.OrderMatters,
          QuestionAnswerType.OrderDoesNotMatters,
          QuestionAnswerType.SynonymProcessing
        ].includes(q.questionAnswerType);

        return (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.questionTitle}>{t('question')} {index + 1}</Text>

              <View style={{ flex: 1 }} />

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  const newQ = questions.filter(item => item.id !== q.id);
                  setQuestions(newQ);
                  setQuestionCount(newQ.length);
                }}
              >
                <Ionicons name="trash-outline" size={16} color={palette.grey[500]} />
              </TouchableOpacity>
            </View>

            <View style={styles.typeToggle}>
              <TouchableOpacity
                style={q.questionAnswerType === QuestionAnswerType.SingleChoice ? styles.typeToggleActive : styles.typeToggleInactive}
                onPress={() => changeQuestionType(index, QuestionAnswerType.SingleChoice)}
              >
                <Text style={q.questionAnswerType === QuestionAnswerType.SingleChoice ? styles.typeToggleTextActive : styles.typeToggleText}>
                  {t('singlechoice')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={q.questionAnswerType === QuestionAnswerType.MultipleChoice ? styles.typeToggleActive : styles.typeToggleInactive}
                onPress={() => changeQuestionType(index, QuestionAnswerType.MultipleChoice)}
              >
                <Text style={q.questionAnswerType === QuestionAnswerType.MultipleChoice ? styles.typeToggleTextActive : styles.typeToggleText}>
                  {t('multiplechoice')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={isShort ? styles.typeToggleActive : styles.typeToggleInactive}
                onPress={() => changeQuestionType(index, QuestionAnswerType.ShortAnswer)}
              >
                <Text style={isShort ? styles.typeToggleTextActive : styles.typeToggleText}>
                  {t('shortanswer')}
                </Text>
              </TouchableOpacity>
            </View>

            {!isShort ? (
              <View style={styles.optionsContainer}>
                {[1, 2, 3, 4, 5].map(opt => {
                  const isSelected = q.correctAnswers?.includes(opt);
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.optionBtn, isSelected && styles.optionBtnActive]}
                      onPress={() => {
                        const newQ = [...questions];
                        const currentAnswers = newQ[index].correctAnswers || [];
                        if (q.questionAnswerType === QuestionAnswerType.MultipleChoice) {
                          if (currentAnswers.includes(opt)) {
                            if (currentAnswers.length > 1) {
                              newQ[index].correctAnswers = currentAnswers.filter((a: any) => a !== opt);
                            } else {
                              toast.error(t('must_have_at_least_one_correct_answer'));
                            }
                          } else {
                            newQ[index].correctAnswers = [...currentAnswers, opt].sort((a, b) => a - b);
                          }
                        } else {
                          newQ[index].correctAnswers = [opt];
                        }
                        setQuestions(newQ);
                      }}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.textAnswersContainer}>
                {(q.correctTextualAnswers || [""]).map((ans: string, aIdx: number) => (
                  <View key={aIdx} style={styles.textAnswerRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.correctAnswerLabel}>
                        {t('correct_answer')} {aIdx + 1}
                      </Text>
                      <MathRichInput
                        key={`math-input-${q.id}-${aIdx}`}
                        style={styles.mathInput}
                        initialValue={ans}
                        onChange={(val) => {
                          const newQ = [...questions];
                          const newAns = [...(newQ[index].correctTextualAnswers || [""])];
                          newAns[aIdx] = val;
                          newQ[index].correctTextualAnswers = newAns;
                          setQuestions(newQ);
                        }}
                      />
                    </View>
                    {(q.correctTextualAnswers || []).length > 1 && (
                      <TouchableOpacity
                        style={styles.textAnswerDeleteBtn}
                        onPress={() => {
                          const newQ = [...questions];
                          const newAns = newQ[index].correctTextualAnswers.filter((_: any, idx: number) => idx !== aIdx);
                          newQ[index].correctTextualAnswers = newAns;
                          if (newAns.length === 1 && [QuestionAnswerType.OrderMatters, QuestionAnswerType.OrderDoesNotMatters, QuestionAnswerType.SynonymProcessing].includes(newQ[index].questionAnswerType)) {
                            newQ[index].questionAnswerType = QuestionAnswerType.ShortAnswer;
                          }
                          setQuestions(newQ);
                        }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addTextAnswerBtn}
                  onPress={() => {
                    const newQ = [...questions];
                    const newAns = [...(newQ[index].correctTextualAnswers || [""]), ""];
                    newQ[index].correctTextualAnswers = newAns;
                    if (newAns.length === 2 && newQ[index].questionAnswerType === QuestionAnswerType.ShortAnswer) {
                      newQ[index].questionAnswerType = QuestionAnswerType.OrderMatters;
                    }
                    setQuestions(newQ);
                  }}
                >
                  <Ionicons name="add" size={14} color={palette.main[500]} />
                  <Text style={styles.addTextAnswerBtnText}>
                    {t('add_answer_field')}
                  </Text>
                </TouchableOpacity>

                {q.correctTextualAnswers && q.correctTextualAnswers.length >= 2 && (
                  <View style={styles.compareTypeContainer}>
                    <Text style={styles.compareTypeLabel}>
                      {t('compare_type')}:
                    </Text>
                    <View style={styles.compareChipsRow}>
                      {[
                        { label: t('order_matters'), value: QuestionAnswerType.OrderMatters },
                        { label: t('order_does_not_matter'), value: QuestionAnswerType.OrderDoesNotMatters },
                        { label: t('synonym_processing'), value: QuestionAnswerType.SynonymProcessing },
                      ].map((type) => {
                        const isSelected = q.questionAnswerType === type.value;
                        return (
                          <TouchableOpacity
                            key={type.value}
                            style={[styles.compareChip, isSelected && styles.compareChipActive]}
                            onPress={() => {
                              const newQ = [...questions];
                              newQ[index].questionAnswerType = type.value;
                              setQuestions(newQ);
                            }}
                          >
                            <Text style={[styles.compareChipText, isSelected && styles.compareChipTextActive]}>
                              {type.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={styles.questionFooter}>
              <Text style={styles.questionHint}>
                {!isShort ? t('tap_to_select_answer') : (t('enter_correct_answers'))}
              </Text>
              {!isShort && (
                <TouchableOpacity>
                  <Text style={styles.viewMoreText}>{t('five_options')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.addQuestionBtn}
        onPress={() => {
          setQuestions([
            ...questions,
            {
              id: Date.now(),
              questionAnswerType: QuestionAnswerType.SingleChoice,
              numberOfAnswers: 5,
              correctAnswers: [1],
              correctTextualAnswers: [],
              score: 1,
            }
          ]);
          setQuestionCount(questions.length + 1);
        }}
      >
        <Ionicons name="add" size={16} color={palette.main[500]} />
        <Text style={styles.addQuestionText}>{t('add_question')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={24} color="#FFF" />
      </View>
      <Text style={styles.successTitle}>{t('pop_quiz_created_success')}</Text>
      <Text style={styles.successSubtitle}>{t('question_added_mock', { count: questions.length })}</Text>

      <Text style={styles.label}>{t('who_will_solve')}</Text>
      <View style={styles.targetContainer}>
        <TouchableOpacity
          style={solveTarget === 'child' ? styles.targetBtnActive : styles.targetBtn}
          onPress={() => setSolveTarget('child')}
        >
          <Text style={solveTarget === 'child' ? styles.targetTextActive : styles.targetText}>{t('my_child')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={solveTarget === 'friend' ? styles.targetBtnActive : styles.targetBtn}
          onPress={() => setSolveTarget('friend')}
        >
          <Text style={solveTarget === 'friend' ? styles.targetTextActive : styles.targetText}>{t('friend')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={solveTarget === 'group' ? styles.targetBtnActive : styles.targetBtn}
          onPress={() => setSolveTarget('group')}
        >
          <Text style={solveTarget === 'group' ? styles.targetTextActive : styles.targetText}>{t('study_group')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={solveTarget === 'myself' ? styles.targetBtnActive : styles.targetBtn}
          onPress={() => setSolveTarget('myself')}
        >
          <Text style={solveTarget === 'myself' ? styles.targetTextActive : styles.targetText}>{t('myself')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>{t('join_code')}</Text>
        <Text style={styles.codeText}>{createdQuizCode && typeof createdQuizCode === 'string' && createdQuizCode !== 'true' ? String(createdQuizCode).split('').join(' ') : 'L V M U 6'}</Text>
        <TouchableOpacity style={styles.copyBtn} onPress={handleCopyCode}>
          <Ionicons name="copy-outline" size={14} color="#FFF" />
          <Text style={styles.copyBtnText}>{t('copy_code')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.shareRow}>
        <TouchableOpacity style={styles.linkShareBtn} onPress={handleShareLink}>
          <Ionicons name="link-outline" size={16} color={palette.grey[600]} />
          <Text style={styles.linkShareText}>{t('share_link')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconShareBtn} onPress={handleShareLink}>
          <Ionicons name="qr-code-outline" size={20} color={palette.main[500]} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconShareBtn, { backgroundColor: '#FEE500', borderColor: '#FEE500' }]}
          onPress={handleShareLink}
        >
          <Ionicons name="chatbubble" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.previewBtn} onPress={handlePreviewQuiz}>
        <Ionicons name="play" size={14} color={palette.main[500]} />
        <Text style={styles.previewBtnText}>{t('preview_quiz')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: palette.main[500] }} />
      {renderHeader()}

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      <View style={styles.footer}>
        {step === 1 && (
          <TouchableOpacity style={styles.nextBtnFull} onPress={handleNext}>
            <Text style={styles.nextBtnText}>{t('next')} {'>'}</Text>
          </TouchableOpacity>
        )}

        {step === 2 && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.prevBtn} onPress={handlePrev} disabled={isCreating}>
              <Text style={styles.prevBtnText}>{'<'} {t('previous')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtnFull, { flex: 1, marginLeft: 12 }, isCreating && { opacity: 0.7 }]}
              onPress={handleNext}
              disabled={isCreating}
            >
              <Text style={styles.nextBtnText}>{isCreating ? t('creating_pop_quiz') : `${t('next')} →`}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <TouchableOpacity style={styles.nextBtnFull} onPress={() => navigate(Routes.Auth.PopQuiz)}>
            <Text style={styles.nextBtnText}>{t('done')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default PopQuizCreate;

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: palette.main[500],
    paddingHorizontal: '20@ms',
    paddingBottom: '24@ms',
    paddingTop: '12@ms',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  closeButton: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dots: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: '32@ms', // to offset close button
  },
  dot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: '4@ms',
  },
  dotActive: {
    width: '16@ms',
    backgroundColor: '#FFF',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: '22@ms',
    fontWeight: 'bold',
    marginBottom: '4@ms',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12@ms',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: '20@ms',
    paddingBottom: '40@ms',
  },
  label: {
    fontSize: '14@ms',
    color: palette.grey[600],
    marginBottom: '12@ms',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '12@ms',
    paddingHorizontal: '16@ms',
    paddingVertical: '14@ms',
    fontSize: '16@ms',
    color: '#333',
  },
  scrollContainer: {
    maxHeight: '180@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '12@ms',
    padding: '10@ms',
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: '10@ms',
  },
  loadMoreBtn: {
    alignSelf: 'center',
    paddingVertical: '8@ms',
    paddingHorizontal: '16@ms',
    marginTop: '10@ms',
    borderRadius: '8@ms',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
  },
  loadMoreText: {
    color: palette.main[500],
    fontWeight: '600',
    fontSize: '14@ms',
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '10@ms',
  },
  subjectChip: {
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms',
    borderRadius: '20@ms',
    marginBottom: '10@ms',
  },
  subjectChipActive: {
    backgroundColor: palette.main[500],
  },
  subjectText: {
    fontWeight: 'bold',
    color: palette.main[600],
  },
  subjectTextActive: {
    color: '#FFF',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: '12@ms',
    padding: '8@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  counterBtn: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '8@ms',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    flex: 1,
    textAlign: 'center',
    fontSize: '16@ms',
    color: '#333',
  },
  footer: {
    padding: '20@ms',
    backgroundColor: '#F8F9FA',
  },
  nextBtnFull: {
    backgroundColor: palette.main[500],
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  prevBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms',
    alignItems: 'center',
  },
  prevBtnText: {
    color: palette.grey[700],
    fontSize: '16@ms',
    fontWeight: 'bold',
  },
  questionCard: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '16@ms',
    marginBottom: '16@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  questionBadge: {
    backgroundColor: '#F3E8FF',
    width: '24@ms',
    height: '24@ms',
    borderRadius: '6@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '8@ms',
  },
  questionBadgeText: {
    color: palette.main[500],
    fontWeight: 'bold',
  },
  questionTitle: {
    fontWeight: 'bold',
    fontSize: '14@ms',
    color: '#333',
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: '12@ms',
    padding: '2@ms',
    marginBottom: '12@ms',
  },
  typeToggleActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: '6@ms',
    paddingVertical: '6@ms',
    borderRadius: '10@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typeToggleInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '6@ms',
    paddingVertical: '6@ms',
    borderRadius: '10@ms',
  },
  typeToggleTextActive: {
    fontSize: '10@ms',
    color: palette.main[500],
    fontWeight: 'bold',
    textAlign: 'center',
  },
  typeToggleText: {
    fontSize: '10@ms',
    color: palette.grey[500],
    textAlign: 'center',
  },
  deleteBtn: {
    backgroundColor: '#F3F4F6',
    padding: '6@ms',
    borderRadius: '6@ms',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '16@ms',
  },
  optionBtn: {
    width: '45@ms',
    height: '45@ms',
    borderRadius: '8@ms',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionBtnActive: {
    backgroundColor: palette.main[500],
  },
  optionText: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: palette.grey[700],
  },
  optionTextActive: {
    color: '#FFF',
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionHint: {
    fontSize: '11@ms',
    color: palette.grey[400],
  },
  viewMoreText: {
    fontSize: '11@ms',
    color: palette.main[500],
    fontWeight: 'bold',
  },
  addQuestionBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderStyle: 'dashed',
    borderRadius: '12@ms',
    paddingVertical: '16@ms',
    backgroundColor: '#F9F5FF',
  },
  addQuestionText: {
    color: palette.main[500],
    fontWeight: 'bold',
    marginLeft: '8@ms',
  },
  successIcon: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@ms',
    backgroundColor: '#C4B5FD',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: '20@ms',
    marginBottom: '16@ms',
  },
  successTitle: {
    fontSize: '20@ms',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8@ms',
    color: '#333',
  },
  successSubtitle: {
    fontSize: '14@ms',
    color: palette.grey[500],
    textAlign: 'center',
    marginBottom: '32@ms',
  },
  targetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '10@ms',
    marginBottom: '32@ms',
  },
  targetBtn: {
    width: '48%',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '12@ms',
    paddingVertical: '12@ms',
    alignItems: 'center',
  },
  targetBtnActive: {
    width: '48%',
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: palette.main[500],
    borderRadius: '12@ms',
    paddingVertical: '12@ms',
    alignItems: 'center',
  },
  targetText: {
    fontWeight: 'bold',
    color: palette.grey[700],
  },
  targetTextActive: {
    fontWeight: 'bold',
    color: palette.main[500],
  },
  codeContainer: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '24@ms',
    alignItems: 'center',
    marginBottom: '16@ms',
  },
  codeLabel: {
    fontSize: '12@ms',
    color: palette.main[500],
    fontWeight: 'bold',
    marginBottom: '8@ms',
  },
  codeText: {
    fontSize: '28@ms',
    fontWeight: '300',
    letterSpacing: 4,
    marginBottom: '20@ms',
    color: '#333',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.main[500],
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms',
    borderRadius: '20@ms',
  },
  copyBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: '12@ms',
    marginLeft: '6@ms',
  },
  shareRow: {
    flexDirection: 'row',
    marginBottom: '24@ms',
  },
  linkShareBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: '12@ms',
    marginRight: '8@ms',
  },
  linkShareText: {
    fontWeight: 'bold',
    marginLeft: '8@ms',
    color: '#333',
  },
  iconShareBtn: {
    width: '48@ms',
    height: '48@ms',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: '8@ms',
  },
  previewBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: '24@ms',
    paddingVertical: '16@ms',
  },
  previewBtnText: {
    color: palette.main[500],
    fontWeight: 'bold',
    marginLeft: '8@ms',
  },
  textAnswersContainer: {
    marginBottom: '16@ms',
  },
  textAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '8@ms',
  },
  correctAnswerLabel: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#212121',
    marginBottom: '8@ms',
  },
  mathInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: '4@ms',
    flex: 1,
    backgroundColor: '#FFF',
    minHeight: '100@ms',
  },
  textAnswerDeleteBtn: {
    marginLeft: '8@ms',
    padding: '8@ms',
    backgroundColor: '#FEE2E2',
    borderRadius: '8@ms',
  },
  addTextAnswerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: '4@ms',
    marginBottom: '12@ms',
  },
  addTextAnswerBtnText: {
    color: palette.main[500],
    fontSize: '12@ms',
    fontWeight: 'bold',
    marginLeft: '4@ms',
  },
  compareTypeContainer: {
    marginTop: '12@ms',
    paddingTop: '12@ms',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  compareTypeLabel: {
    fontSize: '12@ms',
    color: palette.grey[600],
    fontWeight: 'bold',
    marginBottom: '8@ms',
  },
  compareChipsRow: {
    flexDirection: 'column',
    gap: '6@ms',
  },
  compareChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: '8@ms',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    alignItems: 'center',
  },
  compareChipActive: {
    backgroundColor: palette.main[500],
  },
  compareChipText: {
    fontSize: '12@ms',
    color: palette.grey[700],
    fontWeight: '500',
  },
  compareChipTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
