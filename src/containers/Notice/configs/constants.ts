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

export const noticeTab = (value: number): NoticeTab =>
    TabList.find(tab => tab.value === value) ?? (TabList.find(tab => tab.value === DEFAULT_NOTICE_TAB) as NoticeTab)
