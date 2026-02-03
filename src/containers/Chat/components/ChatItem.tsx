import CustomTooltip from '@/components/Tooltip/CustomTooltip'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import useDialog from '../hooks/useDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import UpdateMessageDialog from './UpdateMessageDialog'
import { getSafeUrl, utcToLocalTime } from '@/utils/helpers'
import useTooltip from '../hooks/useTooltip'
import { Action } from '@/utils/types'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
import { Menu } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  t: any
  handleUpdateMessage: (conversationId: number, id: number, message: string, callback: any) => Promise<void>
  handleDeleteMessage: (conversationId: number, id: number, callback: any) => Promise<void>
  item: any
}

const ChatItem = ({ t, handleUpdateMessage, handleDeleteMessage, item }: Props) => {
  const {
    openDialog: openUpdateDialog,
    toggleDialog: toggleUpdateDialog,
    selectedFile,
    handleUploadImage
  } = useDialog()
  const { isOpenTooltip, handleCloseTooltip, handleOpenTooltip } = useTooltip()
  
  const { openDialog: openConfirmDialog, toggleDialog: toggleConfirmDialog } = useDialog()
  const { content, contentType, conversationId, id } = item

  const actions: Action<any>[] = [
    {
      label: t('edit'),
      onPress: () => {
        toggleUpdateDialog?.()
        handleCloseTooltip()
      }
    },
    {
      label: t('delete'),
      onPress: () => {
        toggleConfirmDialog?.()
        handleCloseTooltip()
      },
      textStyle: {
        color: '#db4d4d'
      }
    }
  ]

  return (
    <View>
      {item.showTimestamp && (
        <Text style={styles.timestamp}>{utcToLocalTime(item?.createdAt, t('date_time_format'))}</Text>
      )}

      {item.isMe ? (
  <View style={{ alignSelf: 'flex-end', maxWidth: '80%', flexDirection: "row", alignItems: "center" }}>
    <Menu
      visible={isOpenTooltip}
      onDismiss={handleCloseTooltip}
      anchorPosition='top'
      style={{ backgroundColor: "#FFF"}}
      contentStyle={{ backgroundColor: "#FFF"}}
      anchor={
        <TouchableOpacity
          onPress={handleOpenTooltip}
          hitSlop={8}
        >
          <Ionicons name="ellipsis-vertical-sharp" size={18} color={palette.grey[500]} />
        </TouchableOpacity>
      }
    >
      <Menu.Item
        onPress={() => {
          handleCloseTooltip()
          toggleUpdateDialog()
        }}
        titleStyle={{ color: palette.yellow[900] }}
        title={t('edit')}
      />
      <Menu.Item
        onPress={() => {
          handleCloseTooltip()
          toggleConfirmDialog()
        }}
        title={t('delete')}
        titleStyle={{ color: palette.red[900] }}
      />
    </Menu>

    <View
      style={[
        styles.messageContainer,
        styles.myMessage,
        item.contentType ? styles.imageMessage : null
      ]}
    >
      {item.contentType ? (
        <Image
          source={{ uri: getSafeUrl(item.content || '') }}
          style={{ width: 200, height: 200, objectFit: 'contain' }}
        />
      ) : item?.isHTMLContent ? (
        <MathRender
          content={item?.content || ''}
          style={{ backgroundColor: palette.main[500] }}
          textColor={palette.common.white}
        />
      ) : (
        <Text style={styles.myMessageText}>{item.content}</Text>
      )}
    </View>
  </View>
) : (
        <View
          style={[
            styles.messageContainer,
            item.isMe ? styles.myMessage : styles.otherMessage,
            item.contentType ? styles.imageMessage : ''
          ]}
        >
          {item.contentType ? (
            <Image
              source={{ uri: getSafeUrl(item.content || '') }}
              style={{ width: 200, height: 200, position: 'relative', objectFit: 'contain' }}
            />
          ) : (
            <MathRender
              content={item?.content || ''}
              style={{ backgroundColor: '#FFF' }}
              textColor={palette.grey[700]}
            />
          )}
        </View>
      )}
      <ConfirmDialog
        open={openConfirmDialog}
        toggle={toggleConfirmDialog}
        text={t('confirm_delete_message')}
        onConfirm={() => handleDeleteMessage(conversationId || 0, id || 0, toggleConfirmDialog)}
        title={t('confirmation')}
        okText={t('yes')}
        cancelText={t('no')}
      />
      <UpdateMessageDialog
        open={openUpdateDialog}
        onClose={toggleUpdateDialog}
        content={content}
        selectedFile={selectedFile}
        handleUploadImage={handleUploadImage}
        contentType={contentType}
        handleUpdateMessage={(content) =>
          handleUpdateMessage(conversationId || 0, id || 0, content, toggleUpdateDialog)
        }
      />
    </View>
  )
}

const styles = ScaledSheet.create({
  dateTitle: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  messagesList: {},
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8
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
    ...TYPO.caption,
    color: '#97A1AF',
    textAlign: 'center',
    marginBottom: 8,
    paddingVertical: '8@ms'
  },
  input: {
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: 6
  }
})

export default ChatItem
