import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Pressable } from 'react-native'
import { GroupedNoteResponse, NoteResponse } from '@/utils/types'
import { palette } from '@/theme'
import { FontAwesome6 } from '@expo/vector-icons'
import dayjs from 'dayjs'
import { getNotesByGroupApi } from '../../ExamResultList/apiClients/noteService'
import { ActivityIndicator } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

interface GroupedNoteCardProps {
  item: GroupedNoteResponse
  t: any
  filter?: any
  refreshGroup?: { subjectName?: string, categoryName?: string, key: number }
  onOpenDialog: (item?: NoteResponse) => void
  onRemoveGroup?: (subjectName?: string, categoryName?: string) => void
}

const ChildNoteItem = ({ note, t, onOpenDialog }: { note: NoteResponse, t: any, onOpenDialog: (item?: NoteResponse) => void }) => {
  return (
    <Pressable style={({ pressed }) => [styles.childContainer, pressed && styles.pressed]} onPress={() => onOpenDialog(note)}>
      <View style={styles.childLeft}>
        <View style={styles.questionNumberBox}>
          <Text style={styles.questionNumberText}>{t('number_question', { number: (note.questionOrder || 0) + 1 })}</Text>
        </View>
        <View style={styles.childContent}>
          <View style={styles.childTitleRow}>
            <Text style={styles.childTitleText} numberOfLines={1}>{note.title}</Text>
            {note.page ? <Text style={styles.childTitlePage}> · p.{note.page}</Text> : null}
          </View>
          <Text style={styles.childSubtitle} numberOfLines={2}>{note.content?.replace(/<[^>]+>/g, '') || t('grouped_note_no_content')}</Text>
        </View>
      </View>
      <Text style={styles.childDate}>{dayjs(note.createdAt).format('MM.DD')}</Text>
    </Pressable>
  )
}

export default function GroupedNoteCard({ item, t, filter, refreshGroup, onOpenDialog, onRemoveGroup }: GroupedNoteCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [childNotes, setChildNotes] = useState<NoteResponse[]>(item.notes || [])
  const [loading, setLoading] = useState(false)
  const [totalNotes, setTotalNotes] = useState(item.totalNotes)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(5)
  const [totalPages, setTotalPages] = useState(() => Math.ceil((item.totalNotes || 0) / 10))

  useEffect(() => {
    if (expanded && childNotes.length === 0) {
      fetchChildNotes(1)
    }
  }, [expanded])

  useEffect(() => {
    if (!refreshGroup || !refreshGroup.key || !expanded) return
    const isSameGroup =
      (item.subjectName || '') === (refreshGroup.subjectName || '') &&
      (item.categoryName || '') === (refreshGroup.categoryName || '')
    if (isSameGroup) {
      fetchChildNotes(1)
    }
  }, [refreshGroup?.key])

  const fetchChildNotes = async (pageToLoad: number) => {
    try {
      setLoading(true)
      const apiPayload: any = { ...filter }
      apiPayload.currentPage = pageToLoad;
      apiPayload.pageSize = pageSize;
      apiPayload.subjectNames = item.subjectName ? [item.subjectName] : undefined;
      apiPayload.categoryNames = item.categoryName ? [item.categoryName] : undefined;

      const res = await getNotesByGroupApi(apiPayload)
      if (res?.data?.items) {
        if (pageToLoad === 1) {
          setChildNotes(res.data.items)
        } else {
          setChildNotes(prev => [...prev, ...res.data.items])
        }
      }
      if (res?.data?.totalItems != null) {
        const newTotal = res.data.totalItems
        setTotalNotes(newTotal)
        setTotalPages(Math.ceil(newTotal / pageSize))
        if (newTotal === 0) {
          onRemoveGroup?.(item.subjectName, item.categoryName)
        }
      }
      if (res?.data?.totalPages != null) {
        setTotalPages(res.data.totalPages)
      }
      setCurrentPage(pageToLoad)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchChildNotes(currentPage + 1)
    }
  }

  const subjectNameText = item.subjectName || t('grouped_note_other')
  const categoryNameText = item.categoryName || t('grouped_note_other')
  const subjectInitial = subjectNameText.charAt(0)

  const subjectColors: Record<string, string> = {
    '국': '#F3F0FF',
    '영': '#FFF5E5',
    '수': '#E5F7F1',
    '기': '#F4F4F6'
  }
  const subjectTextColors: Record<string, string> = {
    '국': '#7C3AED',
    '영': '#F59E0B',
    '수': '#10B981',
    '기': '#6B7280'
  }

  const bgColor = subjectColors[item.subjectName?.charAt(0) || '기'] || '#F4F4F6'
  const textColor = subjectTextColors[item.subjectName?.charAt(0) || '기'] || '#6B7280'

  return (
    <View style={[styles.container, expanded && styles.containerExpanded]}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={[styles.header, expanded && styles.headerExpanded]}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.subjectAvatar, { backgroundColor: bgColor }]}>
            <Text style={[styles.subjectText, { color: textColor }]}>{subjectInitial}</Text>
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.categoryName}>{categoryNameText}</Text>
            <Text style={styles.headerSubtitle}>
              {item.latestScore ? `${t('grouped_note_score_question', { score: String(item.latestScore) })} · ` : ''}{t('grouped_note_recent', { date: dayjs(item.latestCreatedAt).format('MM.DD') })}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('grouped_note_count', { count: String(totalNotes) })}</Text>
          </View>
          <FontAwesome6 name={expanded ? "chevron-down" : "chevron-right"} size={14} color={palette.grey[400]} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.divider} />
          {loading && currentPage === 1 ? (
            <ActivityIndicator style={{ marginVertical: 20 }} color="#7C3AED" />
          ) : (
            <>
              {childNotes.map((note) => (
                <View key={note.id}>
                  <ChildNoteItem note={note} t={t} onOpenDialog={onOpenDialog} />
                  <View style={styles.divider} />
                </View>
              ))}
              {currentPage < totalPages && (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#7C3AED" />
                  ) : (
                    <Text style={styles.loadMoreText}>{t('load_more')}</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    borderWidth: '1@ms',
    borderColor: '#F3F4F6',
    borderLeftWidth: '4@ms',
    borderLeftColor: '#FCD34D',
    overflow: 'hidden',
  },
  containerExpanded: {
    borderColor: '#FDE68A',
    borderLeftColor: '#FCD34D',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16@ms',
    backgroundColor: '#FFF',
  },
  headerExpanded: {
    borderBottomWidth: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectAvatar: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '12@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '12@ms',
  },
  subjectText: {
    fontSize: '16@ms',
    fontWeight: '700',
  },
  headerTitles: {
    flex: 1,
  },
  categoryName: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4@ms',
  },
  headerSubtitle: {
    fontSize: '13@ms',
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFFbeb',
    paddingHorizontal: '8@ms',
    paddingVertical: '4@ms',
    borderRadius: '8@ms',
    marginRight: '8@ms',
  },
  badgeText: {
    color: '#D97706',
    fontSize: '13@ms',
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: '16@ms',
    paddingBottom: '8@ms',
  },
  childContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: '16@ms',
  },
  pressed: {
    opacity: 0.7,
  },
  childLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: '12@ms',
  },
  questionNumberBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: '12@ms',
    paddingVertical: '10@ms',
    borderRadius: '8@ms',
    alignSelf: 'flex-start',
    marginRight: '12@ms',
    minWidth: '54@ms',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: '14@ms',
    color: '#4B5563',
    fontWeight: '600',
  },
  childContent: {
    flex: 1,
  },
  childTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '6@ms',
  },
  childTitleText: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#111827',
    flexShrink: 1,
  },
  childTitlePage: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: '#111827',
    flexShrink: 0,
  },
  childSubtitle: {
    fontSize: '14@ms',
    color: '#6B7280',
    lineHeight: '20@ms',
  },
  childDate: {
    fontSize: '13@ms',
    color: '#9CA3AF',
    marginTop: '6@ms',
  },
  divider: {
    height: '1@ms',
    backgroundColor: '#F3F4F6',
  },
  loadMoreBtn: {
    paddingVertical: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: '14@ms',
    color: '#7C3AED',
    fontWeight: '600',
  }
})