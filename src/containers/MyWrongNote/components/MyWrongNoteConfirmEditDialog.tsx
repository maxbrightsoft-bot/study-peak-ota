import React from "react"
import { useTranslation } from "react-i18next"
import { ConfirmDialog } from "@/components/ModalBase/ConfirmDialog"

type Props = {
    open: boolean
    onConfirm: () => void
    onCancel: () => void
}

// W17/W18: editing an approved note sends it back to "waiting for check".
const MyWrongNoteConfirmEditDialog = ({ open, onConfirm, onCancel }: Props) => {
    const { t } = useTranslation()
    return (
        <ConfirmDialog
            open={open}
            title={t("mywrongnote_confirm_edit_title")}
            text={t("mywrongnote_confirm_edit_text")}
            cancelText={t("mywrongnote_cancel")}
            okText={t("mywrongnote_action_edit")}
            onConfirm={onConfirm}
            onCancel={onCancel}
            toggle={onCancel}
        />
    )
}

export default MyWrongNoteConfirmEditDialog
