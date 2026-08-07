import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigation, useRoute } from "@react-navigation/native"
import useAuthStore from "@/store/useAuthStore"
import useLogin from "@/containers/Login/hooks/useLogin"
import { 
    createAcademyRequestApi, 
    getAcademyRequestApi,
    switchAcademy
} from "@/services/api/academyService"
import { getSocket } from "@/services"
import { Role } from "@/utils/enums"
import { getErrorMessage, toast } from "@/utils/helpers"
import { ErrorMessageCodes } from "@/utils/constants/error"
import { LoginAccessTokenRequest } from "@/utils/types"
import { MainRoutes, Routes } from "@/navigators/RouteName"

export enum AcademyEnrollmentRequestStatus {
    PendingApproval = 0,
    Approved = 1,
    Rejected = 2
}

export enum AcademyRequestEvent {
    NEW_ACADEMY_REQUEST_EVENT = "new-academy-request",
    RESOLVED_ACADEMY_REQUEST_EVENT = "resolved-academy-request"
}

const useAcademyRequest = () => {
    const { t } = useTranslation()
    const navigation = useNavigation<any>()
    const route = useRoute<any>()
    const { domain: academyDomain } = route.params || {}
    const courseId = route.params?.class ? +route.params.class : undefined
    const user = useAuthStore(state => state.user)
    const setGlobalLoading = useAuthStore(state => state.setLoading)
    const setSelectAcademy = useAuthStore(state => state.setSelectAcademy)
    const { handleLoginAccessToken } = useLogin()

    const [isLoading, setLoading] = useState<boolean>(false)
    const [isRequestSending, setRequestSending] = useState<boolean>(false)
    const [academyRequest, setAcademyRequest] = useState<any | null>()
    const [isNotFound, setNotFound] = useState<boolean>(false)
    const [otherRole, setOtherRole] = useState<any>()

    const role = Role.Student
    const isSuper = !!user && !user.academyDomain && !user.isLearningSpace
    const channel = useRef<string>("")
    const socket = getSocket()
    const isFetched = useRef<boolean>(false)

    const getAcademyRequestError = (error: any) => {
        const errorMessageCode = error?.response?.data?.title
        if (
            error?.response?.status !== 420 ||
            errorMessageCode !== ErrorMessageCodes.TheUserAlreadyExistInTheAcademyWithRole
        )
            return
        const jsonData = error?.response?.data?.instance
        try {
            const data = JSON.parse(decodeURIComponent(jsonData))
            setOtherRole(data)
        } catch {}
    }

    const getAcademyRequest = async () => {
        if (!academyDomain) return
        setAcademyRequest(undefined)
        setOtherRole(undefined)
        setLoading(true)
        try {
            const res = await getAcademyRequestApi(
                academyDomain,
                role,
                courseId,
                isSuper
            )
            
            setAcademyRequest(res.data ?? null)
            if (!isFetched.current) isFetched.current = true
        } catch (err: any) {
            setAcademyRequest(null)
            if (err?.response?.status === 404) setNotFound(true)
            getAcademyRequestError(err)
        }
        finally {
            setLoading(false)
        }
    }

    const sendAcademyRequest = async () => {
        if (!user?.id || !academyDomain) return
        setRequestSending(true)
        try {
            const res = await createAcademyRequestApi(
                academyDomain,
                {
                    role,
                    courseId
                },
                isSuper
            )
            setAcademyRequest(res.data ?? null)
            toast.success(t("request_sent_successfully"))
        } catch (err: any) {
            toast.error(getErrorMessage(t, err))
        }
        finally {
            setRequestSending(false)
        }
    }

    const handleSwitchAcademy = async (isLearningSpace: boolean) => {
        if (!academyRequest || !academyRequest.academyId) return
        setGlobalLoading(true)
        try {
            const res = await switchAcademy(academyRequest.academyId, Role.Student, isLearningSpace)
            const data = res.data
            const requestBody: LoginAccessTokenRequest = {
                accessToken: data.accessToken,
                email: user?.email || "",
                role: Role.Student,
                isMobile: true
            }

            const selectedAcademy = {
                id: academyRequest.academyId,
                name: academyRequest.academyName,
                image: academyRequest.academyImage ?? "",
                domain: academyRequest.academyDomain ?? ""
            }

            await handleLoginAccessToken(
                requestBody,
                isLearningSpace,
                selectedAcademy.domain,
                false,
            )

            setSelectAcademy(selectedAcademy)
            navigation.reset({ index: 0, routes: [{ name: MainRoutes.AuthStack }] })
        } catch (error) {
            toast.error(getErrorMessage(t, error))
        } finally {
            setGlobalLoading(false)
        }
    }

    const handleUpdateRequest = (data: string) => {
        if (!data) return
        const item = JSON.parse(data)
        setAcademyRequest((state: any) => (state?.id === item?.id ? item : state))
    }

    const goHome = () => {
        navigation.reset({ index: 0, routes: [{ name: MainRoutes.AuthStack }] })
    }

    useEffect(() => {
        if (!user?.id) {
            navigation.navigate(MainRoutes.UnAuthStack, {
                screen: Routes.UnAuth.Login,
                params: { 
                    redirectUrl: Routes.AcademyRequest,
                    params: {
                        domain: academyDomain,
                        class: courseId
                    }
                }
            })
            return
        }
        getAcademyRequest()
    }, [user?.id, isSuper, role, academyDomain, courseId])

    useEffect(() => {

        if (!!academyDomain && !!user?.superId && !!socket) {
            channel.current = `academy-${academyDomain.trim().toUpperCase()}-channel-${user?.superId}`
            
            socket.emit("subscribe", channel.current)
            socket.on(
                AcademyRequestEvent.NEW_ACADEMY_REQUEST_EVENT,
                handleUpdateRequest
            )
            socket.on(
                AcademyRequestEvent.RESOLVED_ACADEMY_REQUEST_EVENT,
                handleUpdateRequest
            )
        }
        return () => {
            if (socket) {
                socket.emit("unsubscribe", channel.current)
                socket.off(
                    AcademyRequestEvent.NEW_ACADEMY_REQUEST_EVENT,
                    handleUpdateRequest
                )
                socket.off(
                    AcademyRequestEvent.RESOLVED_ACADEMY_REQUEST_EVENT,
                    handleUpdateRequest
                )
            }
        }
    }, [user?.superId, academyDomain, socket?.id, !!socket])

    return {
        t,
        isFetched: isFetched.current,
        otherRole,
        isNotFound,
        isLoading,
        isRequestSending,
        academyRequest,
        sendAcademyRequest,
        handleSwitchAcademy,
        goHome,
        academyDomain,
        navigation
    }
}

export default useAcademyRequest
