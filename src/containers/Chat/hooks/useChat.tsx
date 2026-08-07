import useAuthStore from "@/store/useAuthStore"

const useChat = () => {
  const { user } = useAuthStore()
  return {
    user
  }
}

export default useChat