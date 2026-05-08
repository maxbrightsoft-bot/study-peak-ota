import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { GroupedNoteResponse, NoteResponse } from '@/utils/types'
import { palette } from '@/theme'
import { FontAwesome6 } from '@expo/vector-icons'
import dayjs from 'dayjs'

interface GroupedNoteCardProps {
  item: GroupedNoteResponse
  t: any
  onOpenDialog: (item?: NoteResponse) => void
}

const ChildNoteItem = ({ note, t, onOpenDialog }: { note: NoteResponse, t: any, onOpenDialog: (item?: NoteResponse) => void }) => {
  return (
    <Pressable style={({ pressed }) => [styles.childContainer, pressed && styles.pressed]} onPress={() => onOpenDialog(note)}>
      <View style={styles.childLeft}>
        <View style={styles.questionNumberBox}>
          <Text style={styles.questionNumberText}>{(note.questionOrder || 0) + 1}번</Text>
        </View>
        <View style={styles.childContent}>
          <Text style={styles.childTitle} numberOfLines={1}>{note.title} {note.page ? `· p.${note.page}` : ''}</Text>
          <Text style={styles.childSubtitle} numberOfLines={2}>{note.content?.replace(/<[^>]+>/g, '') || t('grouped_note_no_content')}</Text>
        </View>
      </View>
      <Text style={styles.childDate}>{dayjs(note.createdAt).format('MM.DD')}</Text>
    </Pressable>
  )
}

export default function GroupedNoteCard({ item, t, onOpenDialog }: GroupedNoteCardProps) {
  const [expanded, setExpanded] = useState(false)

  const subjectInitial = item.subjectName ? item.subjectName.charAt(0) : '기'
  
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

  const bgColor = subjectColors[subjectInitial] || '#FFF5E5'
  const textColor = subjectTextColors[subjectInitial] || '#F59E0B'

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
            <Text style={styles.categoryName}>{item.categoryName}</Text>
            <Text style={styles.headerSubtitle}>
              {item.latestScore ? `${t('grouped_note_score_question', { score: String(item.latestScore) })} · ` : ''}{t('grouped_note_recent', { date: dayjs(item.latestCreatedAt).format('MM.DD') })}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('grouped_note_count', { count: String(item.totalNotes) })}</Text>
          </View>
          <FontAwesome6 name={expanded ? "chevron-down" : "chevron-right"} size={14} color={palette.grey[400]} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.body}>
          <View style={styles.divider} />
          {item.notes.map((note) => (
            <View key={note.id}>
               <ChildNoteItem note={note} t={t} onOpenDialog={onOpenDialog} />
               <View style={styles.divider} />
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderLeftWidth: 4,
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
    padding: 16,
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
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitles: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFFbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  childContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  childLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  questionNumberBox: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginRight: 12,
    minWidth: 54,
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  childContent: {
    flex: 1,
  },
  childTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  childSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  childDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  }
})
