import React, { useEffect, useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TFunction } from 'i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { getAvatarInitial, shouldShowDomain } from '../configs/academyPicker'
import { GuestAcademy } from '../configs/types'

type AcademyPickerRowProps = {
  t: TFunction<'translation', undefined>
  item: GuestAcademy
  selected: boolean
  onSelect: (academy: GuestAcademy) => void
}

const AcademyPickerRow = ({ t, item, selected, onSelect }: AcademyPickerRowProps) => {
  const pinned = item.isLearningSpace
  const [imageFailed, setImageFailed] = useState<boolean>(false)
  const imageUri = !pinned && !imageFailed ? item.image?.trim() || undefined : undefined

  useEffect(() => setImageFailed(false), [item.image])

  const name = pinned ? t('my_study_space') : item.name
  const initial = pinned ? undefined : getAvatarInitial(item.name)
  const caption = pinned ? t('guest_study_space_desc') : shouldShowDomain(item.name, item.domain) ? item.domain : ''

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onSelect(item)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={selected ? `${name}, ${t('guest_academy_selected')}` : name}
      style={[styles.row, pinned && styles.pinned, selected && (pinned ? styles.pinnedSelected : styles.selected)]}
    >
      <View style={[styles.avatar, pinned && styles.pinnedAvatar]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} onError={() => setImageFailed(true)} />
        ) : pinned ? (
          <Ionicons name="planet-outline" size={22} color={palette.main[600]} />
        ) : initial ? (
          <Text style={styles.initial}>{initial}</Text>
        ) : (
          <Ionicons name="school-outline" size={20} color={palette.main[700]} />
        )}
      </View>
      <View style={styles.text}>
        <Text style={[styles.name, (pinned || selected) && styles.nameBold]} numberOfLines={2}>
          {name}
        </Text>
        {caption ? (
          <Text style={styles.caption} numberOfLines={1}>
            {caption}
          </Text>
        ) : null}
      </View>
      {selected && <Ionicons name="checkmark-circle" size={22} color={palette.main[600]} />}
    </TouchableOpacity>
  )
}

export default AcademyPickerRow

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
    minHeight: '52@ms',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    marginBottom: '2@ms',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  selected: {
    backgroundColor: palette.main[50],
    borderColor: palette.main[100]
  },
  pinned: {
    minHeight: '64@ms',
    borderRadius: '14@ms',
    paddingHorizontal: '14@ms',
    marginBottom: 0,
    backgroundColor: palette.main[50],
    borderColor: palette.main[100]
  },
  pinnedSelected: {
    backgroundColor: palette.grey[0],
    borderWidth: 2,
    borderColor: palette.main[600]
  },
  avatar: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[100]
  },
  pinnedAvatar: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '20@ms',
    backgroundColor: palette.grey[0],
    borderWidth: 1,
    borderColor: palette.main[100]
  },
  image: {
    width: '36@ms',
    height: '36@ms',
    borderRadius: '18@ms'
  },
  initial: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: palette.main[700]
  },
  text: {
    flex: 1
  },
  name: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  nameBold: {
    fontWeight: '700'
  },
  caption: {
    fontSize: '12.5@ms',
    color: palette.grey[600]
  }
})
