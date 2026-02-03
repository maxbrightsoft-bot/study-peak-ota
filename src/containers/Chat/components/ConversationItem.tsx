import { palette, TYPO } from '@/theme'
import { ConversationsResponse } from '@/utils/types'
import moment from 'moment'
import React, { useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-paper'
import { highlightText } from '@/utils/helpers'
import useAuthStore from '@/store/useAuthStore'
import Icon from '@expo/vector-icons/Ionicons'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  conversation: ConversationsResponse
  selected?: ConversationsResponse
  t: any
  textSearch: string
  handleSelect: (val: ConversationsResponse) => void
}

const ConversationItem = ({
  conversation,
  handleSelect,
  textSearch,
  t,
  selected
}: Props) => {
  const { selectedAcademy } = useAuthStore()

  const isOnlyConversationStudentWithTeacher =
    !conversation?.studentExamSessionId &&
    !conversation?.studentTextbookSessionId &&
    !conversation?.courseId &&
    !conversation?.examSessionId &&
    !!conversation?.studentId &&
    !!conversation.teacherId

  const isActive = useMemo(() => {
    return selected?.id === conversation.id
  }, [conversation?.id, selected?.id])

  const renderIcon = () => {
    if (conversation.textbookId) return <Icon name="book-outline" size={12} color={palette.main[700]} />
    if (conversation.examId) return <Icon name="receipt-outline" size={12} color={palette.main[700]} />
    if (conversation.courseId) return <Icon name="school-outline" size={12} color={palette.main[700]} />
    return null
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
      ]}
      onPress={() => handleSelect(conversation)}
    >
      <View style={styles.firstLine}>
        <View style={styles.leftContainer}>
          <Avatar.Image
            size={32}
            style={styles.avatar}
            source={{ uri: selectedAcademy?.image }}
          />

          {isOnlyConversationStudentWithTeacher ? (
            <View style={styles.inline}>
              <Icon name="person-outline" size={12} color={palette.main[700]} />
              <Text style={styles.teacherLabel}>{t('teacher')}</Text>
              <Text style={[styles.title, isActive && styles.activeText]} numberOfLines={1}>
                {conversation.teacherName}
              </Text>
            </View>
          ) : (
            <View style={styles.inline}>
              {renderIcon()}
              <Text
                style={[styles.title, isActive && styles.activeText]}
                numberOfLines={1}
              >
                {highlightText(
                  conversation?.textbookName ||
                    conversation?.examTitle ||
                    t(conversation.category || ''),
                  textSearch
                )}
              </Text>

              {conversation?.studentTotalAttemptTime > 1 && (
                <Text style={[styles.attemptText,{ color: conversation.isSelected ? palette.main[500] : palette.red[900] }]}>
                  #{conversation.studentAttemptNumber + 1}/{conversation.studentTotalAttemptTime}
                </Text>
              )}
              
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          {!isActive && !!conversation?.totalUnReadMessage && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.totalUnReadMessage > 9 ? '9+' : conversation.totalUnReadMessage}
              </Text>
            </View>
          )}

          <Text style={[styles.typeText, isActive && styles.activeText]}>
            {isOnlyConversationStudentWithTeacher
              ? moment(conversation.createdAt).format(t('date_format'))
              : conversation?.question
              ? t('problem_number_question', {
                  number: (conversation.question.questionOrder || 0) + 1
                })
              : conversation?.courseId
              ? t('class_inquiry')
              : t('exam_inquiry')}
          </Text>
        </View>
      </View>

      <View style={styles.secondLine}>
        {!isOnlyConversationStudentWithTeacher && (
          <Text
            style={[styles.subText, isActive && styles.activeText]}
            numberOfLines={1}
          >
            {conversation.courseId
              ? conversation.courseName
              : conversation.teacherName ||
                conversation.mainTeacherCourseName ||
                ''}
          </Text>
        )}

        {!isOnlyConversationStudentWithTeacher && (
          <Text style={[styles.subText, isActive && styles.activeText]}>
            {moment(conversation.createdAt).format(t('date_format'))}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: 16,
    borderRadius: 5,
    gap: 8,
  },
  avatar: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: palette.grey[300]
  },
  firstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[700],
    flexShrink: 1,
    maxWidth: 200,
    flexWrap: "wrap"
  },
  activeText: {
    color: palette.main[700]
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  badge: {
    backgroundColor: palette.main[700],
    width: 14,
    height: 14,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  },
  typeText: {
    ...TYPO.button4,
    color: palette.grey[700]
  },
  secondLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subText: {
    ...TYPO.button4,
    color: palette.grey[700],
    maxWidth: '70%'
  },
  teacherLabel: {
    ...TYPO.button4,
    color: palette.main[700]
  },
  attemptText: {
    ...TYPO.button4,
  }
})

export default ConversationItem
