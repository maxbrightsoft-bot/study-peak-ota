import { ScheduleFormData } from '../../configs/type'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import moment from 'moment'

interface Props {
  open: boolean
  onClose: () => void
  t: any
  isUpdate?: boolean
  onSubmit: () => void
  newSchedule?: ScheduleFormData
}

const CreateNewScheduleConfirmDialog = ({ t, onClose, open, isUpdate, onSubmit, newSchedule }: Props) => {
  return (
    <CommonDialog
      isVisible={open}
      onClose={onClose}
      title={isUpdate ? t('update_schedule') : t('create_a_new_schedule')}
    >
      <View style={styles.container}>
        <View style={styles.formGroup}>
          <Text style={styles.labelText}>{t('schedule_name')}</Text>
          <Text style={styles.titleText}>{newSchedule?.title}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.labelText}>{t('date')}</Text>
          <Text style={styles.titleText}>{moment.utc(newSchedule?.date).local().format(t('date_format'))}</Text>
        </View>
        <View style={styles.formGroup}>
          <Text style={styles.labelText}>{t('hour')}</Text>
          <View style={styles.formGroup}>
            <Text style={styles.titleText}>{moment.utc(newSchedule?.startTime).local().format('HH:mm')}</Text>
            <Text style={styles.titleText}>~</Text>
            <Text style={styles.titleText}>{moment.utc(newSchedule?.endTime).local().format('HH:mm')}</Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
          <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onSubmit}>
          <Text style={styles.confirmButtonText}> {isUpdate ? t('update') : t('create')}</Text>
        </TouchableOpacity>
      </View>
    </CommonDialog>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  formGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: "8@ms"
  },
  labelText: {
    fontSize: '13@ms',
    fontWeight: 600,
    color: palette.grey[700],
    width: "100@ms"
  },
  titleText: {
    fontSize: '14@ms',
    fontWeight: 700,
    color: palette.main[700]
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '16@ms',
    borderTopWidth: 1,
    borderTopColor: palette.grey[200]
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '8@ms',
    minWidth: '120@ms',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: palette.grey[100]
  },
  confirmButton: {
    backgroundColor: palette.main[500]
  },
  cancelButtonText: {
    ...TYPO.button2,
    color: palette.grey[700]
  },
  confirmButtonText: {
    ...TYPO.button2,
    color: 'white'
  }
})
export default CreateNewScheduleConfirmDialog
