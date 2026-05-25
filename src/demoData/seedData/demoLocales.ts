/**
 * Demo seed data localized for ko / en / vi.
 * Used by fakerSeed.ts to generate language-aware content.
 */

export type DemoLocale = {
    subjects: { id: number; name: string; categories: string[] }[];
    examTypes: string[];
    academyName: string;
    courseSuffix: string;    // e.g. "반" / "Class" / "Lớp"
    schoolSuffix: string;    // e.g. "고등학교" / "High School" / "Trường THPT"
    examTitles: string[];    // midterm, final, etc.
    textbookTitles: {
        type1: string[];  // csat_past_questions
        type2: string[];  // official_mock_exam
        type3: string[];  // private_mock_exam
        type4: string[];  // workbook
        type5: string[];  // past_exam_questions
    };
    noteContents: string[];
    questionTitles: string[];  // for conversations
    demoAcademyName: string;
    demoCourse: string;
    demoTeacherSuffix: string;
    demoMessages: {
        studentQuestion: string;
        teacherAnswer: string;
    };
    blockMessage: { title: string; body: string };
    mockQuestionTypes: string[];
};

export const DEMO_LOCALES: Record<string, DemoLocale> = {
    ko: {
        subjects: [
            { id: 1, name: '수학', categories: ['대수', '기하', '확률과 통계', '미적분'] },
            { id: 2, name: '영어', categories: ['듣기', '독해', '어휘', '문법'] },
            { id: 3, name: '국어', categories: ['비문학', '문학', '문법', '어휘'] },
            { id: 4, name: '과학', categories: ['물리', '화학', '생물', '지구과학'] },
        ],
        examTypes: ['일반', '중간고사', '기말고사', '모의고사'],
        academyName: '데모 학원',
        courseSuffix: '반',
        schoolSuffix: '고등학교',
        examTitles: ['중간고사', '기말고사', '모의고사', '단원평가'],
        textbookTitles: {
            type1: ['수학 교과서 - 미적분', '영어 교과서 - 독해 기본'],
            type2: ['국어 교과서 - 문학', '과학 교과서 - 물리 I'],
            type3: ['수학 교과서 - 기하'],
            type4: ['영어 워크북 - 문법 연습'],
            type5: ['국어 기출문제 - 수능 국어'],
        },
        noteContents: [
            '이 문제에서 공식을 잘못 적용했음.',
            '계산 실수가 있었음. 다시 풀어보기.',
            '핵심 개념을 다시 정리할 필요가 있음.',
            '시간 관리를 못해서 급하게 풀었음.',
            '유사 문제를 더 풀어봐야 함.',
            '풀이 과정은 맞았지만 답을 잘못 적음.',
            '기본 공식을 외워야 함.',
            '그래프 해석을 잘못했음.',
        ],
        questionTitles: [
            '이 문제의 풀이 과정을 이해하지 못했습니다.',
            '공식을 어떻게 적용해야 하나요?',
            '정답이 왜 이것인지 설명해주세요.',
            '이 개념이 시험에 자주 나오나요?',
            '비슷한 유형의 문제를 더 풀고 싶습니다.',
            '오답 노트에 어떻게 정리하면 좋을까요?',
            '계산 과정에서 실수를 줄이는 방법이 있나요?',
            '이 단원에서 가장 중요한 개념은 무엇인가요?',
        ],
        demoAcademyName: '데모 학원',
        demoCourse: '데모 과정',
        demoTeacherSuffix: '선생님',
        demoMessages: {
            studentQuestion: '선생님, 이 문제의 풀이 과정을 다시 한 번 설명해주실 수 있나요? 특히 세 번째 줄에서 네 번째 줄로 넘어가는 과정이 잘 이해가 안 됩니다.',
            teacherAnswer: '네, 학생분! 좋은 질문입니다. 그 부분에서는 기본 개념을 적용하여 식을 단순화한 거예요. 다시 한 번 차근차근 설명해줄 테니 같이 확인해봅시다.',
        },
        blockMessage: {
            title: '데모 모드',
            body: '데모 모드에서는 이 기능을 사용할 수 없습니다.',
        },
        mockQuestionTypes: ['개념 이해', '공식 적용', '응용 문제', '서술형', '복합 유형'],
    },

    en: {
        subjects: [
            { id: 1, name: 'Mathematics', categories: ['Algebra', 'Geometry', 'Statistics', 'Calculus'] },
            { id: 2, name: 'English', categories: ['Listening', 'Reading', 'Vocabulary', 'Grammar'] },
            { id: 3, name: 'Literature', categories: ['Non-fiction', 'Fiction', 'Grammar', 'Vocabulary'] },
            { id: 4, name: 'Science', categories: ['Physics', 'Chemistry', 'Biology', 'Earth Science'] },
        ],
        examTypes: ['Regular', 'Midterm', 'Final', 'Mock'],
        academyName: 'Demo Academy',
        courseSuffix: 'Class',
        schoolSuffix: 'High School',
        examTitles: ['Midterm Exam', 'Final Exam', 'Mock Test', 'Chapter Test'],
        textbookTitles: {
            type1: ['Math Textbook - Calculus', 'English Textbook - Reading'],
            type2: ['Literature Textbook - Fiction', 'Science Textbook - Physics I'],
            type3: ['Math Textbook - Geometry'],
            type4: ['English Workbook - Grammar'],
            type5: ['Literature Past Exams'],
        },
        noteContents: [
            'Applied the wrong formula in this problem.',
            'Made a calculation error. Need to redo.',
            'Need to review the core concept again.',
            'Ran out of time and rushed through.',
            'Need to practice more similar problems.',
            'Process was correct but wrote wrong answer.',
            'Must memorize the basic formula.',
            'Misinterpreted the graph.',
        ],
        questionTitles: [
            "I don't understand the solution process.",
            'How should I apply this formula?',
            'Can you explain why this is the answer?',
            'Does this concept appear often in exams?',
            "I'd like to practice more similar problems.",
            'How should I organize my incorrect answers?',
            'Any tips to reduce calculation mistakes?',
            "What's the most important concept in this unit?",
        ],
        demoAcademyName: 'Demo Academy',
        demoCourse: 'Demo Course',
        demoTeacherSuffix: 'Teacher',
        demoMessages: {
            studentQuestion: 'Teacher, could you explain the solution process for this problem again? I don\'t quite understand how we move from the third to the fourth line.',
            teacherAnswer: 'Of course! That\'s a great question. In that step, we simplified the expression by applying the basic concept. Let me explain it again step-by-step.',
        },
        blockMessage: {
            title: 'Demo Mode',
            body: 'This feature is not available in demo mode.',
        },
        mockQuestionTypes: ['Concept Understanding', 'Formula Application', 'Applied Problem', 'Descriptive', 'Complex Type'],
    },

    vi: {
        subjects: [
            { id: 1, name: 'Toán', categories: ['Đại số', 'Hình học', 'Thống kê', 'Giải tích'] },
            { id: 2, name: 'Tiếng Anh', categories: ['Nghe', 'Đọc hiểu', 'Từ vựng', 'Ngữ pháp'] },
            { id: 3, name: 'Văn học', categories: ['Văn xuôi', 'Thơ', 'Ngữ pháp', 'Từ vựng'] },
            { id: 4, name: 'Khoa học', categories: ['Vật lý', 'Hóa học', 'Sinh học', 'Địa lý'] },
        ],
        examTypes: ['Thường xuyên', 'Giữa kỳ', 'Cuối kỳ', 'Thử nghiệm'],
        academyName: 'Trung tâm Demo',
        courseSuffix: 'Lớp',
        schoolSuffix: 'Trường THPT',
        examTitles: ['Kiểm tra giữa kỳ', 'Kiểm tra cuối kỳ', 'Thi thử', 'Kiểm tra chương'],
        textbookTitles: {
            type1: ['Sách Toán - Giải tích', 'Sách Tiếng Anh - Đọc hiểu'],
            type2: ['Sách Văn - Thơ', 'Sách Khoa học - Vật lý I'],
            type3: ['Sách Toán - Hình học'],
            type4: ['Bài tập Tiếng Anh - Ngữ pháp'],
            type5: ['Đề thi cũ Văn học'],
        },
        noteContents: [
            'Áp dụng sai công thức trong bài này.',
            'Tính toán nhầm. Cần làm lại.',
            'Cần ôn lại khái niệm cốt lõi.',
            'Không quản lý thời gian tốt, làm vội.',
            'Cần luyện thêm các dạng bài tương tự.',
            'Quá trình đúng nhưng ghi nhầm đáp án.',
            'Phải học thuộc công thức cơ bản.',
            'Đọc sai biểu đồ.',
        ],
        questionTitles: [
            'Em không hiểu quá trình giải bài này.',
            'Công thức này áp dụng như thế nào?',
            'Tại sao đây là đáp án đúng?',
            'Khái niệm này có hay ra trong đề thi không?',
            'Em muốn luyện thêm các bài tương tự.',
            'Nên ghi chép bài sai như thế nào?',
            'Làm thế nào để giảm lỗi tính toán?',
            'Khái niệm quan trọng nhất trong chương này là gì?',
        ],
        demoAcademyName: 'Trung tâm Demo',
        demoCourse: 'Khóa học Demo',
        demoTeacherSuffix: 'Giáo viên',
        demoMessages: {
            studentQuestion: 'Thầy/Cô ơi, thầy cô có thể giải thích lại quá trình giải bài này được không ạ? Đặc biệt là bước chuyển từ dòng thứ 3 sang dòng thứ 4 em vẫn chưa hiểu lắm.',
            teacherAnswer: 'Chào em! Câu hỏi rất hay. Ở bước đó, thầy/cô đã áp dụng khái niệm cơ bản để đơn giản hóa biểu thức. Để thầy/cô giải thích lại từng bước cho em dễ hiểu nhé.',
        },
        blockMessage: {
            title: 'Chế độ Demo',
            body: 'Chức năng này không khả dụng trong chế độ demo.',
        },
        mockQuestionTypes: ['Hiểu khái niệm', 'Áp dụng công thức', 'Bài tập ứng dụng', 'Tự luận', 'Dạng phức hợp'],
    },
};

export const getLocale = (lang: string): DemoLocale => {
    return DEMO_LOCALES[lang] ?? DEMO_LOCALES['ko'];
};
