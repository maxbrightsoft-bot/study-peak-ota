import TextField from '@/components/Input/TextField'
import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import React, { useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { IChatHeaderProps, IChatListProps, IInputChatProps } from '../configs/types'
import { ActivityIndicator } from 'react-native-paper'
import ChatItem from './ChatItem'
import { utcToLocalTime } from '@/utils/helpers'

type prevSender = string | undefined

type Props = {
  t: any
  isLoadingMessages: boolean
  chatListProps: IChatListProps
  inputProps: IInputChatProps
  chatHeaderProps: IChatHeaderProps
  handleLoadMoreMessages: () => Promise<true | undefined>
}
const ChatContainer = ({ t, chatListProps, inputProps, chatHeaderProps, handleLoadMoreMessages, isLoadingMessages }: Props) => {
  const { messages, handleUpdateMessage, handleDeleteMessage, } = chatListProps
  const { isCompleted, onChangeInput, onSubmit, handleUploadImage, text } = inputProps

  const filterMessage = useMemo(() => {
    let prevTime = 0
    let prevSender: prevSender
    return messages?.map((message) => {
      const currentTime = new Date(message.createdAt).getTime()
      const showTimestamp = !prevTime || prevTime - currentTime > 20 * 60 * 1000
      const showName = message.sender?.fullName !== prevSender
      prevSender = message.sender?.fullName
      prevTime = currentTime
      return { ...message, showTimestamp, showName }
    })
  }, [JSON.stringify(messages)])

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
        <View style={styles.header}>
          <Text style={styles.examTitle}>{chatHeaderProps.examTitle}</Text>
          <Text style={styles.dateTitle}>{utcToLocalTime(chatHeaderProps.createdAt, t('date_format'))}</Text>
        </View>
        <View style={{ height: '80%'}}>
          {isLoadingMessages && (
            <ActivityIndicator style={{ paddingVertical: 12 }} animating={true} color={palette.primary.main} />
          )}
          {!isLoadingMessages && !filterMessage?.length ? (
            <View style={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.dateTitle}>{t('no_message')}</Text>
            </View>
          ) : (
            <FlatList
              data={filterMessage}
              renderItem={({item}) => (
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
          <TouchableOpacity onPress={handleUploadImage}>
            <Ionicons name="add-circle" size={32} color={palette.grey[500]} />
          </TouchableOpacity>
          <View style={{ flexGrow: 1 }}>
            <TextField value={text} style={styles.input} onChangeText={onChangeInput} />
          </View>
          <TouchableOpacity onPress={onSubmit}>
            <Ionicons name="send" disabled={isCompleted} size={25} color={palette.main[500]} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    position: 'fixed',
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
