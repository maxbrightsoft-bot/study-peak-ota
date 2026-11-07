import React from 'react'
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import BottomSheet from '@/components/ModalBase/BottomSheet'
import { ParentLinkResponse } from '@/containers/AccountLinking/apiClients'

interface StudentSelectorBottomSheetProps {
  isVisible: boolean
  onClose: () => void
  students: ParentLinkResponse[]
  selectedLinkId: number | null
  onSelect: (student: ParentLinkResponse | null) => void
  currentUserAvatar?: string
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function StudentSelectorBottomSheet({
  isVisible,
  onClose,
  students,
  selectedLinkId,
  onSelect,
  currentUserAvatar
}: StudentSelectorBottomSheetProps) {
  const { t } = useTranslation()

  const isMyselfSelected = selectedLinkId === null

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={t('select_student_statistics')}
      styleContainer={styles.bottomSheetContainer}
      closeChildren={
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={22} color="#222222" />
        </TouchableOpacity>
      }
    >
      <View style={styles.sheetContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        >
          {/* Option 1: Myself */}
          <TouchableOpacity
            style={[styles.itemRow, isMyselfSelected && styles.itemRowSelected]}
            onPress={() => {
              onSelect(null)
              onClose()
            }}
            activeOpacity={0.7}
          >
            {isMyselfSelected && (
              <Ionicons
                name="checkmark"
                size={20}
                color="#7B2CBF"
                style={styles.checkIcon}
              />
            )}
            <View style={styles.avatarCircle}>
              {currentUserAvatar ? (
                <Image source={{ uri: currentUserAvatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons
                  name="person"
                  size={16}
                  color={isMyselfSelected ? '#7B2CBF' : '#6B7280'}
                />
              )}
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[styles.itemTitle, isMyselfSelected && styles.itemTextSelected]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {t('myself')}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Section title for linked students if any */}
          {students.length > 0 && (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('linked_students')}</Text>
            </View>
          )}

          {/* List of linked students */}
          {students.map((student) => {
            const isSelected = selectedLinkId === student.id
            const displayName =
              student.studentName || student.studentEmail
            const emailSuffix =
              student.studentName && student.studentEmail ? student.studentEmail : null

            return (
              <TouchableOpacity
                key={student.id}
                style={[styles.itemRow, isSelected && styles.itemRowSelected]}
                onPress={() => {
                  onSelect(student)
                  onClose()
                }}
                activeOpacity={0.7}
              >
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#7B2CBF"
                    style={styles.checkIcon}
                  />
                )}
                <View style={styles.avatarCircle}>
                  {student.studentAvatar ? (
                    <Image
                      source={{ uri: student.studentAvatar }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Ionicons
                      name="school"
                      size={16}
                      color={isSelected ? '#7B2CBF' : '#6B7280'}
                    />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text
                    style={[styles.itemTitle, isSelected && styles.itemTextSelected]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {displayName}
                    {emailSuffix ? (
                      <Text
                        style={[styles.itemSuffix, isSelected && styles.itemSuffixSelected]}
                      >
                        {` (${emailSuffix})`}
                      </Text>
                    ) : null}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    </BottomSheet>
  )
}

const styles = StyleSheet.create({
  bottomSheetContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    backgroundColor: '#F5F6F9'
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    flexShrink: 1
  },
  listContainer: {
    paddingVertical: 8
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  itemRowSelected: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#7B2CBF'
  },
  checkIcon: {
    marginRight: 8
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0
  },
  avatarImage: {
    width: 28,
    height: 28,
    borderRadius: 14
  },
  textContainer: {
    flex: 1
  },
  itemTitle: {
    fontSize: 15,
    color: '#2B2D42',
    fontWeight: '500'
  },
  itemSuffix: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '400'
  },
  itemTextSelected: {
    color: '#7B2CBF',
    fontWeight: '600'
  },
  itemSuffixSelected: {
    color: '#7B2CBF',
    fontWeight: '400'
  }
})
