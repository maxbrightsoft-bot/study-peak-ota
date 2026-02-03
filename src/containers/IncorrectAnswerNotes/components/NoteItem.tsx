import React, { FC, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { utcToLocalTime } from '@/utils/helpers'
import { TooltipProps } from '../configs/types'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import CustomTooltip from '@/components/Tooltip/CustomTooltip'
import { NoteResponse } from '@/utils/types'
import MathRender from '@/components/MathRender'

interface NoteItemProps extends TooltipProps<NoteResponse> {
  data: NoteResponse
  openTooltip: boolean
  placement?: string
  actions: any
  onLoad?: () => void
  onItemClick?: (data: NoteResponse) => void
}

const NoteItem: FC<NoteItemProps> = ({ data, openTooltip, actions, onClose, onOpen, onLoad, onItemClick }) => {
  const { t } = useTranslation()
  const [tooltipVisible, setTooltipVisible] = useState(openTooltip)

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
    <TouchableOpacity onPress={handleItemClick} style={styles.container}>
      <View style={styles.row}>
        <View style={styles.textContainer}>
          <View style={styles.row}>
            <Text style={styles.textLeft}>
              {data.examSessionId ? `${t('article')} ${(data.questionGroupIndex ?? 0) + 1}` : `${data.fullName}`}
            </Text>
            <Text style={styles.textMiddle}>
              {data.examSessionId
                ? t('number_question', { number: (data.questionOrder || 0) + 1 })
                : utcToLocalTime(data.createdAt, `${t('date_format')} HH:mm`)}
            </Text>
            {data.examSessionId && <Text style={styles.textRight}>{data.categoryName}</Text>}
          </View>
          <MathRender content={data.content} textColor={palette.grey[700]} />
          {/* <Text numberOfLines={1} ellipsizeMode="tail" style={styles.contentText}>
            {data.content?.replace(/<[^>]+>/g, '') || ''}
          </Text> */}
        </View>
        {data.isOwned && (
          <CustomTooltip
            isVisible={tooltipVisible}
            actions={actions}
            data={data}
            onClose={() => {
              setTooltipVisible(false)
              onClose?.()
            }}
          >
            <TouchableOpacity onPress={handleMoreClick} style={styles.moreButton}>
              <Ionicons name="ellipsis-horizontal-sharp" size={20} color={palette.grey[700]} />
            </TouchableOpacity>
          </CustomTooltip>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms',
    borderRadius: 6,
    backgroundColor: '#fff'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  textContainer: {
    flex: 1,
    marginRight: 8
  },
  textLeft: {
    fontWeight: 500,
    marginRight: 8,
    color: palette.grey[500]
  },
  textMiddle: {
    color: palette.grey[900],
    marginRight: 8,
    fontWeight: 700
  },
  textRight: {
    color: palette.grey[500],
    fontWeight: 500
  },
  contentText: {
    marginTop: 4,
    color: palette.grey[700],
    fontWeight: 500
  },
  iconButton: {
    padding: 4
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  tooltipBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    elevation: 3,
    minWidth: 150
  },
  tooltipItem: {
    paddingVertical: 6,
    fontSize: 14
  },
  moreButton: {
    padding: '8@ms'
  }
})

export default NoteItem
