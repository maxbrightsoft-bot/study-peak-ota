import React, { FC, useMemo, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleProp,
  ViewStyle
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import RenderHTML from 'react-native-render-html'
import { useTranslation } from 'react-i18next'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  commonComment?: string | null
  specialComment?: string | null
  teacherName?: string
  containerStyle?: StyleProp<ViewStyle>
  defaultExpanded?: boolean
}

const hasValidContent = (content?: string | null): boolean => {
  if (!content) return false
  const stripped = content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()
  return stripped.length > 0
}

const formatHtml = (rawContent: string): { html: string } => {
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(rawContent)
  const formattedHtml = hasHtmlTags
    ? rawContent
    : `<p style="font-size:13.5px;line-height:20px;color:#2D3748;margin:0;">${rawContent.replace(
        /\n/g,
        '<br/>'
      )}</p>`
  return { html: formattedHtml }
}

const TeacherCommentSection: FC<Props> = ({
  commonComment,
  specialComment,
  teacherName,
  containerStyle,
  defaultExpanded = true
}) => {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()

  const [isSectionExpanded, setIsSectionExpanded] = useState(defaultExpanded)
  const [isCommonExpanded, setIsCommonExpanded] = useState(true)
  const [isSpecialExpanded, setIsSpecialExpanded] = useState(true)

  const hasCommon = useMemo(() => hasValidContent(commonComment), [commonComment])
  const hasSpecial = useMemo(() => hasValidContent(specialComment), [specialComment])

  const commonHtmlSource = useMemo(
    () => (hasCommon && commonComment ? formatHtml(commonComment) : { html: '' }),
    [hasCommon, commonComment]
  )

  const specialHtmlSource = useMemo(
    () => (hasSpecial && specialComment ? formatHtml(specialComment) : { html: '' }),
    [hasSpecial, specialComment]
  )

  const contentWidth = Math.max(width - 56, 200)

  const baseTagsStyles = useMemo(
    () => ({
      body: {
        color: '#2D3748',
        fontSize: 13.5,
        lineHeight: 20,
        margin: 0,
        padding: 0
      },
      p: {
        color: '#2D3748',
        fontSize: 13.5,
        lineHeight: 20,
        marginTop: 0,
        marginBottom: 4
      },
      span: {
        fontSize: 13.5,
        lineHeight: 20
      },
      ul: {
        marginTop: 2,
        marginBottom: 4,
        paddingLeft: 18
      },
      ol: {
        marginTop: 2,
        marginBottom: 4,
        paddingLeft: 18
      },
      li: {
        color: '#2D3748',
        fontSize: 13.5,
        lineHeight: 20,
        marginBottom: 2
      }
    }),
    []
  )

  if (!hasCommon && !hasSpecial) {
    return null
  }

  return (
    <View style={[styles.sectionContainer, containerStyle]}>
      {/* Header bar with dropdown toggle */}
      <TouchableOpacity
        style={styles.headerButton}
        activeOpacity={0.7}
        onPress={() => setIsSectionExpanded(prev => !prev)}
      >
        <View style={styles.headerLeft}>
          <View style={styles.teacherIconWrapper}>
            <Ionicons name="chatbox-ellipses" size={17} color="#6F48E9" />
          </View>
          <Text style={styles.sectionTitle}>{t('teacher_comment')}</Text>
          {!!teacherName && (
            <View style={styles.teacherBadge}>
              <Text style={styles.teacherBadgeText}>{teacherName}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight}>
          <View style={styles.dropdownBadge}>
            <Ionicons
              name={isSectionExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={palette.grey[700]}
            />
          </View>
        </View>
      </TouchableOpacity>

      {/* Collapsible Content */}
      {isSectionExpanded && (
        <View style={styles.bodyContainer}>
          {/* Common Comment Card */}
          {hasCommon && (
            <View style={styles.commonCard}>
              <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.7}
                onPress={() => setIsCommonExpanded(prev => !prev)}
              >
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="chatbubbles-outline" size={16} color="#059669" />
                  <Text style={styles.commonTitle}>{t('common_comment')}</Text>
                </View>
                <Ionicons
                  name={isCommonExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#059669"
                />
              </TouchableOpacity>

              {isCommonExpanded && (
                <View style={styles.cardContent}>
                  <RenderHTML
                    contentWidth={contentWidth}
                    source={commonHtmlSource}
                    tagsStyles={baseTagsStyles}
                  />
                </View>
              )}
            </View>
          )}

          {/* Special Comment Card */}
          {hasSpecial && (
            <View style={[styles.specialCard, hasCommon && { marginTop: 10 }]}>
              <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.7}
                onPress={() => setIsSpecialExpanded(prev => !prev)}
              >
                <View style={styles.cardHeaderLeft}>
                  <Ionicons name="create-outline" size={16} color="#6F48E9" />
                  <Text style={styles.specialTitle}>{t('special_comment')}</Text>
                </View>
                <Ionicons
                  name={isSpecialExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#6F48E9"
                />
              </TouchableOpacity>

              {isSpecialExpanded && (
                <View style={styles.cardContent}>
                  <RenderHTML
                    contentWidth={contentWidth}
                    source={specialHtmlSource}
                    tagsStyles={baseTagsStyles}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  )
}

export default React.memo(TeacherCommentSection)

const styles = ScaledSheet.create({
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14@ms',
    marginBottom: '16@ms',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEFF1'
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '10@ms',
    paddingHorizontal: '14@ms',
    backgroundColor: '#FFFFFF'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    flex: 1
  },
  teacherIconWrapper: {
    width: '28@ms',
    height: '28@ms',
    borderRadius: '14@ms',
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '14.5@ms',
    fontWeight: '700',
    color: '#222222'
  },
  teacherBadge: {
    backgroundColor: '#F3EEFF',
    paddingVertical: '2@ms',
    paddingHorizontal: '8@ms',
    borderRadius: '12@ms'
  },
  teacherBadgeText: {
    fontSize: '11.5@ms',
    fontWeight: '600',
    color: '#6F48E9'
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dropdownBadge: {
    padding: '4@ms',
    borderRadius: '6@ms'
  },
  bodyContainer: {
    paddingHorizontal: '14@ms',
    paddingBottom: '14@ms',
    paddingTop: '2@ms'
  },
  commonCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: '10@ms',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    padding: '10@ms'
  },
  specialCard: {
    backgroundColor: '#F9F5FF',
    borderRadius: '10@ms',
    borderWidth: 1,
    borderColor: '#EDE8FF',
    padding: '10@ms'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '2@ms'
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  commonTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#059669'
  },
  specialTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#6F48E9'
  },
  cardContent: {
    marginTop: '6@ms',
    paddingTop: '4@ms',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.04)'
  }
})
