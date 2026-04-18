import { Image, Text, TouchableOpacity, View } from 'react-native'
import { getSafeUrl, utcToLocalTime } from '@/utils/helpers'
import { palette, TYPO } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import BottomSheet from '@/components/ModalBase/BottomSheet'
import { BASE_URL } from '@/utils/constants'

type Props = {
  t: any
  toggleUpdateDialog: (item?: any) => void
  toggleConfirmDialog: (item?: any) => void
  handleUpdateMessage: (conversationId: number, id: number, message: string, callback: any) => Promise<void>
  handleDeleteMessage: (conversationId: number, id: number, callback: any) => Promise<void>
  item: any
}

const ChatItem = ({ t, item, toggleUpdateDialog, toggleConfirmDialog }: Props) => {
  const [openActionSheet, setOpenActionSheet] = useState(false)

  const { content, contentType } = item

  return (
    <View>
      {item.showTimestamp && (
        <Text style={styles.timestamp}>{utcToLocalTime(item?.createdAt, t('date_time_format'))}</Text>
      )}

      {item.isMe ? (
        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setOpenActionSheet(true)} hitSlop={8}>
            <Ionicons name="ellipsis-vertical-sharp" size={18} color={palette.grey[500]} />
          </TouchableOpacity>

          <View style={[styles.messageContainer, styles.myMessage, contentType ? styles.imageMessage : null]}>
            {contentType ? (
              <Image source={{ uri: getSafeUrl(content || '') }} style={{ width: 200, height: 200 }} />
            ) :
              <MathRender
                content={content || ''}
                textColor={palette.common.white}
                isChat
              />}
          </View>
        </View>
      ) : (
        <View style={[styles.messageContainer, styles.otherMessage, contentType ? styles.imageMessage : null]}>
          {contentType ? (
            <Image source={{ uri: getSafeUrl(content.replace("https://localhost:7045", BASE_URL) || '') }} style={{ width: 200, height: 200 }} />
          ) : (
            <MathRender content={content || ''} style={{ backgroundColor: '#FFF' }} textColor={palette.grey[700]} isChat />
          )}
        </View>
      )}

      <BottomSheet isVisible={openActionSheet} onClose={() => setOpenActionSheet(false)}>
        <View style={styles.sheetContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setOpenActionSheet(false)
              toggleUpdateDialog(item)
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.editText}>{t('edit')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setOpenActionSheet(false)
              toggleConfirmDialog(item)
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteText}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  )
}

const styles = ScaledSheet.create({
  messageContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center'
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
  imageMessage: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: palette.grey[100]
  },
  timestamp: {
    ...TYPO.caption,
    color: '#97A1AF',
    textAlign: 'center',
    marginBottom: 8,
    paddingVertical: '8@ms'
  },
  sheetButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: palette.grey[100],
    alignItems: 'center'
  },
  sheetText: {
    fontSize: '16@ms',
    fontWeight: '600'
  },
  sheetContainer: {
    paddingHorizontal: '20@ms',
    paddingTop: '8@ms',
    paddingBottom: '24@ms',
    gap: '12@ms'
  },

  actionButton: {
    width: '100%',
    backgroundColor: palette.grey[100],
    paddingVertical: '16@ms',
    borderRadius: '16@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },

  editText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.main[600]
  },

  deleteText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.red[900]
  }
})

export default ChatItem
