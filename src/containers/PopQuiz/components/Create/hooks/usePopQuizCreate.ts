import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getSubjectListBaseApi } from '@/services/api/subjectService';
import { getCategoryListApi, getQuestionTypeListApi, getCategoryQuestionTypeListApi } from '@/services/api/categoryApi';
import { createPopQuizApi, getRecentPopQuizzesApi, startPopQuizSessionApi, endPopQuizSessionApi } from '@/services/api/popQuizApi';
import { getErrorMessage, toast } from '@/utils/helpers';
import * as Clipboard from 'expo-clipboard';
import { Routes } from '@/navigators/RouteName';
import React, { useEffect, useState } from 'react';
import { Share } from 'react-native';
import { QuestionAnswerType, ExamStatus, SubjectType, PopQuizSolveTarget, OrderBy } from '@/utils/enums';
import { navigate } from '@/navigators/NavigationHelpers';
import _ from 'lodash';

const usePopQuizCreate = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [questionCount, setQuestionCount] = useState(5);

  const [subCategory, setSubCategory] = useState<any>(null);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  const [category, setCategory] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [questionType, setQuestionType] = useState<any>(null);
  const [questionTypes, setQuestionTypes] = useState<any[]>([]);
  const [loadingQuestionTypes, setLoadingQuestionTypes] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);
  const [createdQuizCode, setCreatedQuizCode] = useState<string>('');
  const [solveTarget, setSolveTarget] = useState<PopQuizSolveTarget>(PopQuizSolveTarget.Child);
  const [questions, setQuestions] = useState<any[]>([
    {
      id: 1,
      questionAnswerType: QuestionAnswerType.SingleChoice,
      numberOfAnswers: 5,
      correctAnswers: [1],
      correctTextualAnswers: [],
      score: 1,
    },
    {
      id: 2,
      questionAnswerType: QuestionAnswerType.SingleChoice,
      numberOfAnswers: 5,
      correctAnswers: [1],
      correctTextualAnswers: [],
      score: 1,
    },
    {
      id: 3,
      questionAnswerType: QuestionAnswerType.SingleChoice,
      numberOfAnswers: 5,
      correctAnswers: [1],
      correctTextualAnswers: [],
      score: 1,
    },
    {
      id: 4,
      questionAnswerType: QuestionAnswerType.SingleChoice,
      numberOfAnswers: 5,
      correctAnswers: [1],
      correctTextualAnswers: [],
      score: 1,
    },
    {
      id: 5,
      questionAnswerType: QuestionAnswerType.SingleChoice,
      numberOfAnswers: 5,
      correctAnswers: [1],
      correctTextualAnswers: [],
      score: 1,
    },
  ]);

  const handleCopyCode = async () => {
    const code = createdQuizCode;
    await Clipboard.setStringAsync(code);
    toast.success(t('the_code_has_been_copied_to_your_clipboard'));
  };

  const handleShareLink = async () => {
    try {
      const code = createdQuizCode;
      await Share.share({
        message: code,
      });
    } catch (error: any) {
      console.error("Failed to share link", error);
    }
  };

  const handlePreviewQuiz = () => {
    if (createdQuizId) {
      navigate(Routes.Auth.PopQuizIntro as any, { quizId: createdQuizId });
    } else {
      toast.error(t('quiz_not_found'));
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await getSubjectListBaseApi("");
        const items = res.data?.items || res.data || [];
        setSubjects(items);
      } catch (e) {
        console.error("Failed to fetch subjects", e);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setStep(1);
      setTitle('');
      setSubject(null);
      setCategory(null);
      setSubCategory(null);
      setQuestionType(null);
      setCreatedQuizId(null);
      setCreatedQuizCode('');
      setSolveTarget(PopQuizSolveTarget.Child);
      setQuestionCount(5);
      setQuestions([
        { id: 1, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
        { id: 2, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
        { id: 3, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
        { id: 4, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
        { id: 5, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
      ]);
    });
    return unsubscribe;
  }, [navigation]);

  const fetchCategories = async (subjId: number, textSearch?: string) => {
    try {
      setLoadingCategories(true);
      const isMath = subject?.type === SubjectType.Math;
      const categoryTextSearch = textSearch?.trim();
      const res = isMath
        ? await getCategoryQuestionTypeListApi({
            subjectId: subjId,
            isRootCategory: true,
            categoryTextSearch,
            sortColumnName: 'Name',
            sortColumnDirection: OrderBy.ASC
          })
        : await getCategoryListApi({
            subjectId: subjId,
            isRootCategory: true,
            categoryTextSearch,
            sortColumnName: 'Name',
            sortColumnDirection: OrderBy.ASC
          });
      const items = res.data?.items || res.data || [];
      setCategories(items);
      setCategory((prev: any) => {
        if (prev && items.find((i: any) => Number(i.id) === Number(prev.id))) return prev;
        return null;
      });
    } catch (e) {
      console.error("Failed to fetch categories", e);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubCategories = async (subjId: number, catId?: number, textSearch?: string) => {
    try {
      setLoadingSubCategories(true);
      const isMath = subject?.type === SubjectType.Math;
      const categoryTextSearch = textSearch?.trim();
      const res = isMath
        ? await getCategoryQuestionTypeListApi({
            subjectId: subjId,
            parentCategoryId: catId,
            isRootCategory: false,
            categoryTextSearch,
            sortColumnName: 'Name',
            sortColumnDirection: 'ASC'
          })
        : await getCategoryListApi({
            subjectId: subjId,
            parentCategoryId: catId,
            isRootCategory: false,
            categoryTextSearch,
            sortColumnName: 'Name',
            sortColumnDirection: 'ASC'
          });
      const items = res.data?.items || res.data || [];
      setSubCategories(items);
      setSubCategory((prev: any) => {
        if (prev && items.find((i: any) => Number(i.id) === Number(prev.id))) return prev;
        return null;
      });
    } catch (e) {
      console.error("Failed to fetch subcategories", e);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const fetchQuestionTypes = async (subjId: number, catId?: number, subCatId?: number, textSearch?: string) => {
    try {
      setLoadingQuestionTypes(true);
      const isMath = subject?.type === SubjectType.Math;
      const searchString = textSearch?.trim();
      const params = {
        subjectId: subjId,
        loadCategories: true,
        currentPage: 1,
        pageSize: 100,
        sortColumnName: 'Name',
        sortColumnDirection: 'ASC',
        ...(searchString
          ? {
              textSearch: searchString
            }
          : isMath
            ? {
                parentCategoryId: subCatId,
                rootParentCategoryId: catId
              }
            : {
                categoryId: subCatId,
                parentCategoryId: catId
              })
      };
      const res = await getQuestionTypeListApi(params);
      const items = res.data?.items || res.data || [];
      setQuestionTypes(items);
      setQuestionType((prev: any) => {
        if (prev && items.find((i: any) => Number(i.id) === Number(prev.id))) return prev;
        return null;
      });
    } catch (e) {
      console.error("Failed to fetch question types", e);
    } finally {
      setLoadingQuestionTypes(false);
    }
  };

  useEffect(() => {
    setCategory(null);
    setSubCategory(null);
    setQuestionType(null);
    setCategories([]);
    setSubCategories([]);
    setQuestionTypes([]);
  }, [subject?.id]);

  const categoryOptions = React.useMemo(() => {
    const opts = categories.map(c => ({
      label: c.name || c.title || '',
      value: c.superId || c.id,
      data: c
    }));
    if (category && !opts.some(o => Number(o.value) === Number(category.superId || category.id))) {
      opts.push({
        label: category.name || category.title || '',
        value: category.superId || category.id,
        data: category
      });
    }
    return opts;
  }, [categories, category]);

  const subCategoryOptions = React.useMemo(() => {
    const opts = subCategories.map(sc => ({
      label: sc.name || sc.title || '',
      value: sc.superId || sc.id,
      data: sc
    }));
    if (subCategory && !opts.some(o => Number(o.value) === Number(subCategory.superId || subCategory.id))) {
      opts.push({
        label: subCategory.name || subCategory.title || '',
        value: subCategory.superId || subCategory.id,
        data: subCategory
      });
    }
    return opts;
  }, [subCategories, subCategory]);

  const questionTypeOptions = React.useMemo(() => {
    const opts = questionTypes.map(qt => ({
      label: qt.name || qt.title || '',
      value: qt.id,
      data: qt
    }));
    if (questionType && !opts.some(o => Number(o.value) === Number(questionType.id))) {
      opts.push({
        label: questionType.name || questionType.title || '',
        value: questionType.id,
        data: questionType
      });
    }
    return opts;
  }, [questionTypes, questionType]);

  const debounceFetchCategories = React.useMemo(
    () => _.debounce((text: string) => {
      if (subject?.id) {
        fetchCategories(subject.id, text);
      }
    }, 300),
    [subject?.id]
  );

  const debounceFetchSubCategories = React.useMemo(
    () => _.debounce((text: string) => {
      if (subject?.id) {
        fetchSubCategories(subject.id, category?.id, text);
      }
    }, 300),
    [subject?.id, category?.id]
  );

  const debounceFetchQuestionTypes = React.useMemo(
    () => _.debounce((text: string) => {
      if (subject?.id) {
        fetchQuestionTypes(subject.id, category?.id, subCategory?.id, text);
      }
    }, 300),
    [subject?.id, category?.id, subCategory?.id]
  );

  const handleSelectCategory = (id: any) => {
    const c = categoryOptions.find(o => Number(o.value) === Number(id))?.data || null;
    setCategory(c);
    setQuestionType(null);
    if (subCategory && Number(subCategory.parentCategoryId) !== Number(c?.id)) {
      setSubCategory(null);
    }
  };

  const handleSelectSubCategory = (id: any) => {
    const sc = subCategoryOptions.find(o => Number(o.value) === Number(id))?.data || null;
    setSubCategory(sc);
    setQuestionType(null);
    if (!category && sc?.parentCategoryId) {
      const parent = categories.find(c => Number(c.id) === Number(sc.parentCategoryId)) || { id: sc.parentCategoryId };
      setCategory(parent);
    }
  };

  const handleSelectQuestionType = async (id: any) => {
    const qt = questionTypeOptions.find(o => Number(o.value) === Number(id))?.data || null;
    setQuestionType(qt);
    if (qt && qt.categoryPairs && qt.categoryPairs?.length > 0) {
      const resolvePair = (p: any) => {
        if (!p) return { mainId: null, subId: null, mainObj: null, subObj: null };
        if (p.rootCategory) {
          return {
            mainId: p.rootCategory?.superId || p.rootCategory?.id,
            subId: p.parentCategory?.superId || p.parentCategory?.id,
            mainObj: p.rootCategory,
            subObj: p.parentCategory
          };
        }
        return {
          mainId: p.parentCategory?.superId || p.parentCategory?.id,
          subId: p.category?.superId || p.category?.id,
          mainObj: p.parentCategory,
          subObj: p.category
        };
      };

      const pair = qt.categoryPairs[0];
      const { mainId, subId, mainObj, subObj } = resolvePair(pair);

      if (!category?.id) {
        const matchedCat = categories.find(c => Number(c.id) === Number(mainId) || Number(c.superId) === Number(mainId));
        setCategory(matchedCat || mainObj);
      }

      if (!subCategory?.id) {
        const matchedSub = subCategories.find(sc => Number(sc.id) === Number(subId) || Number(sc.superId) === Number(subId));
        setSubCategory(matchedSub || subObj);
      }
    }
  };

  const changeQuestionType = (index: number, type: QuestionAnswerType) => {
    const newQ = [...questions];
    if (
      type === QuestionAnswerType.ShortAnswer ||
      type === QuestionAnswerType.OrderMatters ||
      type === QuestionAnswerType.OrderDoesNotMatters ||
      type === QuestionAnswerType.SynonymProcessing
    ) {
      newQ[index].questionAnswerType = type;
      newQ[index].numberOfAnswers = 0;
      newQ[index].correctAnswers = [];
      if (!newQ[index].correctTextualAnswers || newQ[index].correctTextualAnswers?.length === 0) {
        newQ[index].correctTextualAnswers = [""];
      }
    } else {
      newQ[index].questionAnswerType = type;
      newQ[index].numberOfAnswers = 5;
      newQ[index].correctAnswers = [1];
      newQ[index].correctTextualAnswers = [];
    }
    setQuestions(newQ);
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!title.trim()) {
        toast.error(t('title_required'));
        return;
      }
      if (!subject?.id) {
        toast.error(t('subject_required'));
        return;
      }
      if (!category?.id) {
        toast.error(t('category_required'));
        return;
      }
      if (!subCategory?.id && subCategories?.length > 0) {
        toast.error(t('subcategory_required'));
        return;
      }
      if (questions?.length !== questionCount) {
        if (questions?.length < questionCount) {
          const diff = questionCount - questions?.length;
          const newQuestions = [...questions];
          for (let i = 0; i < diff; i++) {
            newQuestions.push({
              id: Date.now() + i,
              questionAnswerType: QuestionAnswerType.SingleChoice,
              numberOfAnswers: 5,
              correctAnswers: [1],
              correctTextualAnswers: [],
              score: 1,
            });
          }
          setQuestions(newQuestions);
        } else {
          setQuestions(questions.slice(0, questionCount));
        }
      }
      setStep(step + 1);
    } else if (step === 2) {
      const hasEmptyTextualAnswers = questions.some(q => {
        const isShortAns = [
          QuestionAnswerType.ShortAnswer,
          QuestionAnswerType.OrderMatters,
          QuestionAnswerType.OrderDoesNotMatters,
          QuestionAnswerType.SynonymProcessing
        ].includes(q.questionAnswerType);

        if (isShortAns) {
          if (!q.correctTextualAnswers || q.correctTextualAnswers?.length === 0) return true;
          return q.correctTextualAnswers.some((ans: string) => {
            if (!ans) return true;
            const stripped = ans.replace(/<[^>]*>?/gm, '').trim();
            return stripped === "";
          });
        }
        return false;
      });

      if (hasEmptyTextualAnswers) {
        toast.error(t('textual_answer_required'));
        return;
      }

      setIsCreating(true);
      try {
        const examRequest = {
          title: title || t("pop_quiz"),
          duration: "00:00:00",
          isPublished: true,
          type: 1,
          isPopQuiz: true,
          subjectId: subject?.id || 0,
          solveTarget: solveTarget,
          questionGroups: [
            {
              articles: [
                {
                  title: "",
                  author: "",
                  tag: "",
                  categoryId: category?.id ? Number(category.id) : 0,
                  subcategoryId: subCategory?.id ? Number(subCategory.id) : 0,
                  questionTypeId: questionType?.id ? Number(questionType.id) : undefined,
                  categoryOptions: [],
                  questionGroupId: 0
                }
              ],
              questions: questions.map((q, idx) => {
                const defaultAnswerCount = 5;
                const defaultScore = 1;
                const defaultType = QuestionAnswerType.SingleChoice;

                const answerType = q.questionAnswerType ?? defaultType;
                const isShort = [
                  QuestionAnswerType.ShortAnswer,
                  QuestionAnswerType.OrderMatters,
                  QuestionAnswerType.OrderDoesNotMatters,
                  QuestionAnswerType.SynonymProcessing
                ].includes(answerType);

                return {
                  numberOfAnswers: isShort ? 0 : (q.numberOfAnswers ?? defaultAnswerCount),
                  correctAnswers: isShort ? [] : (q.correctAnswers ?? [1]),
                  correctTextualAnswers: isShort ? (q.correctTextualAnswers ?? [" "]) : [],
                  score: q.score ?? defaultScore,
                  questionOrder: idx,
                  questionAnswerType: answerType,
                  questionTypeCategories: [
                    {
                      categoryId: category?.id ? Number(category.id) : undefined,
                      subcategoryId: subCategory?.id ? Number(subCategory.id) : undefined,
                      questionTypeId: questionType?.id ? Number(questionType.id) : undefined
                    }
                  ]
                };
              })
            }
          ]
        };

        const res = await createPopQuizApi(examRequest);
        const createdExam = res.data?.data || res.data;
        if (createdExam && createdExam.id) {
          try {
            const recentRes = await getRecentPopQuizzesApi();
            const quizzes = recentRes.data?.items || recentRes.data || [];
            const activeQuiz = quizzes.find((q: any) => q.popQuizStatus === ExamStatus.InProgress);
            if (activeQuiz) {
              await endPopQuizSessionApi(activeQuiz.id, ExamStatus.Completed);
            }
          } catch (e) {
            console.error("Failed to end active session before starting new one", e);
          }

          const statusRes = await startPopQuizSessionApi(createdExam.id, []);
          const rawCode = statusRes.data?.data || statusRes.data;
          const generatedCode = typeof rawCode === 'string' ? rawCode : "";

          setCreatedQuizId(createdExam.id);
          setCreatedQuizCode(generatedCode || createdExam.examCode || createdExam.code || String(createdExam.id));
          setStep(step + 1);
        } else {
          toast.error(t('failed_to_create_pop_quiz'));
        }
      } catch (err: any) {
        console.error("Create pop quiz error:", err.response?.data || err);
        toast.error(getErrorMessage(t, err));
      } finally {
        setIsCreating(false);
      }
    } else {
      if (step < 3) setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    setTitle('');
    setSubject(null);
    setCategory(null);
    setSubCategory(null);
    setQuestionType(null);
    setCreatedQuizId(null);
    setCreatedQuizCode('');
    setSolveTarget(PopQuizSolveTarget.Child);
    setQuestionCount(5);
    setQuestions([
      { id: 1, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
      { id: 2, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
      { id: 3, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
      { id: 4, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
      { id: 5, questionAnswerType: QuestionAnswerType.SingleChoice, numberOfAnswers: 5, correctAnswers: [1], correctTextualAnswers: [], score: 1 },
    ]);
    navigate(Routes.Auth.PopQuiz);
  };

  return {
    t,
    step,
    subjects,
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
    setSubject,
    setCategory: handleSelectCategory,
    setQuestionType: handleSelectQuestionType,
    setSubCategory: handleSelectSubCategory,
    setQuestionCount,
    questionCount,
    solveTarget,
    setSolveTarget,
    setQuestions,
    createdQuizCode
  }
}

export default usePopQuizCreate 