import { palette } from "@/theme"
import { MyDeadlineState, MyQuestionState } from "./enums"

export type StateLook = {
    glyph: string
    color: string
    bg: string
    borderColor?: string
    dashed?: boolean
    key: string
}

/** Glyph, colours and label key for a question state (same mapping as the web hub). */
export const stateLook = (state: MyQuestionState): StateLook => {
    switch (state) {
        case MyQuestionState.NotWritten:
            return {
                glyph: "!",
                color: palette.error.dark,
                bg: palette.red[300],
                key: "mywrongnote_state_not_written"
            }
        case MyQuestionState.Pending:
            return {
                glyph: "✓",
                color: palette.success.dark,
                bg: palette.green_support[100],
                borderColor: palette.green_support[500],
                dashed: true,
                key: "mywrongnote_state_pending"
            }
        case MyQuestionState.Rejected:
            return {
                glyph: "↺",
                color: palette.warning.darker,
                bg: palette.warning.lighter,
                key: "mywrongnote_state_rejected"
            }
        case MyQuestionState.Approved:
            return {
                glyph: "✓",
                color: palette.common.white,
                bg: palette.success.dark,
                key: "mywrongnote_state_approved"
            }
        case MyQuestionState.Missed:
            return {
                glyph: "✕",
                color: palette.grey[500],
                bg: palette.grey[300],
                key: "mywrongnote_state_missed"
            }
        default:
            return {
                glyph: "",
                color: palette.grey[500],
                bg: palette.grey[100],
                key: "mywrongnote_state_correct"
            }
    }
}

/** Colours for a deadline chip. */
export const deadlineTone = (state: MyDeadlineState) => {
    switch (state) {
        case MyDeadlineState.DueSoon:
        case MyDeadlineState.Overdue:
            return { color: palette.error.dark, bg: palette.error.lighter }
        case MyDeadlineState.Open:
            return { color: palette.main[700], bg: palette.main[100] }
        case MyDeadlineState.LateAllowed:
            return { color: palette.warning.dark, bg: palette.warning.lighter }
        default:
            return { color: palette.grey[500], bg: palette.grey[200] }
    }
}
