import React, { useState, useRef, useCallback } from 'react'
import { View, Text, Pressable, TouchableOpacity, Image } from 'react-native'
import { StudySpaceTabList, TabList } from '../configs/constants'
import useMyData from '../hooks/useMyData'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import PerformanceData from '../components/PerformanceData'
import TabPanel from '@/components/Tab/TabPanel'
import TimeData from '../components/TimeDataTab'
import AddChatIcon from '@/assets/iconJSX/addChat'
import IncorrectNotes from '../components/IncorrectNotes'
import CreateExamNoteDialog from '../components/CreateExamNoteDialog'
import HeaderAction from '@/layouts/components/HeaderAction'
import useAuthStore from '@/store/useAuthStore'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'
import StudentSelectorBottomSheet from '../components/StudentSelectorBottomSheet'
import { checkIsParentMode } from '@/utils/helpers'
import Loading from '@/components/Loading'

interface MyDataContentProps {
  isStudySpace: boolean
  isParentMode: boolean
  isStudentPickerOpen: boolean
  setIsStudentPickerOpen: (open: boolean) => void
}

const MyDataContent = ({
  isStudySpace,
  isParentMode,
  isStudentPickerOpen,
  setIsStudentPickerOpen
}: MyDataContentProps) => {
  const user = useAuthStore((state) => state.user)
  const studySpaceSelectedStudent = useAccountLinkingStore((state) => state.studySpaceSelectedStudent)
  const studySpaceLinkedStudents = useAccountLinkingStore((state) => state.studySpaceLinkedStudents)
  const setStudySpaceSelectedStudent = useAccountLinkingStore((state) => state.setStudySpaceSelectedStudent)

  const {
    t,
    imageUrl,
    selected,
    examList,
    questions,
    contentRef,
    examOptions,
    courseOptions,
    academyDomain,
    handleChangeCourse,
    questionOptions,
    handleSaveNote,
    courseIdSelected,
    examSessionIdSelected,
    handleChangeExam,
    handleUploadImage,
    handleTakePhoto,
    handlePickFromGallery,
    handleCloseCreateNote,
    handleOpenCreateNote,
    openCreateNote,
    handleReadyPrint,
    handleChangeTab,
    handleRemoveImage,
    isAdminOrNonAcademy
  } = useMyData()

  return (
    <View style={styles.container}>
      <View style={[styles.header]}>
        <Text style={styles.headerTitle}>{t('statistics')}</Text>

        <View style={styles.headerCenter}>
          {isStudySpace && studySpaceLinkedStudents.length > 0 && (
            <TouchableOpacity
              style={[
                styles.headerStudentChip,
                studySpaceSelectedStudent && styles.headerStudentChipActive
              ]}
              onPress={() => setIsStudentPickerOpen(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={[
                  styles.headerStudentAvatarCircle,
                  studySpaceSelectedStudent && styles.headerStudentAvatarCircleActive
                ]}
              >
                {studySpaceSelectedStudent?.studentAvatar ? (
                  <Image
                    source={{ uri: studySpaceSelectedStudent.studentAvatar }}
                    style={styles.headerStudentAvatar}
                  />
                ) : (
                  <Ionicons
                    name={studySpaceSelectedStudent ? 'school' : 'person'}
                    size={12}
                    color={studySpaceSelectedStudent ? palette.purple[600] : '#6B7280'}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.headerStudentName,
                  studySpaceSelectedStudent && styles.headerStudentNameActive
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {studySpaceSelectedStudent
                  ? (studySpaceSelectedStudent.studentName ||
                     studySpaceSelectedStudent.studentEmail)
                  : t('myself')}
              </Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={studySpaceSelectedStudent ? palette.purple[600] : '#6B7280'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.headerRight}>
          <HeaderAction />
          {!!academyDomain && !isParentMode && <TouchableOpacity onPress={() => handleOpenCreateNote()}>
            <AddChatIcon width={24} height={24} color="#222222" />
          </TouchableOpacity>}
        </View>

      </View>

      <View style={styles.tabs}>
        {(!!academyDomain ? TabList : StudySpaceTabList).map(({ label, value }, index) => {
          if (value === 1 && isAdminOrNonAcademy) return null

          const active = value === selected

          return (
            <Pressable
              key={index}
              onPress={() => handleChangeTab(value)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(label)}</Text>
            </Pressable>
          )
        })}
      </View>

      <TabPanel value={selected} index={0}>
        {selected === 0 && (
          <TimeData
            key={`timedata-${studySpaceSelectedStudent?.id ?? 'self'}`}
            contentRef={contentRef}
            handleReadyPrint={handleReadyPrint}
          />
        )}
      </TabPanel>

      <TabPanel value={selected} index={1}>
        {selected === 1 && (
          <PerformanceData
            key={`performance-${studySpaceSelectedStudent?.id ?? 'self'}`}
            handleReadyPrint={handleReadyPrint}
          />
        )}
      </TabPanel>
      <TabPanel value={selected} index={2}>
        {!openCreateNote && (
          <IncorrectNotes
            key={`notes-${studySpaceSelectedStudent?.id ?? 'self'}`}
            contentRef={contentRef}
          />
        )}
      </TabPanel>

      <CreateExamNoteDialog
        open={openCreateNote}
        onClose={handleCloseCreateNote}
        handleUploadImage={handleUploadImage}
        handleTakePhoto={handleTakePhoto}
        handlePickFromGallery={handlePickFromGallery}
        examList={examList}
        imageUrl={imageUrl}
        questions={questions}
        courseOptions={courseOptions}
        handleChangeCourse={handleChangeCourse}
        examSessionValue={examSessionIdSelected}
        handleChangeExam={handleChangeExam}
        questionOptions={questionOptions}
        courseValue={courseIdSelected}
        onSaveNote={handleSaveNote}
        examOptions={examOptions}
        handleRemoveImage={handleRemoveImage}
      />

      <StudentSelectorBottomSheet
        isVisible={isStudentPickerOpen}
        onClose={() => setIsStudentPickerOpen(false)}
        students={studySpaceLinkedStudents}
        selectedLinkId={studySpaceSelectedStudent?.id ?? null}
        onSelect={setStudySpaceSelectedStudent}
        currentUserAvatar={user?.avatar}
      />
    </View>
  )
}

const MyData = () => {
  const user = useAuthStore((state) => state.user)
  const setStudySpaceSelectedStudent = useAccountLinkingStore((state) => state.setStudySpaceSelectedStudent)
  const syncStudySpaceLinkedStudents = useAccountLinkingStore((state) => state.syncStudySpaceLinkedStudents)
  const resetStudySpaceState = useAccountLinkingStore((state) => state.resetStudySpaceState)

  const isParentMode = checkIsParentMode()
  const isStudySpace = !user?.academyDomain || user?.isLearningSpace

  const [isReady, setIsReady] = useState(!isStudySpace)
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false)
  const hasPromptedInitialRef = useRef(false)

  useFocusEffect(
    useCallback(() => {
      if (isStudySpace) {
        const lastSelected = useAccountLinkingStore.getState().studySpaceLastSelectedStudent
        if (lastSelected) {
          setStudySpaceSelectedStudent(lastSelected)
        }
        setIsReady(true)

        syncStudySpaceLinkedStudents().then((students) => {
          if (
            students.length > 0 &&
            !hasPromptedInitialRef.current &&
            !useAccountLinkingStore.getState().studySpaceSelectedStudent
          ) {
            hasPromptedInitialRef.current = true
            setIsStudentPickerOpen(true)
          }
        })
      } else {
        setIsReady(true)
      }

      return () => {
        resetStudySpaceState()
        setIsReady(false)
      }
    }, [isStudySpace, resetStudySpaceState, setStudySpaceSelectedStudent, syncStudySpaceLinkedStudents])
  )

  if (!isReady) {
    return (
      <View style={styles.container}>
        <Loading />
      </View>
    )
  }

  return (
    <MyDataContent
      isStudySpace={isStudySpace}
      isParentMode={isParentMode}
      isStudentPickerOpen={isStudentPickerOpen}
      setIsStudentPickerOpen={setIsStudentPickerOpen}
    />
  )
}

export default MyData

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '20@ms',
    paddingHorizontal: '18@ms'
  },
  headerTitle: {
    fontSize: '20@ms',
    fontWeight: 600,
    color: '#222222'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '6@ms'
  },
  headerRight: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center'
  },
  headerStudentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: '16@ms',
    paddingVertical: '4@ms',
    paddingHorizontal: '8@ms',
    gap: '5@ms',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: '180@ms'
  },
  headerStudentChipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE'
  },
  headerStudentAvatarCircle: {
    width: '18@ms',
    height: '18@ms',
    borderRadius: '9@ms',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  headerStudentAvatarCircleActive: {
    backgroundColor: '#EDE9FE'
  },
  headerStudentAvatar: {
    width: '18@ms',
    height: '18@ms',
    borderRadius: '9@ms'
  },
  headerStudentName: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#4B5563',
    flexShrink: 1
  },
  headerStudentNameActive: {
    color: palette.purple[700]
  },
  tabs: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  tabButton: {
    flex: 1,
    paddingVertical: '12@ms'
  },
  tabButtonActive: {
    backgroundColor: palette.sub[400]
  },
  tabText: {
    textAlign: 'center',
    fontSize: '14@ms',
    fontWeight: '500',
    color: palette.grey[400]
  },
  tabTextActive: {
    color: '#FFF'
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    borderWidth: '1@ms',
    borderColor: '#D0D0C8',
    borderRadius: '6@ms',
    gap: '4@ms'
  },
  printText: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#6d6e6f'
  }
})
