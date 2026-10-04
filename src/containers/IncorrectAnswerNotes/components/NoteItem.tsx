import React, { FC, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FontAwesome6, Ionicons } from '@expo/vector-icons'
import { TooltipProps } from '../configs/types'
import { palette } from '@/theme'
import { ExamResult, NoteResponse } from '@/utils/types'
import MathRender from '@/components/MathRender'
import TextTooltip from '@/components/Tooltip/TextTooltip'
import { ScaledSheet } from 'react-native-size-matters'

interface NoteItemProps extends TooltipProps<NoteResponse> {
  data: NoteResponse
  openTooltip: boolean
  placement?: string
  actions: any
  examResultData?: ExamResult
  onLoad?: () => void
  onItemClick?: (data: NoteResponse) => void
}

const NoteItem: FC<NoteItemProps> = ({
  data,
  openTooltip,
  actions,
  onClose,
  examResultData,
  onOpen,
  onLoad,
  onItemClick
}) => {
  const { t } = useTranslation()
  const [tooltipVisible, setTooltipVisible] = useState(openTooltip)
  const question = examResultData?.questions.find(i => i.questionOrder === data?.questionOrder)

  const handleMoreClick = () => {
    setTooltipVisible(true)
    onOpen(data)
  }

  const handleItemClick = () => {
    onItemClick?.(data)
  }

  useEffect(() => {
    onLoad?.()
  }, [])

  return (
    <View style={styles.container}>
      {(examResultData?.title || data?.title) && (
        <TouchableOpacity activeOpacity={0.7} onPress={handleItemClick} style={styles.headerRow}>
          <TextTooltip
            text={examResultData?.title || data?.title || ''}
            numberOfLines={1}
            textStyle={styles.headerText}
            containerStyle={{ flexShrink: 1 }}
          />
          {(examResultData?.subjectName || data?.subjectName) && <View style={styles.separator} />}
          <Text style={styles.headerText} numberOfLines={1} ellipsizeMode="tail">{examResultData?.subjectName || data?.subjectName}</Text>
        </TouchableOpacity>
      )}
      <View style={styles.metaRow}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleItemClick} style={styles.metaLeft}>
          <Text style={styles.number}>
            {t('number_question', {
              number: (data?.questionOrder || 0) + 1
            })}
          </Text>
          <Text style={styles.metaText}>{data.categoryName}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {actions && actions.map((action: any, index: number) => (
            <TouchableOpacity
              key={index}
              onPress={() => action?.onPress?.(data)}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              style={{ padding: 2 }}
            >
              {action.startIcon ? (
                action.startIcon
              ) : (
                <Text style={[{ fontSize: 13, fontWeight: '600', color: palette.grey[700] }, action.textStyle]}>
                  {t(action.label) || action.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={handleItemClick} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
            <FontAwesome6 name="angle-right" size={18} color={palette.grey[300]} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity activeOpacity={0.7} onPress={handleItemClick} style={styles.contentHighlight}>
        <MathRender content={data.content} textColor={palette.grey[800]} maxLines={1} />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} onPress={handleItemClick} style={styles.bottomRow}>
        {!!data?.questionTypeName && (
          <Text style={styles.childTitlePage}>{data.questionTypeName}</Text>
        )}
        {!!data?.page && (
          <>
            <View style={styles.separator} />
            <Text style={styles.metaText}>p.{data?.page}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    padding: '16@ms',
    gap: '12@ms'
  },

  pressed: {
    opacity: 0.85
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },

  headerText: {
    fontSize: '12@ms',
    lineHeight: '20@ms',
    color: palette.grey[400],
    fontWeight: 500,
    flexShrink: 1
  },
  separator: {
    width: '1@ms',
    height: '10@ms',
    backgroundColor: palette.grey[400],
    marginHorizontal: '10@ms'
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '6@ms'
  },

  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    flexWrap: 'wrap'
  },
  number: {
    fontSize: '16@ms',
    fontWeight: '700',
    lineHeight: '25@ms',
    color: palette.grey[900],
    marginRight: '12@ms'
  },
  childTitlePage: {
    fontSize: '11@ms',
    fontWeight: '600',
    color: '#111827',
    flexShrink: 0,
  },
  metaText: {
    fontSize: '12@ms',
    color: palette.grey[500]
  },

  contentHighlight: {
    backgroundColor: '#F9FAFB',
    padding: '12@ms',
    borderRadius: '10@ms',
  },

  description: {
    fontSize: '20@ms',
    color: '#111',
  }
})

export default NoteItem
