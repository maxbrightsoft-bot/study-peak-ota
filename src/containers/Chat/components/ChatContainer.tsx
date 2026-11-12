import { palette, TYPO } from '@/theme'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { IChatListProps, IInputChatProps } from '../configs/types'
import { ActivityIndicator } from 'react-native-paper'
import ChatItem from './ChatItem'
import { utcToLocalTime } from '@/utils/helpers'
import { isHTMLContent } from '../configs/helpers'
import { getCategoryTitle } from '../configs/constants'
import useAuthStore from '@/store/useAuthStore'
import _ from 'lodash'
import SketchCanvas from './dialog/SketchCanvas'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import useDialog from '../hooks/useDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import UpdateMessageDialog from './UpdateMessageDialog'
import MathRichInput from '@/components/Input/MathRichInput'
import TextTooltip from '@/components/Tooltip/TextTooltip'
import { ConversationType } from '@/utils/enums'

type prevSender = string | undefined

type Props = {
  t: any
  open: boolean
  onClose: () => void
  isLoadingMessages: boolean
  chatListProps: IChatListProps
  inputProps: IInputChatProps
  chatHeaderProps: any
  handleLoadMoreMessages: () => Promise<any>
}
const ChatContainer = ({
  t,
  open,
  onClose,
  chatListProps,
  inputProps,
  chatHeaderProps,
  handleLoadMoreMessages,
  isLoadingMessages
}: Props) => {
  const { isLoading } = useAuthStore()
  const { messages, isScrollToEnd, handleUpdateMessage, handleDeleteMessage, handleToggleScrollToEnd } = chatListProps
  const {
    examTitle,
    courseName,
    teacherName,
    examSessionId,
    createdAt,
    score,
    totalScore,
    courseId,
    isSelected,
    questionOrder,
    studentAttemptNumber,
    studentTotalAttemptTime,
    parentQuestionId,
    parentQuestionOrder,
    isOnlyConversationStudentWithTeacher,
    category
  } = chatHeaderProps
  const {
    isCompleted,
    onChangeInput,
    onSubmit,
    handleUploadImage,
    handleTakePhoto,
    handlePickFromGallery,
    text,
    inputRef,
    isSending,
    handleUploadImageCanvas,
    openSketchCanvasDialog,
    handleOpenSketchCanvasDialog,
    handleCloseSketchCanvasDialog
  } = inputProps
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [showDrawPicker, setShowDrawPicker] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const { selectedItem, handleUploadImage: handleUpdateUploadImage, openDialog: openUpdateDialog, openConfirmDialog, toggleConfirmDialog, toggleDialog: toggleUpdateDialog, selectedFile } = useDialog()
  const flatListRef = useRef<FlatList>(null)
  const disabled = isCompleted || isSending
  const filterMessage = useMemo(() => {
    let prevTime = 0
    let prevSender: prevSender
    return _.uniqBy(messages, 'id')?.map((message) => {
      const currentTime = new Date(message.createdAt).getTime()
      const showTimestamp = !prevTime || prevTime - currentTime > 20 * 60 * 1000
      const showName = message.sender?.fullName !== prevSender
      prevSender = message.sender?.fullName
      prevTime = currentTime
      return { ...message, showTimestamp, showName, isHTMLContent: isHTMLContent(message.content || '') }
    })
  }, [JSON.stringify(messages)])

  useEffect(() => {
    if (isScrollToEnd) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true })

      handleToggleScrollToEnd()
    }
  }, [isScrollToEnd])

  const isTeacherChat =
    !examSessionId &&
    !examTitle &&
    !courseId &&
    !courseName &&
    (!!teacherName ||
      !!chatHeaderProps?.teacherId ||
      !!chatHeaderProps?.mainTeacherCourseName ||
      chatHeaderProps?.type === ConversationType.StaffStudent ||
      chatHeaderProps?.type === ConversationType.TeacherStudent ||
      !!isOnlyConversationStudentWithTeacher)

  const teacherDisplayName =
    teacherName ||
    (chatHeaderProps as any)?.mainTeacherCourseName ||
    (isTeacherChat ? t('teacher') : undefined)

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="close" size={20} color={palette.grey[900]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{t('ask_a_question')}</Text>
        </View>
        <View></View>
      </View>
      <KeyboardAvoidingView
        keyboardVerticalOffset={0}
        style={{ flex: 1, position: 'relative' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.subHeader}>
            <View style={styles.examInfoContainer}>
              <TextTooltip
                text={
                  examTitle ||
                  courseName ||
                  (isTeacherChat
                    ? (teacherDisplayName ? `${t('teacher')}: ${teacherDisplayName}` : t('teacher'))
                    : t('general_inquiry'))
                }
                numberOfLines={1}
                placement="bottom"
                textStyle={styles.examTitle}
                containerStyle={{ flexShrink: 1 }}
              />
              {studentTotalAttemptTime > 1 && (
                <Text style={[TYPO.button4, { color: isSelected ? palette.main[600] : palette.red[900] }]}>
                  #{studentAttemptNumber + 1}/{studentTotalAttemptTime}
                </Text>
              )}
            </View>
            <View style={styles.headerRight}>
              <View>
                {questionOrder != undefined ? (
                  <Text style={styles.courseTitle}>
                    {t('problem_number_question', {
                      number: parentQuestionId
                        ? `${(parentQuestionOrder || 0) + 1}.${questionOrder + 1}`
                        : questionOrder + 1
                    })}
                  </Text>
                ) : examTitle || examSessionId ? (
                  (score != null && totalScore != null && totalScore > 0) ? (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>{score || 0}</Text>
                      <Text style={styles.totalScoreText}>/{totalScore || 0}</Text>
                    </View>
                  ) : (
                    <Text style={styles.courseTitle}>{t('exam_inquiry')}</Text>
                  )
                ) : courseId || courseName ? (
                  <Text style={styles.courseTitle}>{getCategoryTitle(t, category) || t('class_inquiry')}</Text>
                ) : isTeacherChat ? (
                  <Text style={styles.courseTitle}>{t('direct_message')}</Text>
                ) : (
                  <Text style={styles.courseTitle}>{getCategoryTitle(t, category) || t('general_inquiry')}</Text>
                )}
              </View>
              <Text style={styles.dateTitle}>{utcToLocalTime(createdAt, t('date_format'))}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            {!isLoading && isLoadingMessages && (
              <View style={[styles.overlay]}>
                <ActivityIndicator style={{ paddingVertical: 12 }} animating={true} color={palette.primary.main} />
              </View>
            )}
            {!filterMessage?.length ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.dateTitle}>{t('no_message')}</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={filterMessage}
                style={styles.chatList}
                renderItem={({ item }) => (
                  <ChatItem
                    t={t}
                    toggleConfirmDialog={toggleConfirmDialog}
                    toggleUpdateDialog={toggleUpdateDialog}
                    handleUpdateMessage={handleUpdateMessage}
                    handleDeleteMessage={handleDeleteMessage}
                    item={item}
                    isCompleted={isCompleted}
                  />
                )}
                removeClippedSubviews={false}
                keyboardDismissMode="interactive"
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => `${item.id}${item.createdAt}`}
                onEndReached={handleLoadMoreMessages}
                inverted
                initialNumToRender={20}
                onEndReachedThreshold={0.1}
              />
            )}
          </View>

          <View style={styles.footerWrapper}>
            <View style={[styles.footer, isFocused && styles.footerFocused]}>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  disabled={disabled}
                  onPress={() => setShowImagePicker(true)}
                  style={styles.iconButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="image-outline" size={20} color={palette.grey[700]} />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={disabled}
                  onPress={() => setShowDrawPicker(true)}
                  style={styles.sketchButton}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="draw" size={20} color={palette.main[600]} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <MathRichInput
                  ref={inputRef}
                  disabled={disabled}
                  placeholder={t('chat_input_placeholder')}
                  compact
                  hideToolbar
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  style={styles.input}
                  onChange={(value) => onChangeInput(value)}
                />
              </View>

              <TouchableOpacity
                disabled={disabled || !text?.trim()}
                onPress={() => onSubmit()}
                activeOpacity={0.8}
                style={[
                  styles.sendButton,
                  text?.trim() ? styles.sendButtonActive : styles.sendButtonDisabled
                ]}
              >
                {isSending ? (
                  <ActivityIndicator size={16} color="#FFF" />
                ) : (
                  <Ionicons
                    name="send"
                    size={16}
                    color={text?.trim() ? '#FFF' : '#94A3B8'}
                    style={{ marginLeft: 2 }}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
          {openSketchCanvasDialog && (
            <SketchCanvas
              t={t}
              open={openSketchCanvasDialog}
              onClose={handleCloseSketchCanvasDialog}
              onSubmit={handleUploadImageCanvas}
            />
          )}
        </View>
        <ConfirmDialog
          open={openConfirmDialog}
          toggle={toggleConfirmDialog}
          text={t('confirm_delete_message')}
          onConfirm={() => handleDeleteMessage(selectedItem?.conversationId || 0, selectedItem?.id || 0, toggleConfirmDialog)}
          title={t('confirmation')}
          okText={t('yes')}
          cancelText={t('no')}
        />

        {openUpdateDialog && <UpdateMessageDialog
          open={openUpdateDialog}
          onClose={toggleUpdateDialog}
          content={selectedItem?.content}
          selectedFile={selectedFile}
          handleUploadImage={handleUpdateUploadImage}
          contentType={selectedItem?.contentType}
          handleUpdateMessage={(newContent) =>
            handleUpdateMessage(selectedItem?.conversationId || 0, selectedItem?.id || 0, newContent, toggleUpdateDialog)
          }
        />}
      </KeyboardAvoidingView>

      {showImagePicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowImagePicker(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('select_image_source')}</Text>
              <TouchableOpacity onPress={() => setShowImagePicker(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={palette.grey[600]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowImagePicker(false)
                setTimeout(() => {
                  handleTakePhoto?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#EBF5FF' }]}>
                <Ionicons name="camera" size={22} color={palette.main[500]} />
              </View>
              <Text style={styles.optionText}>{t('take_photo')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowImagePicker(false)
                setTimeout(() => {
                  handlePickFromGallery?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="images" size={22} color="#16a34a" />
              </View>
              <Text style={styles.optionText}>{t('choose_from_gallery')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelButton}
              onPress={() => setShowImagePicker(false)}
            >
              <Text style={styles.sheetCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showDrawPicker && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowDrawPicker(false)}
          />
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{t('select_drawing_tool')}</Text>
              <TouchableOpacity onPress={() => setShowDrawPicker(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={palette.grey[600]} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowDrawPicker(false)
                setTimeout(() => {
                  handleOpenSketchCanvasDialog?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#EEF2FF' }]}>
                <MaterialIcons name="draw" size={22} color={palette.main[600]} />
              </View>
              <Text style={styles.optionText}>{t('sketch_canvas')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => {
                setShowDrawPicker(false)
                setTimeout(() => {
                  inputRef.current?.openHandwriting?.()
                }, 200)
              }}
            >
              <View style={[styles.optionIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <MaterialIcons name="gesture" size={22} color="#D97706" />
              </View>
              <Text style={styles.optionText}>{t('handwriting_math')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sheetCancelButton}
              onPress={() => setShowDrawPicker(false)}
            >
              <Text style={styles.sheetCancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SlideDrawerRoot>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    paddingVertical: '16@ms',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFF'
  },
  subHeader: {
    flexDirection: 'row',
    paddingVertical: '12@ms',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    backgroundColor: '#FFF',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#F3F4F6'
  },
  examInfoContainer: {
    flexDirection: 'row',
    gap: '8@ms',
    alignItems: 'center',
    flex: 1,
    marginRight: '12@ms'
  },
  headerRight: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  courseTitle: {
    fontWeight: '700',
    fontSize: '11@ms',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: palette.grey[500],
    marginBottom: '2@ms'
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: '2@ms',
    alignItems: 'baseline',
    marginBottom: '2@ms'
  },
  scoreText: {
    fontWeight: '700',
    fontSize: '16@ms',
    color: palette.grey[900]
  },
  totalScoreText: {
    fontWeight: '600',
    fontSize: '12@ms',
    color: palette.grey[400]
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    position: 'absolute',
    height: '100%',
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'transparent'
  },
  center: {
    alignItems: 'center'
  },
  inline: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    position: 'absolute',
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  examTitle: {
    ...TYPO.button3,
    color: palette.grey[900],
    flexShrink: 1
  },
  dateTitle: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  emptyContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chatList: {
    backgroundColor: palette.main[50],
    paddingHorizontal: '24@ms'
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: palette.main[600]
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  myMessageText: {
    ...TYPO.button4,
    color: '#FFF'
  },
  otherMessageText: {
    ...TYPO.button4,
    color: palette.grey[900]
  },
  imageMessage: {
    backgroundColor: 'white',
    borderWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  inputContainer: {
    position: 'absolute',
    bottom: '10@ms',
    flexDirection: 'row',
    gap: '8@ms',
    alignItems: 'center',
    paddingVertical: '12@ms',
    backgroundColor: 'white',
    paddingHorizontal: '24@ms'
  },
  timestamp: {
    fontSize: '12@ms',
    color: '#97A1AF',
    textAlign: 'center',
    marginBottom: '4@ms'
  },
  footerWrapper: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: '12@ms',
    paddingTop: '8@ms',
    paddingBottom: Platform.OS === 'ios' ? '28@ms' : '10@ms'
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: '24@ms',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: '6@ms',
    paddingVertical: '4@ms',
    gap: '6@ms'
  },

  footerFocused: {
    borderColor: palette.main[500],
    backgroundColor: '#FFFFFF',
    shadowColor: palette.main[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3
  },

  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '4@ms',
    paddingLeft: '2@ms'
  },

  iconButton: {
    width: '32@ms',
    height: '32@ms',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '16@ms',
    backgroundColor: '#F1F5F9'
  },

  sketchButton: {
    backgroundColor: '#EEF2FF',
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    height: '36@ms',
    minHeight: '36@ms',
    maxHeight: '120@ms',
    justifyContent: 'center'
  },

  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: '15@ms',
    color: palette.grey[900]
  },

  sendButton: {
    width: '34@ms',
    height: '34@ms',
    borderRadius: '17@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },

  sendButtonActive: {
    backgroundColor: palette.main[600],
    shadowColor: palette.main[600],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3
  },

  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
    opacity: 0.7
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 999
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '20@ms',
    paddingTop: '20@ms',
    paddingBottom: Platform.OS === 'ios' ? '36@ms' : '24@ms',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16@ms'
  },
  sheetTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#222'
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '14@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: '14@ms'
  },
  optionIconCircle: {
    width: '42@ms',
    height: '42@ms',
    borderRadius: '21@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },
  optionText: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#333'
  },
  sheetCancelButton: {
    marginTop: '12@ms',
    paddingVertical: '14@ms',
    borderRadius: '10@ms',
    backgroundColor: '#F3F4F6',
    alignItems: 'center'
  },
  sheetCancelText: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#666'
  }
})

export default ChatContainer
