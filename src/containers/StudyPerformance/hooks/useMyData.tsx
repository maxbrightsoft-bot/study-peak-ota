import { useEffect, useRef, useState } from "react"
import { TabList } from "../configs/constants"
import useAuthStore from "@/store/useAuthStore"
import { Role } from "@/utils/enums"
import { useTranslation } from "react-i18next"

const useMyData = () => {
    const { user, setLoading } = useAuthStore()
    const academyDomain = user?.academyDomain
    const isSuperAdmin = (user?.roles || []).includes(
            Role.Admin
        ) && !academyDomain

    const isLearningSpace = (user?.isLearningSpace
    )
    const isAcademy = isLearningSpace || !!academyDomain
    const isAdminOrNonAcademy = !isAcademy || isSuperAdmin

    const contentRef = useRef<any>(null)
    const { t } = useTranslation()

    const [selected, setSelected] = useState(TabList[0].value)
    const [isReadyPrint, setReadyPrint] = useState(false)
    const [isClickPrint, setClickPrint] = useState(false)

    const handlePrint = () => {
        if (!isReadyPrint || !isClickPrint) return

        setTimeout(() => {
            handleTogglePrint()
            setLoading(false)
        }, 300)
    }

    const handleReadyPrint = () => {
        setReadyPrint(true)
    }

    const handleTogglePrint = () => {
        setClickPrint(prev => !prev)
    }

    const handleChangeTab = (newValue: any) => {
        setSelected(newValue)
        setReadyPrint(false)
        setClickPrint(false)
    }

    useEffect(() => {
        if (isClickPrint) {
            setLoading(true)
        }

        handlePrint()
    }, [isReadyPrint, isClickPrint])

    return {
        t,
        selected,
        contentRef,
        handlePrint,
        handleReadyPrint,
        handleTogglePrint,
        handleChangeTab,
        isAdminOrNonAcademy
    }
}

export default useMyData
