import SlideDrawer from '@/components/ModalBase/SlideDrawer'
import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import useConversationList from './hooks/useConversationList'
import SearchInput from '@/components/Input/SearchInput'
import CreateConversationDialog from './components/CreateConversationDialog'
import ConversationItem from './components/ConversationItem'
import ChatContainer from './components/ChatContainer'
import useChatContainer from './hooks/useChatContainer'
import usePusherConversation from './hooks/usePusherConversation'

type Props = {
  isVisible: boolean
  onClose: () => void
}
const Chat = ({ isVisible, onClose }: Props) => {
  const {
    t,
    user,
    selectedConversation,
    conversations,
    textSearch,
    handleChangeSelectedConversation,
    handleChangeTextSearch,
    setSelectedConversation,
    isVisibleCreateConversationDialog,
    handleCloseCreateConversationDialog
  } = useConversationList()

  const { isLoadingMessages, chatListProps, inputProps, chatHeaderProps, handleLoadMoreMessages } = useChatContainer({
    conversation: selectedConversation
  })
  usePusherConversation()

  const renderItem = ({ item }: any) => (
    <ConversationItem
      t={t}
      textSearch={textSearch}
      conversation={item}
      handleSelect={handleChangeSelectedConversation}
    />
  )

  return (
    <SlideDrawer visible={isVisible}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (selectedConversation ? setSelectedConversation(undefined) : onClose())}
          >
            <Ionicons name="chevron-back-outline" size={24} color={palette.main[500]} />
            <Text style={[styles.backText]}>티로 가기</Text>
          </TouchableOpacity>
          <View style={styles.profileHeader}>
            <View style={[styles.profileInfo, { gap: selectedConversation ? 4 : 12 }]}>
              <Avatar.Image size={24} style={{ backgroundColor: '#fff' }} source={{ uri: user?.avatar }} />
              <Text style={selectedConversation ? styles.textCommon : styles.nameText}>
                {selectedConversation ? selectedConversation.teacherName : user?.fullName}
              </Text>
            </View>
            {selectedConversation?.category && (
              <Text style={[styles.textCommon, { color: palette.main[500] }]}>{t(selectedConversation?.category)}</Text>
            )}
          </View>
        </View>
        <View style={styles.contentContainer}>
          {!selectedConversation && (
            <SearchInput
              value={textSearch}
              onChangeText={handleChangeTextSearch}
              placeholder={t('search_placeholder')}
            />
          )}
          {!!selectedConversation ? (
            <ChatContainer
              t={t}
              isLoadingMessages={isLoadingMessages}
              handleLoadMoreMessages={handleLoadMoreMessages}
              chatListProps={chatListProps}
              inputProps={inputProps}
              chatHeaderProps={chatHeaderProps}
            />
          ) : (
            <FlatList data={conversations} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} />
          )}
        </View>
        {/* {!selectedConversation && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.buttonAdd} onPress={handleVisibleCreateConversationDialog}>
              <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        )} */}
      </View>
      <CreateConversationDialog
        t={t}
        isVisible={isVisibleCreateConversationDialog}
        onClose={handleCloseCreateConversationDialog}
      />
    </SlideDrawer>
  )
}

export default Chat

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '14@ms'
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: palette.grey[900]
  },
  textCommon: {
    fontSize: 16,
    fontWeight: 500
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    color: palette.main[500]
  },
  contentContainer: {
    flex: 1,
    gap: '8@ms',
    paddingHorizontal: '24@ms'
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '24@ms',
    right: '24@ms'
  },
  buttonAdd: {
    borderRadius: 255,
    backgroundColor: palette.main[500],
    width: '45@ms',
    height: '45@ms',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
