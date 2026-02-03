import { ExamEvent } from "@/utils/enums";
import { EffectSize, ExamResult, LongTimeSpendQuestion, TimelyOrderQuestion } from "@/utils/types";

export const ORDER_NUMBERS: any = {
    1:"the_first",
    2:"the_second",
    3:"the_third",
    4:"the_fourth",
    5:"the_fifth",
    6:"the_sixth",
    7:"the_seventh",
    8:"the_eighth",
    9:"the_ninth",
    10:"the_tenth"
}

export const EXAM_RESULT:ExamResult = {
    "id": 6047,
    "teacherId": 1,
    "title": "EXAMPLE EXAM",
    "examSessionId": 8,
    "description": "",
    "image": "",
    "type": "",
    "teacherName": "Admin",
    "teacherAvatar": "https://lh3.googleusercontent.com/a/ACg8ocKoBjuFGZfJYrpnWcDgDRSy0AcVYTOP6s-WWLgxecLmRg=s96-c",
    "finishTime": "0001-01-01T00:00:00+00:00",
    "status": 3,
    "startTime": "2024-03-13T04:28:48.768643+00:00",
    "duration": "01:00:00",
    "student": {
        "id": 1001,
        "phoneNumber": "",
        "email": "",
        "avatar": "https://lh3.googleusercontent.com/a/ACg8ocKtZwjUWLrcUGGP8Vf4i39FjR8rWYz0rDzwcpUBwgyDxm4=s96-c",
        "parentName": "",
        "parentPhoneNumber": "",
        "schoolName": "Academy",
        "className": "1",
        "major": "",
        "roles": []
    },
    "questions": [
        {
            "id": 8144,
            "selectedAnswers": "1",
            "correctAnswers": "2",
            "isStar": false,
            "duration": 320.939,
            "classAverageTime": 238.939,
            "topDuration": 180.939,
            "answerResponseSignal": 0,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:00.685+00:00",
            "article": 1,
            "category": {
                "parentCategoryId": 5,
                "name": "New category",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 7
            },
            "overallCorrectRate": 77,
            "questionOrder": 0
        },
        {
            "id": 8145,
            "selectedAnswers": "2",
            "correctAnswers": "3",
            "isStar": false,
            "duration": 2.014,
            "classAverageTime": 2.014,
            "topDuration": 2.014,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:02.7+00:00",
            "article": 1,
            "category": {
                "parentCategoryId": 5,
                "name": "New category",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 7
            },
            "overallCorrectRate": 64,
            "questionOrder": 1
        },
        {
            "id": 8146,
            "selectedAnswers": "1",
            "correctAnswers": "2",
            "isStar": false,
            "duration": 72.244,
            "classAverageTime": 52.244,
            "topDuration": 24.244,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:04.944+00:00",
            "article": 1,
            "category": {
                "parentCategoryId": 5,
                "name": "New category",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 7
            },
            "overallCorrectRate": 85,
            "questionOrder": 2
        },
        {
            "id": 8147,
            "selectedAnswers": "1",
            "correctAnswers": "1",
            "isStar": false,
            "duration": 1.373,
            "classAverageTime": 1.373,
            "topDuration": 1.373,
            "answerResponseSignal": 4,
            "isCorrect": true,
            "score": 2,
            "answerTime": "2024-03-13T04:29:06.317+00:00",
            "article": 1,
            "category": {
                "parentCategoryId": 5,
                "name": "New category",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 7
            },
            "overallCorrectRate": 78.88,
            "questionOrder": 3
        },
        {
            "id": 8148,
            "selectedAnswers": "3",
            "correctAnswers": "4",
            "isStar": false,
            "duration": 120.683,
            "classAverageTime": 132.683,
            "topDuration": 110.683,
            "answerResponseSignal": 2,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:07+00:00",
            "article": 1,
            "category": {
                "parentCategoryId": 5,
                "name": "New category",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 7
            },
            "overallCorrectRate": 55.67,
            "questionOrder": 4
        },
        {
            "id": 8149,
            "selectedAnswers": "2",
            "correctAnswers": "2",
            "isStar": false,
            "duration": 1.052,
            "classAverageTime": 1.052,
            "topDuration": 1.052,
            "answerResponseSignal": 1,
            "isCorrect": true,
            "score": 2,
            "answerTime": "2024-03-13T04:29:08.052+00:00",
            "article": 2,
            "category": {
                "parentCategoryId": null,
                "name": "123458868",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 1008
            },
            "overallCorrectRate": 100,
            "questionOrder": 5
        },
        {
            "id": 8150,
            "selectedAnswers": "",
            "correctAnswers": "3",
            "isStar": false,
            "duration": 0,
            "classAverageTime": 0,
            "topDuration": null,
            "answerResponseSignal": null,
            "isCorrect": false,
            "score": 2,
            "answerTime": "0001-01-01T00:00:00+00:00",
            "article": 2,
            "category": {
                "parentCategoryId": null,
                "name": "123458868",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 1008
            },
            "overallCorrectRate": 55.67,
            "questionOrder": 6
        },
        {
            "id": 8151,
            "selectedAnswers": "3",
            "correctAnswers": "2",
            "isStar": true,
            "duration": 2.596,
            "classAverageTime": 2.596,
            "topDuration": 2.596,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:10.648+00:00",
            "article": 2,
            "category": {
                "parentCategoryId": null,
                "name": "123458868",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 1008
            },
            "overallCorrectRate": 78.24,
            "questionOrder": 7
        },
        {
            "id": 8152,
            "selectedAnswers": "5",
            "correctAnswers": "4",
            "isStar": false,
            "duration": 0.899,
            "classAverageTime": 0.899,
            "topDuration": 0.899,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "answerTime": "2024-03-13T04:29:12.864+00:00",
            "article": 2,
            "score": 2,
            "category": {
                "parentCategoryId": null,
                "name": "123458868",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 1008
            },
            "overallCorrectRate": 90,
            "questionOrder": 8
        },
        {
            "id": 8153,
            "selectedAnswers": "2",
            "correctAnswers": "2",
            "isStar": true,
            "duration": 70.496,
            "classAverageTime": 140.496,
            "topDuration": 20.496,
            "answerResponseSignal": 0,
            "isCorrect": true,
            "answerTime": "2024-03-13T04:29:14.36+00:00",
            "article": 2,
            "score": 2,
            "category": {
                "parentCategoryId": null,
                "name": "123458868",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 1008
            },
            "overallCorrectRate": 100,
            "questionOrder": 9
        },
        {
            "id": 8154,
            "selectedAnswers": "",
            "correctAnswers": "5",
            "isStar": false,
            "duration": 0,
            "classAverageTime": 0,
            "topDuration": null,
            "answerResponseSignal": null,
            "isCorrect": false,
            "answerTime": "0001-01-01T00:00:00+00:00",
            "article": 2,
            "score": 2,
            "category": {
                "parentCategoryId": null,
                "name": "123458868",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 1008
            },
            "overallCorrectRate": 75,
            "questionOrder": 10
        },
        {
            "id": 8155,
            "selectedAnswers": "2",
            "correctAnswers": "2",
            "isStar": false,
            "duration": 1.317,
            "classAverageTime": 1.317,
            "topDuration": 1.317,
            "answerResponseSignal": 1,
            "isCorrect": true,
            "score": 2,
            "answerTime": "2024-03-13T04:29:11.965+00:00",
            "article": 3,
            "category": {
                "parentCategoryId": null,
                "name": "The first category a",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 4
            },
            "overallCorrectRate": 100,
            "questionOrder": 11
        },
        {
            "id": 8156,
            "selectedAnswers": "2",
            "correctAnswers": "4",
            "isStar": true,
            "duration": 1.593,
            "classAverageTime": 1.593,
            "topDuration": 1.593,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:20.734+00:00",
            "article": 3,
            "category": {
                "parentCategoryId": null,
                "name": "The first category a",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 4
            },
            "overallCorrectRate": 82,
            "questionOrder": 12
        },
        {
            "id": 8157,
            "selectedAnswers": "2",
            "correctAnswers": "5",
            "isStar": true,
            "duration": 1.204,
            "classAverageTime": 1.204,
            "topDuration": 1.204,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "score": 2,
            "answerTime": "2024-03-13T04:29:18.164+00:00",
            "article": 3,
            "category": {
                "parentCategoryId": null,
                "name": "The first category a",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 4
            },
            "overallCorrectRate": 67,
            "questionOrder": 13
        },
        {
            "id": 8158,
            "selectedAnswers": "4",
            "correctAnswers": "3",
            "isStar": true,
            "duration": 2.6,
            "classAverageTime": 2.6,
            "topDuration": 2.6,
            "answerResponseSignal": 1,
            "isCorrect": false,
            "answerTime": "2024-03-13T04:29:16.96+00:00",
            "article": 3,
            "score": 2,
            "category": {
                "parentCategoryId": null,
                "name": "The first category a",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 4
            },
            "overallCorrectRate": 45,
            "questionOrder": 14
        },
        {
            "id": 8159,
            "selectedAnswers": "3",
            "correctAnswers": "3",
            "isStar": true,
            "duration": 0.977,
            "classAverageTime": 0.977,
            "topDuration": 0.977,
            "answerResponseSignal": 1,
            "isCorrect": true,
            "score": 2,
            "answerTime": "2024-03-13T04:29:19.141+00:00",
            "article": 3,
            "category": {
                "parentCategoryId": null,
                "name": "The first category a",
                "path": "",
                "numberOfQuestions": 0,
                "numberOfChildren": 0,
                "id": 4
            },
            "overallCorrectRate": 100,
            "questionOrder": 15
        }
    ],
    "score": 10,
    "placeOrder": 1,
    "totalStudent": 1,
    "totalTime": 30.987000000000002
}

export const LONGTIME_SPEND_QUESTIONS: LongTimeSpendQuestion[] = [
    {
        "id": 8144,
        "questionOrder": 0,
        "duration": 320.939,
        "topDuration": 145.32
    },
    {
        "id": 8153,
        "questionOrder": 9,
        "duration": 70.496,
        "topDuration": 30.22
    }
]

export const EFFECT_SIZE_QUESTIONS: EffectSize[] = [
    {
        "id": 8144,
        "questionOrder": 0,
        "article": 1,
        "isCorrect": false,
        "selectedAnswers": "1",
        "mostSelectedAnswers": "1",
        "correctAnswers": "2",
        "answerResponseSignal": 1,
        "problemCategories": [
            3
        ]
    },
    {
        "id": 8145,
        "questionOrder": 1,
        "article": 1,
        "isCorrect": false,
        "selectedAnswers": "2",
        "mostSelectedAnswers": "2",
        "correctAnswers": "3",
        "answerResponseSignal": 1,
        "problemCategories": [
            4
        ]
    },
    {
        "id": 8146,
        "questionOrder": 2,
        "article": 1,
        "isCorrect": false,
        "selectedAnswers": "1",
        "mostSelectedAnswers": "1",
        "correctAnswers": "2",
        "answerResponseSignal": 1,
        "problemCategories": [
            3
        ]
    },
    {
        "id": 8147,
        "questionOrder": 3,
        "article": 1,
        "isCorrect": true,
        "selectedAnswers": "1",
        "mostSelectedAnswers": "1",
        "correctAnswers": "1",
        "answerResponseSignal": 1,
        "problemCategories": [
            1
        ]
    },
    {
        "id": 8148,
        "questionOrder": 4,
        "article": 1,
        "isCorrect": false,
        "selectedAnswers": "3",
        "mostSelectedAnswers": "3",
        "correctAnswers": "4",
        "answerResponseSignal": 1,
        "problemCategories": [
            4
        ]
    },
    {
        "id": 8149,
        "questionOrder": 5,
        "article": 2,
        "isCorrect": true,
        "selectedAnswers": "2",
        "mostSelectedAnswers": "2",
        "correctAnswers": "2",
        "answerResponseSignal": 1,
        "problemCategories": [
            1
        ]
    },
    {
        "id": 8150,
        "questionOrder": 6,
        "article": 2,
        "isCorrect": false,
        "selectedAnswers": "",
        "mostSelectedAnswers": "",
        "correctAnswers": "3",
        "answerResponseSignal": null,
        "problemCategories": []
    },
    {
        "id": 8151,
        "questionOrder": 7,
        "article": 2,
        "isCorrect": false,
        "selectedAnswers": "3",
        "mostSelectedAnswers": "3",
        "correctAnswers": "2",
        "answerResponseSignal": 1,
        "problemCategories": [
            2, 3
        ]
    },
    {
        "id": 8152,
        "questionOrder": 8,
        "article": 2,
        "isCorrect": false,
        "selectedAnswers": "5",
        "mostSelectedAnswers": "5",
        "correctAnswers": "4",
        "answerResponseSignal": 1,
        "problemCategories": [
            4
        ]
    },
    {
        "id": 8153,
        "questionOrder": 9,
        "article": 2,
        "isCorrect": true,
        "selectedAnswers": "2",
        "mostSelectedAnswers": "2",
        "correctAnswers": "2",
        "answerResponseSignal": 1,
        "problemCategories": [
            1
        ]
    },
    {
        "id": 8154,
        "questionOrder": 10,
        "article": 2,
        "isCorrect": false,
        "selectedAnswers": "",
        "mostSelectedAnswers": "",
        "correctAnswers": "5",
        "answerResponseSignal": null,
        "problemCategories": []
    },
    {
        "id": 8155,
        "questionOrder": 11,
        "article": 3,
        "isCorrect": true,
        "selectedAnswers": "2",
        "mostSelectedAnswers": "2",
        "correctAnswers": "2",
        "answerResponseSignal": 1,
        "problemCategories": [
            1
        ]
    },
    {
        "id": 8156,
        "questionOrder": 12,
        "article": 3,
        "isCorrect": false,
        "selectedAnswers": "2",
        "mostSelectedAnswers": "2",
        "correctAnswers": "4",
        "answerResponseSignal": 1,
        "problemCategories": [
            4
        ]
    },
    {
        "id": 8157,
        "questionOrder": 13,
        "article": 3,
        "isCorrect": false,
        "selectedAnswers": "2",
        "mostSelectedAnswers": "2",
        "correctAnswers": "5",
        "answerResponseSignal": 1,
        "problemCategories": [
            4
        ]
    },
    {
        "id": 8158,
        "questionOrder": 14,
        "article": 3,
        "isCorrect": false,
        "selectedAnswers": "4",
        "mostSelectedAnswers": "4",
        "correctAnswers": "3",
        "answerResponseSignal": 1,
        "problemCategories": [
            4
        ]
    },
    {
        "id": 8159,
        "questionOrder": 15,
        "article": 3,
        "isCorrect": true,
        "selectedAnswers": "3",
        "mostSelectedAnswers": "3",
        "correctAnswers": "3",
        "answerResponseSignal": 1,
        "problemCategories": [
            1
        ]
    }
]

export const TIMELY_ORDER_QUESTIONS: TimelyOrderQuestion[] = [
    {
        "categoryId": 7,
        "categoryName": "New category",
        "article": 1,
        "questions": [
            {
                "questionId": 8144,
                "questionOrder": 0,
                "answerOrder": 1,
                "topAnswerOrder": 2
            },
            {
                "questionId": 8145,
                "questionOrder": 1,
                "answerOrder": 2,
                "topAnswerOrder": 1
            },
            {
                "questionId": 8146,
                "questionOrder": 2,
                "answerOrder": 3,
                "topAnswerOrder": 4
            },
            {
                "questionId": 8147,
                "questionOrder": 3,
                "answerOrder": 4,
                "topAnswerOrder": 5
            },
            {
                "questionId": 8148,
                "questionOrder": 4,
                "answerOrder": 5,
                "topAnswerOrder": 3
            }
        ]
    },
    {
        "categoryId": 1008,
        "categoryName": "123458868",
        "article": 2,
        "questions": [
            {
                "questionId": 8149,
                "questionOrder": 5,
                "answerOrder": 1,
                "topAnswerOrder": 5
            },
            {
                "questionId": 8150,
                "questionOrder": 6,
                "answerOrder": null,
                "topAnswerOrder": 2
            },
            {
                "questionId": 8151,
                "questionOrder": 7,
                "answerOrder": 2,
                "topAnswerOrder": 3
            },
            {
                "questionId": 8152,
                "questionOrder": 8,
                "answerOrder": 3,
                "topAnswerOrder": 4
            },
            {
                "questionId": 8153,
                "questionOrder": 9,
                "answerOrder": 4,
                "topAnswerOrder": 1
            },
            {
                "questionId": 8154,
                "questionOrder": 10,
                "answerOrder": null,
                "topAnswerOrder": 6
            }
        ]
    },
    {
        "categoryId": 4,
        "categoryName": "The first category a",
        "article": 3,
        "questions": [
            {
                "questionId": 8155,
                "questionOrder": 11,
                "answerOrder": 1,
                "topAnswerOrder": 3
            },
            {
                "questionId": 8156,
                "questionOrder": 12,
                "answerOrder": 5,
                "topAnswerOrder": 2
            },
            {
                "questionId": 8157,
                "questionOrder": 13,
                "answerOrder": 3,
                "topAnswerOrder": 1
            },
            {
                "questionId": 8158,
                "questionOrder": 14,
                "answerOrder": 2,
                "topAnswerOrder": 4
            },
            {
                "questionId": 8159,
                "questionOrder": 15,
                "answerOrder": 4,
                "topAnswerOrder": 5
            }
        ]
    }
]

export const CATEGORY_RESPONSES = [
    {
        "id": 7,
        "name": "New category",
        "totalSolvedTime": 6,
        "totalQuestions": 5,
        "totalCorrectQuestions": 1,
        "totalAnsweredQuestions": 5,
        "percentageAmongStudents": 17
    },
    {
        "id": 1008,
        "name": "123458868",
        "totalSolvedTime": 5,
        "totalQuestions": 6,
        "totalCorrectQuestions": 2,
        "totalAnsweredQuestions": 4,
        "percentageAmongStudents": 48
    },
    {
        "id": 4,
        "name": "The first category a",
        "totalQuestions": 5,
        "totalSolvedTime": 3,
        "totalCorrectQuestions": 2,
        "totalAnsweredQuestions": 5,
        "percentageAmongStudents": 40
    }
]

export const examEvents = [
  ExamEvent.AddExtraDuration,
  ExamEvent.TerminateExam
]