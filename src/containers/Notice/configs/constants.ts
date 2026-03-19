import { TypeNotificationEnum } from "@/containers/Home/configs/constants";

export const TabList = [
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