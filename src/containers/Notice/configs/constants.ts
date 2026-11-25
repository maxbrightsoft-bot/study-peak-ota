import { TypeNotificationEnum } from "@/containers/Home/configs/constants";

/** The bell's personal tab (wrong-note / study-timer / note notifications from api/announcements). */
export const PERSONAL_NOTICE_TAB = 3
/** Where the drawer opens unless told otherwise (Home and Settings notice entries): the institute notice. */
export const DEFAULT_NOTICE_TAB = 0

export type NoticeTab = { label: string; value: number; type: TypeNotificationEnum[] }

export const TabList: NoticeTab[] = [
    {
        label: "wrong_note_bell_tab_notifications",
        value: PERSONAL_NOTICE_TAB,
        type: []
    },
    {
        label: "institute_notice",
        value: 0,
        type: [TypeNotificationEnum.Academy]
    },
    {
        label: "class_notice",
        value: 1,
        type: [TypeNotificationEnum.Class]
    },
    {
        label: "student_notice_notes",
        value: 2,
        type: [TypeNotificationEnum.Student]
    }
]

export const isPersonalNoticeTab = (value: number): boolean => value === PERSONAL_NOTICE_TAB

/** The personal tab is hidden for now: students have no api/announcements notices yet (the API answers 403 for them). */
export const SHOW_PERSONAL_NOTICE_TAB = false

export const getVisibleNoticeTabs = (showPersonal: boolean = SHOW_PERSONAL_NOTICE_TAB): NoticeTab[] =>
    TabList.filter(tab => showPersonal || !isPersonalNoticeTab(tab.value))

/** A visible tab by value; a hidden or unknown value falls back to the default tab (so the header bell opens the institute notice). */
export const noticeTab = (value: number, showPersonal: boolean = SHOW_PERSONAL_NOTICE_TAB): NoticeTab => {
    const tabs = getVisibleNoticeTabs(showPersonal)
    return tabs.find(tab => tab.value === value) ?? (tabs.find(tab => tab.value === DEFAULT_NOTICE_TAB) as NoticeTab)
}
