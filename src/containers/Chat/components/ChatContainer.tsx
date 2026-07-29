import { palette, TYPO } from '@/theme'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useMemo, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { IChatListProps, IInputChatProps } from '../configs/types'
import { ActivityIndicator } from 'react-native-paper'
import ChatItem from './ChatItem'
import { utcToLocalTime } from '@/utils/helpers'
import { isHTMLContent } from '../configs/helpers'
import useAuthStore from '@/store/useAuthStore'
import _ from 'lodash'
import SketchCanvas from './dialog/SketchCanvas'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import useDialog from '../hooks/useDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import UpdateMessageDialog from './UpdateMessageDialog'
import MathRichInput from '@/components/Input/MathRichInput'
import TextTooltip from '@/components/Tooltip/TextTooltip'

type prevSender = string | undefined

type Props = {
  t: any
  open: boolean
  onClose: () => void
  isLoadingMessages: boolean
  chatListProps: IChatListProps
  inputProps: IInputChatProps
  chatHeaderProps: any
  handleLoadMoreMessages: () => Promise<true | undefined>
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
    isOnlyConversationStudentWithTeacher
  } = chatHeaderProps
  const {
    isCompleted,
    onChangeInput,
    onSubmit,
    handleUploadImage,
    text,
    inputRef,
    isSending,
    handleUploadImageCanvas,
    openSketchCanvasDialog,
    handleOpenSketchCanvasDialog,
    handleCloseSketchCanvasDialog
  } = inputProps
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

  return (
    <SlideDrawerRoot visible={open}>
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={{ flex: 1, position: 'relative' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.subHeader}>
            <View style={styles.examInfoContainer}>
              <TextTooltip
                text={examTitle || ''}
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
                {courseId ? (
                  <Text style={styles.courseTitle}>
                    {questionOrder != undefined
                      ? t('problem_number_question', {
                        number: parentQuestionId
                          ? `${(parentQuestionOrder || 0) + 1}.${questionOrder + 1}`
                          : questionOrder + 1
                      })
                      : courseId
                        ? t('class_inquiry')
                        : t('exam_inquiry')}
                  </Text>
                ) : (
                  !isOnlyConversationStudentWithTeacher && (
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreText}>{score || 0}</Text>
                      <Text style={styles.totalScoreText}>/{totalScore || 0}</Text>
                    </View>
                  )
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
            <View style={styles.footer}>
              <View style={styles.actionGroup}>
                <TouchableOpacity
                  disabled={disabled}
                  onPress={handleOpenSketchCanvasDialog}
                  style={styles.sketchButton}
                >
                  <MaterialIcons name="draw" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity disabled={disabled} onPress={handleUploadImage} style={styles.iconButton}>
                  <Ionicons name="image-outline" size={20} color={palette.grey[600]} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <MathRichInput ref={inputRef} disabled={disabled} style={styles.input} onChange={(value) => onChangeInput(value)} />
              </View>

              <TouchableOpacity
                disabled={disabled || !text?.trim()}
                onPress={() => onSubmit()}
                style={[styles.sendButton, { opacity: disabled || !text?.trim() ? 0.4 : 1 }]}
              >
                {isSending ? (
                  <ActivityIndicator size={16} color="#FFF" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFF" />
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
    borderTopWidth: '1@ms',
    borderTopColor: '#F3F4F6',
    paddingHorizontal: '10@ms',
    paddingTop: '12@ms',
    paddingBottom: Platform.OS === 'ios' ? '32@ms' : '16@ms'
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: '4@ms'
  },

  actionGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8@ms',
    paddingBottom: '4@ms'
  },

  iconButton: {
    width: '32@ms',
    height: '32@ms',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8@ms',
    backgroundColor: '#F9FAFB',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB'
  },

  sketchButton: {
    backgroundColor: palette.main[600],
    width: '32@ms',
    height: '32@ms',
    borderRadius: '8@ms',
    justifyContent: 'center',
    alignItems: 'center'
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: '12@ms',
    minHeight: '100@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    borderWidth: '1@ms',
    borderColor: '#E5E7EB'
  },

  input: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    fontSize: '15@ms',
    color: palette.grey[900]
  },

  sendButton: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.main[600],
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: '2@ms',
    marginBottom: '6@ms'
  }
})

export default ChatContainer
