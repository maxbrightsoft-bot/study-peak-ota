import { palette, TYPO } from '@/theme'
import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Text, Button, Card } from 'react-native-paper'
import useNotice from '../hooks/useNotice'
import { TabList, TypeNotificationEnum } from '../configs/constants'
import moment from 'moment'
import { Notification } from '@/utils/types'
import Loading from '@/components/Loading'

type Props = {
  handleOpenDialog: (data?: Notification) => void
}
const Notice = ({ handleOpenDialog }: Props) => {
  const [isNew, setNew] = useState<any>({})
  const { t, isLoading, selected, handleChangeTab, notifications } = useNotice(setNew)

  return (
    <View style={{ paddingTop: 24, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: 'row', marginBottom: 4 }}>
        {TabList.map(({ label, value, type }, index) => (
          <Button
            key={index}
            onPress={() => handleChangeTab(value, type)}
            style={{
              marginRight: 4,
              backgroundColor: selected === value ? '#FFF' : palette.grey[100],
              
              borderRadius: 6
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: 600, color: selected === value ? palette.grey[900] : palette.grey[500], }}>{t(label)}</Text>
          </Button>
        ))}
      </View>

      <ScrollView
        style={{
          backgroundColor: palette.grey[50],
          borderRadius: 6,
          padding: 8,
          borderWidth: 1,
          borderColor: palette.grey[300]
        }}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isLoading && <Loading fullScreen={false} />}

          <View style={{ gap: 8, minHeight: 40, alignItems: "center", justifyContent: "center" }}>
            {notifications?.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => handleOpenDialog(item)}>
                <View
                  style={{
                    flexDirection: 'row',
                    borderRadius: 6,
                    width: '100%',
                    justifyContent: 'space-between',
                    backgroundColor: '#FFF',
                    alignItems: 'center',
                    paddingVertical: 8,
                    paddingHorizontal: 16
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <Text style={{ ...TYPO.caption, color: palette.grey[500], marginRight: 16 }}>
                      {moment().subtract(item.createdAt, 'hours').fromNow()}
                    </Text>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{ ...TYPO.heading3, color: palette.grey[700], width: '60%' }}
                    >
                      {item.name}
                    </Text>
                  </View>
                  <Text style={{ ...TYPO.body3, color: palette.grey[500] }}>
                    {item.type !== undefined ? t(`${TypeNotificationEnum[item.type].toLocaleLowerCase()}`) : item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {notifications?.length === 0 && (
              <Text style={{ ...TYPO.caption, color: palette.grey[500], textAlign: 'center' }}>{t('no_data')}</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

export default Notice
