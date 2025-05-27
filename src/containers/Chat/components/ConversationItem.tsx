import { palette, TYPO } from '@/theme'
import { ConversationsResponse } from '@/utils/types'
import moment from 'moment'
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Avatar } from 'react-native-paper'
import { highlightText } from '@/utils/helpers'
import useAuthStore from '@/store/useAuthStore'

type Props = {
  conversation: ConversationsResponse
  t: any
  textSearch: string
  handleSelect: (val: ConversationsResponse) => void
}

const ConversationItem = ({ conversation, handleSelect, textSearch, t }: Props) => {
  const { selectedAcademy } = useAuthStore()
  return (
    <TouchableOpacity style={[styles.container]} onPress={() => handleSelect(conversation)}>
      <Avatar.Image size={40} style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: palette.grey[300] }}      source={{ uri: selectedAcademy?.image }} />
      <View style={styles.contentContainer}>
        <View style={styles.firstLine}>
          <Text
            style={[
              styles.title,
              {
                color: palette.grey[900]
              }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {highlightText(conversation?.textbookName || conversation?.examTitle || t(conversation.category || ''), textSearch)}
          </Text>

          <View style={styles.rightContainer}>
            {!!conversation?.totalUnReadMessage && (
              <View style={[styles.badge, { backgroundColor: palette.main[700] }]}>
                <Text style={styles.badgeText}>
                  {conversation?.totalUnReadMessage > 9 ? '9+' : conversation?.totalUnReadMessage}
                </Text>
              </View>
            )}
            <Text
              style={[
                styles.typeText,
                {
                  color: palette.grey[500]
                }
              ]}
            >
              {moment().subtract(conversation.createdAt, 'hours').fromNow()}
            </Text>
          </View>
        </View>

        <View style={styles.secondLine}>
          <View style={styles.teacherContainer}>
            <Text
              style={[
                styles.teacherText,
                {
                  color: palette.grey[700]
                }
              ]}
              numberOfLines={1}
            >
              {conversation.teacherName || ''}
            </Text>
            <Text
              style={[
                styles.typeText,
                {
                  color: !conversation?.isCompleted ? palette.main[500] : palette.grey[700]
                }
              ]}
            >
              {!conversation?.isCompleted ? '상담중' : '상담완료'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderRadius: 5,
    flexDirection: 'row',
    gap: 8,
  },
  contentContainer: {
    gap: 4,
    flexGrow: 1
  },
  firstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...TYPO.heading3,
    flexShrink: 1,
    flex: 1
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12
  },
  badge: {
    borderRadius: 50,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4
  },
  badgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
    lineHeight: 12
  },
  typeText: {
    ...TYPO.button4,
    lineHeight: 13
  },
  secondLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  teacherText: {
    ...TYPO.button4,
  },
  dateText: {
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 12
  }
})

export default ConversationItem
