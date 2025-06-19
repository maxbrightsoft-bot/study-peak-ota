import useAuthStore from "@/store/useAuthStore"
import { ACADEMY_DOMAIN, ACCESS_TOKEN, LEARNING_SPACE, REDIRECT_URL } from "@/utils/constants"
import { getErrorMessage, toast } from "@/utils/helpers"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { loginPhone } from "../apiClients/authService"
import { Role } from "@/utils/enums"
import { PhoneLoginRequest } from "../configs/types"
import { Routes } from "@/navigators/RouteName"
import { removeDataStorage, setDataStorage } from "@/utils/storage"

const useLoginPhoneNumber = () => {
    const { user, setLoading, setUser } = useAuthStore()
    const academyDomain = user?.academyDomain || ''
    const { t } = useTranslation()
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const handleRedirectAfterSuccess = async (
        data: any,
        token: string,
        redirectUrl: string
    ) => {
        setUser({
            ...data,
        });
        await setDataStorage(ACCESS_TOKEN, token);
        !data.academyDomain && await removeDataStorage(ACADEMY_DOMAIN);
        !!data.academyDomain && await setDataStorage(ACADEMY_DOMAIN, data.academyDomain);
        data.isLearningSpace
            ? await setDataStorage(LEARNING_SPACE, "true")
            : await removeDataStorage(LEARNING_SPACE);
        await setDataStorage(REDIRECT_URL, redirectUrl)
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword)
    }

    const handleLoginPhoneNumber = async (values: { password: string, phoneNumber: string }) => {
        setLoading(true)
        try {
            const data: PhoneLoginRequest = {
                role: Role.Student,
                isMobile: true,
                ...values
            }
            if (!academyDomain) await setDataStorage(LEARNING_SPACE, "true")
            const res = await loginPhone(academyDomain, data)
            const loginResponse = res?.data
            const { isFirstLogin, token, user } = loginResponse
            const isAcademy = !!user?.academyDomain || !!user?.isLearningSpace
            const needToRegister = isFirstLogin && isAcademy;
            let redirectUrl;

            if (needToRegister) {
                redirectUrl = Routes.Auth.Onboarding;
            } else if (isAcademy) {
                redirectUrl = Routes.Auth.Home;
            } else {
                redirectUrl = Routes.Auth.SelectAcademy;
            }
            await handleRedirectAfterSuccess(
                {
                    ...user,
                    isNotEnoughStatements: isFirstLogin
                },
                token,
                redirectUrl
            )
        } catch (error: any) {
            if (error?.response?.status === 500 && error?.response?.data?.title === "PhoneNumberIsDuplicated")
                toast.error(t("duplicate_passcode_for_siblings_please_contact_admin_for_assistance"))
            else {
                !!academyDomain && await removeDataStorage(ACADEMY_DOMAIN)
                await removeDataStorage(LEARNING_SPACE);
                toast.error(getErrorMessage(t, error))
            }
        }
        setLoading(false)
    }

    return {
        t,
        showPassword,
        handleLoginPhoneNumber,
        handleClickShowPassword,
    }
}

export default useLoginPhoneNumber
