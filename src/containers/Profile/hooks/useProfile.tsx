import useAuthStore from '@/store/useAuthStore'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback, useState } from 'react'

const useProfile = () => {
  const { user } = useAuthStore()
  const [isVisibleDrawer, setVisibleDrawer] = useState<number>()

  const handleVisibleDrawer = (id: number) => {
    setVisibleDrawer(id)
  }

  const handleCloseDrawer = () => {
    setVisibleDrawer(undefined)
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        handleCloseDrawer()
      }
    }, [])
  )

  return {
    user,
    isVisibleDrawer,
    handleCloseDrawer,
    handleVisibleDrawer
  }
}

export default useProfile
