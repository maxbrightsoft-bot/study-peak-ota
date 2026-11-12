import { useEffect, useRef } from 'react'
import { BackHandler } from 'react-native'
import { useNavigation } from '@react-navigation/native'

export type PreventBackCondition = boolean | (() => boolean)

export interface PreventBackOptions {
  /**
   * Điều kiện để chặn quay lại:
   * - `true` hoặc hàm trả về `true`: Chặn quay lại.
   * - `false` hoặc hàm trả về `false`: Cho phép quay lại bình thường.
   * Mặc định là `true`.
   */
  shouldBlock?: PreventBackCondition
  /**
   * Callback tùy chọn khi người dùng cố gắng quay lại nhưng bị chặn.
   * Dùng để hiển thị thông báo, Alert xác nhận, v.v.
   */
  onBlocked?: () => void
}

/**
 * Hook tiện ích dùng để chặn quay lại (nút Back cứng Android, cử chỉ vuốt iOS và React Navigation)
 *
 * @example
 * // Cách 1: Truyền boolean
 * usePreventBack(isSubmitting)
 *
 * // Cách 2: Truyền hàm kiểm tra động (đọc state mới nhất)
 * usePreventBack(() => !isSaved)
 *
 * // Cách 3: Truyền object có callback cảnh báo
 * usePreventBack({
 *   shouldBlock: () => isLinkingFlow && !isAccepted,
 *   onBlocked: () => toast.warning('Vui lòng hoàn tất quá trình')
 * })
 */
export const usePreventBack = (
  optionsOrCondition: PreventBackCondition | PreventBackOptions = true,
  onBlockedArg?: () => void
) => {
  const navigation = useNavigation<any>()

  const normalizedOptions: PreventBackOptions =
    typeof optionsOrCondition === 'object' && optionsOrCondition !== null && !('call' in optionsOrCondition)
      ? optionsOrCondition
      : {
          shouldBlock: optionsOrCondition as PreventBackCondition,
          onBlocked: onBlockedArg,
        }

  const { shouldBlock = true, onBlocked } = normalizedOptions

  const shouldBlockRef = useRef(shouldBlock)
  const onBlockedRef = useRef(onBlocked)

  useEffect(() => {
    shouldBlockRef.current = shouldBlock
    onBlockedRef.current = onBlocked
  }, [shouldBlock, onBlocked])

  const checkShouldBlock = () => {
    if (typeof shouldBlockRef.current === 'function') {
      return shouldBlockRef.current()
    }
    return Boolean(shouldBlockRef.current)
  }

  useEffect(() => {
    const isBlocking = checkShouldBlock()

    // Bật / tắt cử chỉ swipe back trên iOS
    navigation?.setOptions?.({
      gestureEnabled: !isBlocking,
    })

    // Chặn nút Back cứng trên Android
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (checkShouldBlock()) {
        onBlockedRef.current?.()
        return true
      }
      return false
    })

    // Chặn React Navigation điều hướng ra khỏi màn hình
    const unsubscribe = navigation?.addListener?.('beforeRemove', (e: any) => {
      if (!checkShouldBlock()) {
        return
      }
      e.preventDefault()
      onBlockedRef.current?.()
    })

    return () => {
      navigation?.setOptions?.({
        gestureEnabled: true,
      })
      backHandler.remove()
      unsubscribe?.()
    }
  }, [navigation, typeof shouldBlock === 'boolean' ? shouldBlock : undefined])
}

export default usePreventBack

