export const QUICK_START_OPTIONS = [
    5,
    10,
    30
]

export const RoutesTab = () => [
    {
        icon: 'home',
        label: 'home',
        pathName: "Home"
    },
    {
        icon: 'book',
        label: 'test',
        pathName: "EXAM"
    },
    {
        icon: 'receipt',
        label: 'test_history',
        pathName: "EXAM_HISTORY"
    },
    {
        icon: 'stats-chart',
        label: 'study_trend',
        pathName: "EXAM_HISTORY"
    },
    {
        icon: 'ellipsis-horizontal',
        label: 'etc'
    },
]

export const INNER_OFFSET = 24
export const TICK_WIDTH = 1
export const ACTIVE_TICK_WIDTH = 2
export const TICK_SPACING = 4 + TICK_WIDTH
export const STROKE_WIDTH = 4
export const DEFAULT_CIRCULAR_TIMER_SIZE = 160
export const MAX_TIME_CIRCULAR_TIMER = 999 // minutes

export const TOTAL_SECONDS_IN_A_MINUTE = 60
export const TOTAL_SECONDS_IN_AN_HOUR = 60 * 60

export const DEFAULT_TIME_IN_MINUTES = 1
export const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 mins
export const PAUSE_INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 mins
export const INTERVAL_INACTIVITY_LIMIT = 10 * 1000;

export const INTERVAL_SAVE_TIMER = 15 * 1000; // 15 secs
export const TIMER_KEY = "tm"

export const ACCEPT_URL_TIMER = ['study-textbook', 'answer-the-check']

export const DEFAULT_AUDIO_URL = "/audio/beep.wav"

export const TOTAL_SECONDS_BEFORE_START = 5 * 60

export const TOAST_OPTIONS = {
    autoHide: false,
    position: "bottom",
    visibilityTime: 0
};
