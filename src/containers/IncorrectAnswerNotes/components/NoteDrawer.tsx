import Loading from '@/components/Loading'
import SlideDrawer from '@/components/ModalBase/SlideDrawer'
import { getNoteByIdApi } from '@/containers/Home/apiClients'
import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { BRIEF_GRADE_OPTIONS } from '@/utils/constants'
import { NoteType } from '@/utils/enums'
import { formatGrade, getErrorMessage, toast, utcToLocalTime } from '@/utils/helpers'
import { NoteResponse, NoteUserInfo } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native'
import NoteContent from './NoteContent'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  open: boolean
  onClose: () => void
  student?: NoteUserInfo
  data?: NoteResponse
  width?: number | string
  showStudentInfo?: boolean
  id?: string | number
}

const NoteDrawer: FC<Props> = (props) => {
  const { open, student, onClose, data, showStudentInfo = true, id } = props

  const { t } = useTranslation()
  const { language, selectedAcademy } = useAuthStore()
  const [loading, setLoading] = useState<boolean>(false)
  const [noteData, setNoteData] = useState<NoteResponse>()

  useEffect(() => {
    const getNoteById = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await getNoteByIdApi(+id)
        setNoteData(res.data)
      } catch (error) {
        toast.error(getErrorMessage(t, error))
      }
      setLoading(false)
    }
    getNoteById()
  }, [id, t])

  const note = data ?? noteData

  const user = useMemo(() => {
    if (student) return student
    if (!note) return null
    switch (note.type) {
      case NoteType.ToAcademy:
      case NoteType.ToStudent:
        return note.receiver
      default:
        return note.sender
    }
  }, [JSON.stringify(note), JSON.stringify(student)])

  const styles = ScaledSheet.create({
    modal: {
      margin: 0
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
    headerContent: {
      paddingHorizontal: 16
    },
    closeButton: {
      padding: 8,
      alignSelf: 'flex-start'
    },
    studentInfo: {
      paddingHorizontal: 40,
      paddingVertical: '24@ms'
    },
    studentRow: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap'
    },
    studentName: {
      fontSize: 18,
      fontWeight: '700',
      color: palette.main[500]
    },
    studentDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap'
    },
    studentText: {
      color: palette.grey[500],
      fontSize: 13,
      fontWeight: '500'
    },
    contentContainer: {
      flex: 1
    },
    contentScroll: {
      flex: 1
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 16
    },
    noDataContainer: {
      paddingHorizontal: 24,
      paddingTop: 40,
      gap: 16
    },
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16
    },
    noteTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#414E62',
      flex: 1,
      marginRight: 8
    },
    noteInfo: {
      alignItems: 'flex-end'
    },
    noteDate: {
      fontSize: 12,
      fontWeight: '500',
      color: '#97A1AF',
      textAlign: 'right'
    },
    noteAcademy: {
      fontSize: 12,
      fontWeight: '500',
      color: '#97A1AF',
      textAlign: 'right',
      marginTop: 2
    },
    commentsContainer: {
      paddingHorizontal: 24,
      paddingTop: 8,
      flex: 1
    },
    skeletonText: {
      fontSize: 18,
      lineHeight: 22
    },
    skeletonSmallText: {
      fontSize: 13
    }
  })

  return (
    <SlideDrawer visible={open}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>오답노트 상세</Text>
        </View>
        <View></View>
      </View>
      {showStudentInfo && (note?.type === NoteType.ToAcademy || note?.type === NoteType.ToStudent) && (
        <View style={styles.studentInfo}>
          {!user || loading ? (
            <View style={styles.studentRow}>
              <View style={{ width: 50, height: 22, backgroundColor: palette.grey[200] }} />
              <View style={styles.studentDetails}>
                <View style={{ width: 140, height: 16, backgroundColor: palette.grey[200] }} />
                <View style={{ width: 20, height: 16, backgroundColor: palette.grey[200] }} />
              </View>
            </View>
          ) : (
            <View style={styles.studentRow}>
              <Text style={styles.studentName}>{user.fullName}</Text>
              <View style={styles.studentDetails}>
                <Text style={styles.studentText}>{user.schoolName}</Text>
                {!!user.grade && (
                  <Text style={styles.studentText}>
                    {`${t(
                      ((label) => (label ? t(label) : formatGrade(user.grade, t, language?.code)))(
                        BRIEF_GRADE_OPTIONS.find((o: any) => o.value === Number(user.grade))?.label
                      )
                    )} ${!!user.gradeYear ? `(${user.gradeYear})` : ''}`}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      <View style={styles.contentContainer}>
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {!note && !loading && (
            <View style={styles.noDataContainer}>
              <Text style={{ color: palette.grey[500] }}>{t('no_data')}</Text>
            </View>
          )}

          {note && (
            <View style={styles.content}>
              {loading ? (
                <Loading isOverlay={false} />
              ) : (
                <View>
                  <View style={styles.noteHeader}>
                    <Text style={styles.noteTitle}>{note?.fullName}</Text>
                    <View style={styles.noteInfo}>
                      <Text style={styles.noteDate}>{utcToLocalTime(note?.createdAt, t('date_format'))}</Text>
                      <Text style={styles.noteAcademy}>{selectedAcademy?.name}</Text>
                    </View>
                  </View>
                  <NoteContent content={note?.content ?? ''} imageUrl={note?.imageUrl ?? ''} />
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </SlideDrawer>
  )
}

export default NoteDrawer
