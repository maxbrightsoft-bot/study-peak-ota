import { Slide } from './types'

// ─── Slide screenshots (actual app captures) ──────────────────────────────────
const SLIDE_IMAGES = {
  studySpace:    require('./slideAssets/slide1.jpg'),  // Slide 1
  timer:         require('./slideAssets/slide2.jpg'),  // Slide 2, 3, 4, 5
  problemBank:   require('./slideAssets/slide3.jpg'),  // Slide 7
  exam:          require('./slideAssets/slide4.jpg'),  // Slide 6
  myScore:       require('./slideAssets/slide5.jpg'),  // Slide 8
  myScoreList:   require('./slideAssets/slide6.jpg'),  // Extra/Alt
  incorrectNote: require('./slideAssets/slide7.jpg'),  // Slide 9
  stats:         require('./slideAssets/slide8.jpg'),  // Slide 10
  community:     require('./slideAssets/slide9.jpg'),  // Slide 11
}

export const getSlides = (t: any): Slide[] => [

  // ─── Slide 0: Welcome ───────────────────────────────────────────────────────
  {
    id: 'welcome',
    type: 'welcome',
    stats: [
      { value: '12', label: t('tutorial.stat_features') },
      { value: t('tutorial.stat_duration_value', '3분'), label: t('tutorial.stat_duration') },
      { value: '∞', label: t('tutorial.stat_data') },
    ],
  },

  // ─── Slide 1: Study Space ───────────────────────────────────────────────────
  {
    id: 'study-space',
    type: 'feature',
    step: 1,
    badge: t('tutorial.slide1_badge'),
    title: t('tutorial.slide1_title'),
    titleAccent: t('tutorial.slide1_title_accent'),
    description: t('tutorial.slide1_desc'),
    imageSource: SLIDE_IMAGES.studySpace,
    features: [
      {
        icon: '🎯',
        title: t('tutorial.slide1_f1_title'),
        description: t('tutorial.slide1_f1_desc'),
      },
      {
        icon: '🔄',
        title: t('tutorial.slide1_f2_title'),
        description: t('tutorial.slide1_f2_desc'),
      },
    ],
  },

  // ─── Slide 2: Study Timer ───────────────────────────────────────────────────
  {
    id: 'timer',
    type: 'feature',
    step: 2,
    badge: t('tutorial.slide2_badge'),
    title: t('tutorial.slide2_title'),
    titleAccent: t('tutorial.slide2_title_accent'),
    description: t('tutorial.slide2_desc'),
    imageSource: SLIDE_IMAGES.timer,
    features: [
      {
        icon: '⏱️',
        title: t('tutorial.slide2_f1_title'),
        description: t('tutorial.slide2_f1_desc'),
      },
      {
        icon: '📊',
        title: t('tutorial.slide2_f2_title'),
        description: t('tutorial.slide2_f2_desc'),
      },
    ],
  },

  // ─── Slide 3: 과목별 타이머 (Highlight: Subject Tabs) ───────────────────────────
  {
    id: 'timer-subject',
    type: 'feature',
    step: 3,
    badge: t('tutorial.slide3_badge'),
    title: t('tutorial.slide3_title'),
    titleAccent: t('tutorial.slide3_title_accent'),
    description: t('tutorial.slide3_desc'),
    imageSource: SLIDE_IMAGES.timer,
    focusArea: { top: '21%', left: '6%', width: '20%', height: '7%' },
    features: [
      {
        icon: '📚',
        title: t('tutorial.slide3_f1_title'),
        description: t('tutorial.slide3_f1_desc'),
      },
      {
        icon: '➕',
        title: t('tutorial.slide3_f2_title'),
        description: t('tutorial.slide3_f2_desc'),
      },
    ],
  },

  {
    id: 'timer-attendance',
    type: 'feature',
    step: 4,
    badge: t('tutorial.slide4_badge'),
    title: t('tutorial.slide4_title'),
    titleAccent: t('tutorial.slide4_title_accent'),
    description: t('tutorial.slide4_desc'),
    imageSource: SLIDE_IMAGES.timer,
    focusArea: { top: '53%', left: '2%', width: '38%', height: '28%' }, // Match screenshot 4
    features: [
      {
        icon: '🖐️',
        title: t('tutorial.slide4_f1_title'),
        description: t('tutorial.slide4_f1_desc'),
      },
      {
        icon: '📋',
        title: t('tutorial.slide4_f2_title'),
        description: t('tutorial.slide4_f2_desc'),
      },
    ],
  },

  // ─── Slide 5: 시험 코드로 풀기 (Highlight: Exam Code Box) ─────────────────────
  {
    id: 'timer-examcode',
    type: 'feature',
    step: 5,
    badge: t('tutorial.slide5_badge'),
    title: t('tutorial.slide5_title'),
    titleAccent: t('tutorial.slide5_title_accent'),
    description: t('tutorial.slide5_desc'),
    imageSource: SLIDE_IMAGES.timer,
    focusArea: { top: '53%', left: '42%', width: '56%', height: '15%' },
    features: [
      {
        icon: '🔑',
        title: t('tutorial.slide5_f1_title'),
        description: t('tutorial.slide5_f1_desc'),
      },
      {
        icon: '⚡',
        title: t('tutorial.slide5_f2_title'),
        description: t('tutorial.slide5_f2_desc'),
      },
    ],
  },

  // ─── Slide 6: 시험 진행 ─────────────────────────────────────────────────────
  {
    id: 'exam',
    type: 'feature',
    step: 6,
    badge: t('tutorial.slide6_badge'),
    title: t('tutorial.slide6_title'),
    titleAccent: t('tutorial.slide6_title_accent'),
    description: t('tutorial.slide6_desc'),
    imageSource: SLIDE_IMAGES.exam,
    features: [
      {
        icon: '📝',
        title: t('tutorial.slide6_f1_title'),
        description: t('tutorial.slide6_f1_desc'),
      },
      {
        icon: '🎙️',
        title: t('tutorial.slide6_f2_title'),
        description: t('tutorial.slide6_f2_desc'),
      },
    ],
  },

  // ─── Slide 7: 문제 은행 ─────────────────────────────────────────────────────
  {
    id: 'problem-bank',
    type: 'feature',
    step: 7,
    badge: t('tutorial.slide7_badge'),
    title: t('tutorial.slide7_title'),
    titleAccent: t('tutorial.slide7_title_accent'),
    description: t('tutorial.slide7_desc'),
    imageSource: SLIDE_IMAGES.problemBank,
    features: [
      {
        icon: '📚',
        title: t('tutorial.slide7_f1_title'),
        description: t('tutorial.slide7_f1_desc'),
      },
      {
        icon: '🔍',
        title: t('tutorial.slide7_f2_title'),
        description: t('tutorial.slide7_f2_desc'),
      },
    ],
  },

  // ─── Slide 8: 내 성적 ──────────────────────────────────────────────────────
  {
    id: 'my-score',
    type: 'feature',
    step: 8,
    badge: t('tutorial.slide8_badge'),
    title: t('tutorial.slide8_title'),
    titleAccent: t('tutorial.slide8_title_accent'),
    description: t('tutorial.slide8_desc'),
    imageSource: SLIDE_IMAGES.myScore,
    features: [
      {
        icon: '🏆',
        title: t('tutorial.slide8_f1_title'),
        description: t('tutorial.slide8_f1_desc'),
      },
      {
        icon: '🔁',
        title: t('tutorial.slide8_f2_title'),
        description: t('tutorial.slide8_f2_desc'),
      },
    ],
  },

  // ─── Slide 9: 오답 노트 ─────────────────────────────────────────────────────
  {
    id: 'incorrect-note',
    type: 'feature',
    step: 9,
    badge: t('tutorial.slide9_badge'),
    title: t('tutorial.slide9_title'),
    titleAccent: t('tutorial.slide9_title_accent'),
    description: t('tutorial.slide9_desc'),
    imageSource: SLIDE_IMAGES.incorrectNote,
    features: [
      {
        icon: '📸',
        title: t('tutorial.slide9_f1_title'),
        description: t('tutorial.slide9_f1_desc'),
      },
      {
        icon: '🏷️',
        title: t('tutorial.slide9_f2_title'),
        description: t('tutorial.slide9_f2_desc'),
      },
    ],
  },

  // ─── Slide 10: 통계 ────────────────────────────────────────────────────────
  {
    id: 'stats',
    type: 'feature',
    step: 10,
    badge: t('tutorial.slide10_badge'),
    title: t('tutorial.slide10_title'),
    titleAccent: t('tutorial.slide10_title_accent'),
    description: t('tutorial.slide10_desc'),
    imageSource: SLIDE_IMAGES.stats,
    features: [
      {
        icon: '📊',
        title: t('tutorial.slide10_f1_title'),
        description: t('tutorial.slide10_f1_desc'),
      },
      {
        icon: '🎯',
        title: t('tutorial.slide10_f2_title'),
        description: t('tutorial.slide10_f2_desc'),
      },
    ],
  },

  // ─── Slide 11: 커뮤니티 ────────────────────────────────────────────────────
  {
    id: 'community',
    type: 'feature',
    step: 11,
    badge: t('tutorial.slide11_badge'),
    title: t('tutorial.slide11_title'),
    titleAccent: t('tutorial.slide11_title_accent'),
    description: t('tutorial.slide11_desc'),
    imageSource: SLIDE_IMAGES.community,
    features: [
      {
        icon: '💬',
        title: t('tutorial.slide11_f1_title'),
        description: t('tutorial.slide11_f1_desc'),
      },
      {
        icon: '🔥',
        title: t('tutorial.slide11_f2_title'),
        description: t('tutorial.slide11_f2_desc'),
      },
    ],
  },

  // ─── Slide 12: Final ───────────────────────────────────────────────────────
  {
    id: 'final',
    type: 'final',
    title: t('tutorial.final_title'),
    subtitle: t('tutorial.final_subtitle'),
  },
]
