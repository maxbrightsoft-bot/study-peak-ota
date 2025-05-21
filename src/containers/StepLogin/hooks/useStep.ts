import { useTranslation } from "react-i18next"

const useStep = () => {
  const { t } = useTranslation()

  const handleSubmit = (values: any) => {

  }

  return {
    t,
    handleSubmit
  }
}

export default useStep