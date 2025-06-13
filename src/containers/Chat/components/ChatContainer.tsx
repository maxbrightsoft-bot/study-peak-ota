import TextField from '@/components/Input/TextField'
import { palette, TYPO } from '@/theme'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import React, { useEffect, useMemo, useRef } from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { IChatHeaderProps, IChatListProps, IInputChatProps } from '../configs/types'
import { ActivityIndicator } from 'react-native-paper'
import ChatItem from './ChatItem'
import { utcToLocalTime } from '@/utils/helpers'
import { isHTMLContent } from '../configs/helpers'
import useAuthStore from '@/store/useAuthStore'
import _ from 'lodash'
import SketchCanvas from './dialog/SketchCanvas'

type prevSender = string | undefined

type Props = {
  t: any
  isLoadingMessages: boolean
  chatListProps: IChatListProps
  inputProps: IInputChatProps
  chatHeaderProps: IChatHeaderProps
  handleLoadMoreMessages: () => Promise<true | undefined>
}
const ChatContainer = ({
  t,
  chatListProps,
  inputProps,
  chatHeaderProps,
  handleLoadMoreMessages,
  isLoadingMessages
}: Props) => {
  const { isLoading } = useAuthStore()
  const { messages, isScrollToEnd, handleUpdateMessage, handleDeleteMessage, handleToggleScrollToEnd } = chatListProps
  const {
    isCompleted,
    onChangeInput,
    onSubmit,
    handleUploadImage,
    text,
    handleUploadImageCanvas,
    openSketchCanvasDialog,
    handleOpenSketchCanvasDialog,
    handleCloseSketchCanvasDialog
  } = inputProps
  const flatListRef = useRef<FlatList>(null)
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.examTitle}>{chatHeaderProps.examTitle}</Text>
        <Text style={styles.dateTitle}>{utcToLocalTime(chatHeaderProps.createdAt, t('date_format'))}</Text>
      </View>
      <View style={{ height: "75%"}}>
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
            renderItem={({ item }) => (
              <ChatItem
                t={t}
                handleUpdateMessage={handleUpdateMessage}
                handleDeleteMessage={handleDeleteMessage}
                item={item}
              />
            )}
            removeClippedSubviews={true}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => `${item.id}${item.createdAt}`}
            onEndReached={handleLoadMoreMessages}
            inverted
            initialNumToRender={20}
            onEndReachedThreshold={0.1}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={{ justifyContent: 'center', alignItems: 'center', gap: 4 }}>
          <TouchableOpacity onPress={handleUploadImage}>
            <Ionicons name="add-circle" size={32} color={palette.grey[500]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: palette.main[500],
              borderRadius: 255,
              paddingVertical: 5,
              paddingHorizontal: 12
            }}
            onPress={handleOpenSketchCanvasDialog}
          >
            <MaterialIcons name="draw" disabled={isCompleted} size={25} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={{ flexGrow: 1 }}>
          <TextField value={text} style={styles.input} onChangeText={onChangeInput} />
        </View>
        <TouchableOpacity onPress={() => onSubmit()}>
          <Ionicons name="send" disabled={isCompleted} size={25} color={palette.main[500]} />
        </TouchableOpacity>
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
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    paddingVertical: '18@ms',
    alignItems: 'center',
    justifyContent: 'space-between'
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
    color: palette.grey[900]
  },
  dateTitle: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: palette.main[500]
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
    bottom: 0,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: '12@ms',
    backgroundColor: 'white'
  },
  timestamp: {
    fontSize: 12,
    color: '#97A1AF',
    textAlign: 'center',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: 6
  }
})

export default ChatContainer
