import { palette, TYPO } from '@/theme'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useMemo, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput } from 'react-native'
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
import MathRichInput, { MathRichInputRef } from '@/components/Input/MathRichInput'
import TextField from '@/components/Input/TextField'

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
        keyboardVerticalOffset={80}
        style={{ flex: 1, position: 'relative' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flex: 1 }}>
              <Text style={styles.examTitle}>{examTitle}</Text>
              {studentTotalAttemptTime > 1 && (
                <Text style={[TYPO.button4, { color: isSelected ? palette.main[600] : palette.red[900] }]}>
                  #{studentAttemptNumber + 1}/{studentTotalAttemptTime}
                </Text>
              )}
            </View>
            <View style={{ justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <View>
                {courseId ? (
                  <Text
                    style={{
                      fontWeight: '700',
                      fontSize: 12,
                      lineHeight: 14.32,
                      color: '#1F2937'
                    }}
                  >
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
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 4
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 12,
                          lineHeight: 14.32,
                          color: '#4B5563'
                        }}
                      >
                        {score || 0}
                      </Text>
                      <Text
                        style={{
                          fontWeight: '700',
                          fontSize: 12,
                          lineHeight: 14.32,
                          color: '#D1D5DB'
                        }}
                      >
                        /{totalScore || 0}
                      </Text>
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
              <View style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={styles.dateTitle}>{t('no_message')}</Text>
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={filterMessage}
                style={{
                  backgroundColor: palette.main[50],
                  paddingHorizontal: 24
                }}
                renderItem={({ item }) => (
                  <ChatItem
                    t={t}
                    toggleConfirmDialog={toggleConfirmDialog}
                    toggleUpdateDialog={toggleUpdateDialog}
                    handleUpdateMessage={handleUpdateMessage}
                    handleDeleteMessage={handleDeleteMessage}
                    item={item}
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
                <TouchableOpacity disabled={disabled} onPress={handleUploadImage} style={styles.iconButton}>
                  <Ionicons name="image-outline" size={22} color={palette.grey[600]} />
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={disabled}
                  onPress={handleOpenSketchCanvasDialog}
                  style={styles.sketchButton}
                >
                  <MaterialIcons name="draw" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputWrapper}>
                <TextField inputRef={inputRef} multiline numberOfLines={3} disabled={disabled} style={styles.input} onChangeText={onChangeInput} />
                {/* <MathRichInput ref={inputRef} disabled={disabled} style={styles.input} onChange={(value) => onChangeInput(value)} /> */}
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
    paddingHorizontal: '24@ms'
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
    flex: 1
  },
  dateTitle: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: palette.main[600]
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderWidth: 1,
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
    borderWidth: 1,
    borderColor: palette.grey[100]
  },
  inputContainer: {
    position: 'absolute',
    bottom: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: '12@ms',
    backgroundColor: 'white',
    paddingHorizontal: '24@ms'
  },
  timestamp: {
    fontSize: 12,
    color: '#97A1AF',
    textAlign: 'center',
    marginBottom: 4
  },
  footerWrapper: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: palette.grey[100],
    paddingHorizontal: '20@ms',
    paddingTop: '10@ms',
    paddingBottom: 20
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },

  actionGroup: {
    justifyContent: 'flex-end',
    gap: 6
  },

  iconButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },

  sketchButton: {
    backgroundColor: palette.main[600],
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },

  inputWrapper: {
    flex: 1,
    backgroundColor: palette.grey[100],
    borderRadius: 20,
    height: '80@ms'
  },

  input: {
    borderWidth: 0,
    backgroundColor: 'transparent'
  },

  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: palette.main[600],
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default ChatContainer
