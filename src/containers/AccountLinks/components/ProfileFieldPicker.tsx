import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '@/theme'
import { GRADE_OPTIONS } from '@/containers/StepLogin/configs/constants'
import { MergeDirection, ProfileChoices, ProfileFieldName, ProfileFields, ProfileSide } from '../configs/types'
import { choiceForSide, isEmptyValue, PROFILE_FIELDS, sideOfChoice } from '../utils/profileChoices'

type ProfileFieldPickerProps = {
  current: ProfileFields
  other: ProfileFields
  otherLabel: string
  direction: MergeDirection
  choices: ProfileChoices
  onChange: (choices: ProfileChoices) => void
  disabled?: boolean
}

const ProfileFieldPicker = ({ current, other, otherLabel, direction, choices, onChange, disabled }: ProfileFieldPickerProps) => {
  const { t } = useTranslation()
  const stays: ProfileSide = direction === 'MergeOtherIntoMe' ? 'current' : 'other'

  const renderValue = (name: ProfileFieldName, value: ProfileFields[ProfileFieldName]) => {
    if (isEmptyValue(value)) return <Text style={styles.empty}>-</Text>
    if (name === 'Avatar') return <Image source={{ uri: String(value) }} style={styles.avatar} />
    if (name === 'Grade') {
      const option = GRADE_OPTIONS.find(i => i.value === value)
      return <Text style={styles.value}>{option ? t(option.label) : String(value)}</Text>
    }
    return <Text style={styles.value}>{String(value)}</Text>
  }

  const renderOption = (name: ProfileFieldName, side: ProfileSide) => {
    const selected = sideOfChoice(choices[name] ?? 'Target', direction) === side
    return (
      <TouchableOpacity
        style={[styles.option, selected && styles.optionSelected]}
        disabled={disabled}
        onPress={() => onChange({ ...choices, [name]: choiceForSide(side, direction) })}
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
      >
        <Ionicons
          name={selected ? 'radio-button-on' : 'radio-button-off'}
          size={18}
          color={selected ? palette.main[600] : palette.grey[400]}
        />
        <View style={styles.optionBody}>{renderValue(name, side === 'current' ? current[name] : other[name])}</View>
      </TouchableOpacity>
    )
  }

  const renderHeader = (title: string, side: ProfileSide) => (
    <View style={styles.headerCell}>
      <Text style={styles.headerTitle} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.badge, side === stays ? styles.badgeStays : styles.badgeCloses]}>
        {t(side === stays ? 'account_that_stays' : 'account_that_closes')}
      </Text>
    </View>
  )

  return (
    <View>
      <View style={styles.row}>
        {renderHeader(t('this_account'), 'current')}
        {renderHeader(otherLabel, 'other')}
      </View>
      {PROFILE_FIELDS.map(({ name, label }) => (
        <View key={name} style={styles.field}>
          <Text style={styles.fieldLabel}>{t(label)}</Text>
          <View style={styles.row}>
            {renderOption(name, 'current')}
            {renderOption(name, 'other')}
          </View>
        </View>
      ))}
    </View>
  )
}

export default ProfileFieldPicker

const styles = ScaledSheet.create({
  row: { flexDirection: 'row', gap: '8@ms' },
  headerCell: { flex: 1, gap: '4@ms' },
  headerTitle: { fontSize: '13@ms', fontWeight: '700', color: palette.grey[900] },
  badge: {
    alignSelf: 'flex-start',
    fontSize: '11@ms',
    fontWeight: '600',
    borderRadius: '10@ms',
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    overflow: 'hidden'
  },
  badgeStays: { backgroundColor: palette.success.lighter, color: palette.success.dark },
  badgeCloses: { backgroundColor: palette.grey[100], color: palette.grey[600] },
  field: { marginTop: '12@ms' },
  fieldLabel: { fontSize: '12@ms', fontWeight: '600', color: palette.grey[500], marginBottom: '4@ms' },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms',
    borderWidth: 1,
    borderColor: palette.grey[200],
    borderRadius: '8@ms',
    padding: '8@ms'
  },
  optionSelected: { borderColor: palette.main[600], backgroundColor: palette.main[50] },
  optionBody: { flex: 1 },
  value: { fontSize: '13@ms', color: palette.grey[900] },
  empty: { fontSize: '13@ms', color: palette.grey[400] },
  avatar: { width: '28@ms', height: '28@ms', borderRadius: '14@ms' }
})
