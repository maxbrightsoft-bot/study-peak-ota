import SearchInput from '@/components/Input/SearchInput'
import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import FilterIcon from '@/assets/iconJSX/filter'
import useConversationList from './hooks/useConversationList'
import useChatContainer from './hooks/useChatContainer'
import { TabList } from './configs/constants'
import useTab from '@/hooks/useTab'
import { palette } from '@/theme'
import { ConversationsResponse } from '@/utils/types'
import BotIcon from '@/assets/iconJSX/bot'
import AddChatIcon from '@/assets/iconJSX/addChat'
import useCreateQuestionConversationDialog from './hooks/useCreateQuestionConversationDialog'
import CreateQuestionConversationDialog from './components/dialog/CreateQuestionConversationDialog'
import ChatContainer from './components/ChatContainer'
import moment from 'moment'
import { ScaledSheet } from 'react-native-size-matters'
import MathRender from '@/components/MathRender'
import { Ionicons } from '@expo/vector-icons'
export default function Question() {
  const {
    t,
    search,
    handleCloseFilterModal,
    handleOpenFilterModal,
    selectedConversation,
    conversations,
    onChangeSearch,
    getConversationList,
    courses,
    handleChangeSelectedConversation,
    setSelectedConversation,
    isVisibleCreateConversationDialog,
    handleCloseCreateConversationDialog
  } = useConversationList()

  const { isLoadingMessages, chatListProps, inputProps, chatHeaderProps, handleLoadMoreMessages } = useChatContainer({
    conversation: selectedConversation
  })

  const {
    openConversationDialog: openQuestionConversationDialog,
    toggleConversationDialog: toggleQuestionConversationDialog,
    exams,
    questions,
    handleChangeExam,
    handleChangeCourse: handleChangeCourseQuestionConversation,
    handleCreateQuestionConversation,
    courseIdSelected: courseIdSelectedQuestionConversation,
    examSessionIdSelected,
    courseOptions: courseOptionsQuestionConversationDialog,
    questionOptions,
    examOptions
  } = useCreateQuestionConversationDialog({
    courses,
    getConversationList
  })

  const filterCount = 0

  const { selected, handleChangeTab } = useTab(TabList)

  const getConversationTitle = (
    conversation: ConversationsResponse,
    t: (key: string, options?: any) => string
  ): string => {
    if (!conversation) return ''

    const isOnlyConversationStudentWithTeacher =
      !conversation.studentExamSessionId &&
      !conversation.studentTextbookSessionId &&
      !conversation.courseId &&
      !conversation.examSessionId &&
      !!conversation.studentId &&
      !!conversation.teacherId

    if (isOnlyConversationStudentWithTeacher) {
      return conversation.teacherName || t('teacher')
    }

    if (conversation.textbookId) {
      return conversation.textbookName || t('textbook_inquiry')
    }

    if (conversation.examId) {
      return conversation.examTitle || t('exam_inquiry')
    }
    if (conversation.courseId) {
      return conversation.courseName || t('class_inquiry')
    }

    if (conversation.category) {
      return t(conversation.category)
    }

    return ''
  }

  const isImagePath = (value?: string) => {
    if (!value) return false

    const imageRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))|(file:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i

    return imageRegex.test(value)
  }

  const Card = ({ conversation }: { conversation: ConversationsResponse }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleChangeSelectedConversation(conversation)}>
      <Text style={styles.cardCategory}>{conversation.examTitle}</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.cardTitle}>{getConversationTitle(conversation, t)}</Text>
          {(conversation.studentTotalAttemptTime || 0) > 1 && (
            <View
              style={[
                styles.attemptBadge,
                {
                  backgroundColor: conversation.isSelected ? palette.main[100] : palette.red[100]
                }
              ]}
            >
              <Text
                style={[
                  styles.attemptText,
                  {
                    color: conversation.isSelected ? palette.main[700] : palette.red[900]
                  }
                ]}
              >
                {`#${conversation.studentAttemptNumber + 1}/${conversation.studentTotalAttemptTime}`}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.timeText}>{moment(conversation.createdAt).fromNow()}</Text>
      </View>
      {isImagePath(conversation.lastMessage || '') ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="image-outline" size={16} color={palette.grey[500]} />
          <Text style={{ color: palette.grey[500], fontSize: 14 }}>{t('image')}</Text>
        </View>
      ) : (
        <MathRender content={conversation.lastMessage || ''} />
      )}

      <View style={styles.divider} />

      <View style={styles.profileRow}>
        <Image
          source={{
            uri: conversation?.mainTeacherCourseAvatar || conversation?.teacherAvatar
          }}
          style={styles.avatar}
        />
        <Text style={styles.teacherName}>{conversation?.mainTeacherCourseName || conversation.teacherName}</Text>
      </View>
    </TouchableOpacity>
  )

  const conversationFilters = useMemo(() => {
    switch (selected) {
      case TabList[1].value:
        return conversations.filter((conversation) => !conversation.isCompleted)
      case TabList[2].value:
        return conversations.filter((conversation) => conversation.isCompleted)
      default:
        return conversations
    }
  }, [conversations, selected])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>질문</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BotIcon />
          <Text style={styles.headerSub}>챗봇</Text>
        </View>
      </View>
      <View style={{ backgroundColor: palette.bg[100], flex: 1, paddingHorizontal: 20, paddingTop: 30, gap: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.tabsContainer}>
            {TabList.map(({ label, value }, index) => (
              <TouchableOpacity key={index} style={[styles.tabs]} onPress={() => handleChangeTab(value)}>
                <Text style={[styles.tab, value === selected && styles.activeTab]}>{t(label)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.floatingButton} onPress={toggleQuestionConversationDialog}>
            <AddChatIcon />
            <Text style={styles.floatingButtonText}>질문하기</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <SearchInput value={search} onChangeText={onChangeSearch} placeholder="오답노트 검색" />
          </View>
          {/* <TouchableOpacity style={styles.filterButton} onPress={handleOpenFilterModal}>
            {filterCount && (
              <View style={styles.filterCountButton}>
                <Text style={styles.filterButtonText}>{filterCount}</Text>
              </View>
            )}
            <FilterIcon />
          </TouchableOpacity> */}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
          {conversationFilters.map((conversation) => (
            <Card conversation={conversation} key={conversation.id} />
          ))}
        </ScrollView>
      </View>
      <CreateQuestionConversationDialog
        t={t}
        open={openQuestionConversationDialog}
        courseOptions={courseOptionsQuestionConversationDialog}
        questionOptions={questionOptions}
        examOptions={examOptions}
        toggleDialog={toggleQuestionConversationDialog}
        handleChangeExam={handleChangeExam}
        handleCreateConversation={handleCreateQuestionConversation}
        handleChangeCourse={handleChangeCourseQuestionConversation}
        exams={exams}
        courses={courses}
        questions={questions}
        examSessionValue={examSessionIdSelected}
        courseValue={courseIdSelectedQuestionConversation}
      />
      {!!selectedConversation ? (
        <ChatContainer
          t={t}
          open={!!selectedConversation}
          onClose={() => setSelectedConversation(undefined)}
          isLoadingMessages={isLoadingMessages}
          handleLoadMoreMessages={handleLoadMoreMessages}
          chatListProps={chatListProps}
          inputProps={inputProps}
          chatHeaderProps={chatHeaderProps}
        />
      ) : null}
    </SafeAreaView>
  )
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: palette.grey[100]
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    color: "#222"
  },
  headerSub: {
    fontSize: 20,
    color: palette.grey[400]
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  attemptBadge: {
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '20@ms'
  },
  attemptText: {
    fontSize: '11@ms',
    fontWeight: '600'
  },
  tab: {
    marginRight: 16,
    fontSize: 20,
    color: palette.grey[400],
    fontWeight: 'bold',
    lineHeight: 28,
    alignItems: 'center',
    textAlign: 'center'
  },
  activeTab: {
    color: palette.main[600],
    fontWeight: 'bold'
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ECECF1',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 40
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: '#ECECF1',
    borderRadius: 20,
    padding: 10
  },
  filterCountButton: {
    width: 20,
    height: 20,
    borderRadius: 43,
    backgroundColor: '#3DC674',
    position: 'absolute',
    top: -10,
    right: -10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterButtonText: {
    fontSize: 12,
    color: '#fff'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  cardCategory: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: "#222222"
  },
  cardDescription: {
    fontSize: 14,
    color: '#666'
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8
  },
  teacherName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    color: "#222222"
  },
  timeText: {
    fontSize: 12,
    color: '#999'
  },
  floatingButton: {
    margin: 0,
    backgroundColor: palette.main[600],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  }
})
