import { PreparedQuestionGroupResponse, PreparedQuestionResponse, SimplePreparedTextbookResponse } from "./types";

export const isNull = (value: any) => {
  if(Array.isArray(value)) {
    return !value[0]
  }
  return !value
}

export const isQuestionAnswered = (q: any) => {
  if (!q) return false;
  const hasSelected = Boolean(q.selectedAnswers && Array.isArray(q.selectedAnswers) && q.selectedAnswers.length > 0);
  const hasTextual = Boolean(q.textualAnswers && Array.isArray(q.textualAnswers) && q.textualAnswers.length > 0 && !isNull(q.textualAnswers));
  return hasSelected || hasTextual;
};

export const findTargetQuestionForPageRange = (
  pageNum: number,
  questions: PreparedQuestionResponse[],
  groupList: PreparedQuestionGroupResponse[],
  textbook?: SimplePreparedTextbookResponse,
  isRestart?: boolean
): number | undefined => {
  if (!pageNum || pageNum <= 0 || !questions.length) return undefined;

  let rangeFrom = pageNum;
  let rangeTo = pageNum;

  // 1. Collect all chapter, subchapter, and group page range candidates
  const candidates: { pageFrom: number; pageTo: number }[] = [];

  textbook?.chapters?.forEach((ch) => {
    if (ch.pageFrom) {
      candidates.push({ pageFrom: ch.pageFrom, pageTo: ch.pageTo || ch.pageFrom });
    }
    ch.subChapters?.forEach((sub) => {
      if (sub.pageFrom) {
        candidates.push({ pageFrom: sub.pageFrom, pageTo: sub.pageTo || sub.pageFrom });
      }
    });
  });

  groupList.forEach((g) => {
    const pFrom = g.parentChapterPageFrom || g.chapterPageFrom || g.pageFrom;
    const pTo = g.parentChapterPageTo || g.chapterPageTo || g.pageTo || pFrom;
    if (pFrom) {
      candidates.push({ pageFrom: pFrom, pageTo: pTo || pFrom });
    }
  });

  // 2. Find matching candidate: prioritize exact pageFrom === pageNum FIRST
  let match = candidates.find((c) => c.pageFrom === pageNum);

  // If not matched by exact pageFrom, search for range where pageFrom <= pageNum && pageNum < pageTo (strict < pageTo)
  if (!match) {
    match = candidates.find((c) => c.pageFrom <= pageNum && pageNum < c.pageTo);
  }

  // Final fallback
  if (!match) {
    match = candidates.find((c) => c.pageFrom <= pageNum && pageNum <= c.pageTo);
  }

  if (match) {
    rangeFrom = match.pageFrom;
    rangeTo = match.pageTo;
  }

  // 3. Filter questions strictly falling within [rangeFrom, rangeTo]
  const rangeQuestions = questions.filter((q: any) => {
    const qPage = q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0;
    return qPage >= rangeFrom && qPage <= rangeTo;
  });

  if (rangeQuestions.length > 0) {
    if (isRestart) {
      return rangeQuestions[0].id;
    }

    const answeredPages = rangeQuestions
      .filter(isQuestionAnswered)
      .map((q: any) => q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0);

    if (answeredPages.length > 0) {
      const maxAnsweredPage = Math.max(...answeredPages);
      const forwardUnanswered = rangeQuestions.find((q: any) => {
        const qPage = q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0;
        return qPage >= maxAnsweredPage && !isQuestionAnswered(q);
      });

      if (forwardUnanswered) {
        return forwardUnanswered.id;
      }

      const anyUnanswered = rangeQuestions.find((q: any) => !isQuestionAnswered(q));
      if (anyUnanswered) {
        return anyUnanswered.id;
      }

      return rangeQuestions[rangeQuestions.length - 1].id;
    } else {
      return rangeQuestions[0].id;
    }
  }

  const questionsBefore = questions
    .filter((q: any) => (q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0) <= pageNum)
    .sort((a: any, b: any) => {
      const pA = a.pageFrom || a.chapterPageFrom || a.parentChapterPageFrom || 0;
      const pB = b.pageFrom || b.chapterPageFrom || b.parentChapterPageFrom || 0;
      return pB - pA;
    });

  if (questionsBefore.length > 0) {
    return questionsBefore[0].id;
  }

  const questionsAfter = questions
    .filter((q: any) => (q.pageFrom || q.chapterPageFrom || q.parentChapterPageFrom || 0) >= pageNum)
    .sort((a: any, b: any) => {
      const pA = a.pageFrom || a.chapterPageFrom || a.parentChapterPageFrom || 0;
      const pB = b.pageFrom || b.chapterPageFrom || b.parentChapterPageFrom || 0;
      return pA - pB;
    });

  if (questionsAfter.length > 0) {
    return questionsAfter[0].id;
  }

  return questions[0]?.id;
};