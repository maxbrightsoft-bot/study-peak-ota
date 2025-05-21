import useAuthStore from "@/store/useAuthStore"
import { useState } from "react"

const useProfile = () => {
  const { user } = useAuthStore()
  const [isVisibleDrawer, setVisibleDrawer] = useState<number>()

  const handleVisibleDrawer = (id: number) => {
    setVisibleDrawer(id)
  }

  const handleCloseDrawer = () => {
    setVisibleDrawer(undefined)
  }

  return {
    user,
    isVisibleDrawer,
    handleCloseDrawer,
    handleVisibleDrawer
  }
}

export default useProfile