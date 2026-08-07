import { useTranslation } from "react-i18next"
import useAuthStore from "@/store/useAuthStore"

const useStep = () => {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const handleSubmit = (values: any) => {

  }

  return {
    t,
    user,
    handleSubmit
  }
}

export default useStep