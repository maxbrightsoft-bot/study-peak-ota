import { useCallback, useEffect, useRef, useState } from 'react'
import { getListCommentApi, postCommentApi, deleteCommentApi } from '@/containers/Home/apiClients'
import { apiUploadImageFile } from '@/containers/ExamResultList/apiClients'
import useAuthStore from '@/store/useAuthStore'
import { getSocket } from '@/services'
import { NoteComment } from '../configs/types'
import { getErrorMessage, toast } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import * as ImagePicker from 'expo-image-picker'

type Props = {
  noteId?: number
  visible?: boolean
}

export const useNoteComments = ({ noteId, visible }: Props) => {
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const academyDomain = selectedAcademy?.domain || user?.academyDomain

  const [comments, setComments] = useState<NoteComment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [text, setText] = useState('')
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [replyingTo, setReplyingTo] = useState<NoteComment | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<NoteComment | null>(null)
  const [loadingReplies, setLoadingReplies] = useState<{ [key: number]: boolean }>({})

  const commentsRef = useRef<NoteComment[]>([])
  useEffect(() => {
    commentsRef.current = comments
  }, [comments])

  const fetchComments = useCallback(async () => {
    if (!noteId) return
    setIsLoading(true)
    try {
      const res = await getListCommentApi(noteId, {
        currentPage: 1,
        pageSize: -1,
        sortColumnDirection: 'DESC',
        sortColumnName: 'CreatedAt'
      })
      const items: NoteComment[] = res?.data?.items || []
      setComments(items)
    } catch (error) {
      console.log('[fetchComments error]', error)
    } finally {
      setIsLoading(false)
    }
  }, [noteId])

  const handleFetchReplies = useCallback(async (parentCommentId: number) => {
    if (!noteId) return
    setLoadingReplies(prev => ({ ...prev, [parentCommentId]: true }))
    try {
      const res = await getListCommentApi(noteId, {
        parentCommentId,
        currentPage: 1,
        pageSize: -1,
        sortColumnDirection: 'ASC',
        sortColumnName: 'CreatedAt'
      })
      const replyItems: NoteComment[] = res?.data?.items || []
      setComments(prev =>
        prev.map(c => {
          if (c.id === parentCommentId) {
            return {
              ...c,
              replies: replyItems,
              replyCount: Math.max(c.replyCount || 0, replyItems.length)
            }
          }
          return c
        })
      )
    } catch (error) {
      console.log('[handleFetchReplies error]', error)
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoadingReplies(prev => ({ ...prev, [parentCommentId]: false }))
    }
  }, [noteId, t])

  const handleCollapseReplies = useCallback((parentCommentId: number) => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: undefined
          }
        }
        return c
      })
    )
  }, [])

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8
      })
      let asset = (!result.canceled && result.assets && result.assets.length > 0) ? result.assets[0] : null
      if (!asset) {
        const pending = await ImagePicker.getPendingResultAsync()
        if (pending && 'assets' in pending && pending.assets?.length && !pending.canceled) {
          asset = pending.assets[0]
        }
      }
      if (asset) {
        setSelectedImage(asset)
      }
    } catch (error) {
      console.log('[handlePickImage error]', error)
      toast.error(getErrorMessage(t, error))
    }
  }, [t])

  const handleTakePhoto = useCallback(async () => {
    try {
      const currentPerm = await ImagePicker.getCameraPermissionsAsync()
      let isGranted = currentPerm.granted
      if (!isGranted) {
        const requested = await ImagePicker.requestCameraPermissionsAsync()
        isGranted = requested.granted
      }

      if (!isGranted) {
        toast.error(t('camera_permission_required') || '카메라 권한이 필요합니다')
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8
      })

      let asset = (!result.canceled && result.assets && result.assets.length > 0) ? result.assets[0] : null
      if (!asset) {
        const pending = await ImagePicker.getPendingResultAsync()
        if (pending && 'assets' in pending && pending.assets?.length && !pending.canceled) {
          asset = pending.assets[0]
        }
      }

      if (asset) {
        setSelectedImage(asset)
      }
    } catch (error) {
      console.log('[handleTakePhoto error]', error)
      toast.error(getErrorMessage(t, error))
    }
  }, [t])

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const handleSetReplyingTo = useCallback((comment: NoteComment) => {
    setReplyingTo(comment)
  }, [])

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null)
  }, [])

  const handleSendComment = useCallback(async () => {
    if (!noteId) return
    const trimmedText = text.trim()
    if (!trimmedText && !selectedImage) return

    setIsSending(true)
    try {
      let uploadedImageUrl: string | undefined = undefined

      if (selectedImage) {
        let fileName = selectedImage.fileName
        if (!fileName || !fileName.includes('.')) {
          const ext = selectedImage.mimeType?.includes('png') ? 'png' : 'jpg'
          fileName = `photo_${Date.now()}.${ext}`
        }
        const mimeType = selectedImage.mimeType || (fileName.endsWith('.png') ? 'image/png' : 'image/jpeg')

        const formData = new FormData()
        formData.append('upload', {
          uri: selectedImage.uri,
          type: mimeType,
          name: fileName
        } as any)

        const uploadRes = await apiUploadImageFile(formData)
        uploadedImageUrl =
          uploadRes?.data?.url ||
          uploadRes?.data?.Url ||
          (typeof uploadRes?.data === 'string' ? uploadRes.data : '') ||
          (uploadRes as any)?.url
      }

      const payload = {
        content: trimmedText,
        imageUrl: uploadedImageUrl,
        parentCommentId: replyingTo?.id,
        mentionIds: [],
        isMentionAll: false
      }

      const res = await postCommentApi(noteId, payload)
      const newComment: NoteComment = res?.data

      if (newComment) {
        if (newComment.parentCommentId) {
          setComments(prev =>
            prev.map(c => {
              if (c.id === newComment.parentCommentId) {
                const currentReplies = c.replies || []
                const isExisted = currentReplies.some(r => r.id === newComment.id)
                return {
                  ...c,
                  replies: isExisted ? currentReplies : [...currentReplies, newComment],
                  replyCount: (c.replyCount || 0) + 1
                }
              }
              return c
            })
          )
        } else {
          setComments(prev => {
            const isExisted = prev.some(c => c.id === newComment.id)
            if (isExisted) return prev
            return [newComment, ...prev]
          })
        }
      }

      setText('')
      setSelectedImage(null)
      setReplyingTo(null)
    } catch (error) {
      console.log('[handleSendComment error]', error)
      toast.error(getErrorMessage(t, error))
    } finally {
      setIsSending(false)
    }
  }, [noteId, text, selectedImage, replyingTo, t])

  const handleDeleteComment = useCallback(
    async (comment: NoteComment) => {
      if (!noteId || !comment.id) return
      try {
        await deleteCommentApi(noteId, comment.id)
        if (comment.parentCommentId) {
          setComments(prev =>
            prev.map(c => {
              if (c.id === comment.parentCommentId) {
                return {
                  ...c,
                  replies: c.replies ? c.replies.filter(r => r.id !== comment.id) : undefined,
                  replyCount: Math.max(0, (c.replyCount || 1) - 1)
                }
              }
              return c
            })
          )
        } else {
          setComments(prev => prev.filter(c => c.id !== comment.id))
        }
      } catch (error) {
        console.log('[handleDeleteComment error]', error)
        toast.error(getErrorMessage(t, error))
      } finally {
        setOpenDeleteConfirm(false)
        setCommentToDelete(null)
      }
    },
    [noteId, t]
  )

  const handlePromptDelete = useCallback((comment: NoteComment) => {
    setCommentToDelete(comment)
    setOpenDeleteConfirm(true)
  }, [])

  const handleCloseDeleteConfirm = useCallback(() => {
    setOpenDeleteConfirm(false)
    setCommentToDelete(null)
  }, [])

  // Socket real-time synchronization
  useEffect(() => {
    if (!noteId || !academyDomain || visible === false) return

    const socket = getSocket()
    if (!socket) return

    const normalizedDomain = academyDomain.trim().toUpperCase()
    const channelName = `NOTE-${normalizedDomain}-${noteId}-CHANNEL`

    socket.emit('subscribe', channelName)

    const handleNewCommentEvent = (data: string) => {
      if (!data) return
      try {
        const parsed: NoteComment = JSON.parse(data)
        if (!parsed?.id) return

        if (parsed.parentCommentId) {
          setComments(prev =>
            prev.map(c => {
              if (c.id === parsed.parentCommentId) {
                const currentReplies = c.replies || []
                const isExisted = currentReplies.some(r => r.id === parsed.id)
                return {
                  ...c,
                  replies: isExisted ? currentReplies : [...currentReplies, parsed],
                  replyCount: isExisted ? c.replyCount : (c.replyCount || 0) + 1
                }
              }
              return c
            })
          )
        } else {
          setComments(prev => {
            const isExisted = prev.some(c => c.id === parsed.id)
            if (isExisted) return prev
            return [parsed, ...prev]
          })
        }
      } catch (err) {
        console.log('[handleNewCommentEvent error]', err)
      }
    }

    const handleUpdateCommentEvent = (data: string) => {
      if (!data) return
      try {
        const parsed: NoteComment = JSON.parse(data)
        if (!parsed?.id) return

        if (parsed.parentCommentId) {
          setComments(prev =>
            prev.map(c => {
              if (c.id === parsed.parentCommentId && c.replies) {
                return {
                  ...c,
                  replies: c.replies.map(r => (r.id === parsed.id ? parsed : r))
                }
              }
              return c
            })
          )
        } else {
          setComments(prev => prev.map(c => (c.id === parsed.id ? { ...c, ...parsed } : c)))
        }
      } catch (err) {
        console.log('[handleUpdateCommentEvent error]', err)
      }
    }

    const handleDeleteCommentEvent = (data: string) => {
      if (!data) return
      try {
        const parsed = JSON.parse(data)
        const deletedId = parsed?.id
        const parentId = parsed?.parentCommentId

        if (!deletedId) return

        if (parentId) {
          setComments(prev =>
            prev.map(c => {
              if (c.id === parentId) {
                return {
                  ...c,
                  replies: c.replies ? c.replies.filter(r => r.id !== deletedId) : undefined,
                  replyCount: Math.max(0, (c.replyCount || 1) - 1)
                }
              }
              return c
            })
          )
        } else {
          setComments(prev => prev.filter(c => c.id !== deletedId))
        }
      } catch (err) {
        console.log('[handleDeleteCommentEvent error]', err)
      }
    }

    socket.on('new-comment-event', handleNewCommentEvent)
    socket.on('updated-comment-event', handleUpdateCommentEvent)
    socket.on('deleted-comment-event', handleDeleteCommentEvent)

    return () => {
      socket.emit('unsubscribe', channelName)
      socket.off('new-comment-event', handleNewCommentEvent)
      socket.off('updated-comment-event', handleUpdateCommentEvent)
      socket.off('deleted-comment-event', handleDeleteCommentEvent)
    }
  }, [noteId, academyDomain, visible])

  useEffect(() => {
    if (noteId && visible !== false) {
      fetchComments()
    } else {
      setComments([])
      setText('')
      setSelectedImage(null)
      setReplyingTo(null)
    }
  }, [noteId, visible, fetchComments])

  return {
    comments,
    isLoading,
    isSending,
    text,
    setText,
    selectedImage,
    replyingTo,
    openDeleteConfirm,
    commentToDelete,
    loadingReplies,
    currentUser: user,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    handleSetReplyingTo,
    handleCancelReply,
    handleSendComment,
    handlePromptDelete,
    handleDeleteComment,
    handleCloseDeleteConfirm,
    handleFetchReplies,
    handleCollapseReplies,
    refreshComments: fetchComments
  }
}
