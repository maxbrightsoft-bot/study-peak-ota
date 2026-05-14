import EditIcon from '@/assets/iconJSX/edit'
import GoogleIcon from '@/assets/iconJSX/google'
import TextField from '@/components/Input/TextField'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { palette } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { Formik } from 'formik'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import * as Yup from 'yup'
import { UserInfo } from '../configs/types'
import useAuthStore from '@/store/useAuthStore'
import CustomSelect from '@/components/Select/CustomSelect'
import SchoolSearchSelect from '@/components/Select/SchoolSearchSelect'

type Props = {
  open: boolean
  onClose: () => void
  gradeOptions: {
    label: string
    value: number
  }[]
  subjectOptions: {
    label: string
    value: string
  }[]
  handleUpdateInfo: (values: UserInfo) => Promise<void>
}

const Divider = () => <View style={styles.divider} />

type FormItemProps = {
  label: string
  name: string
  value: any
  onChange: (text: string) => void
  editingField: string | null
  options?: {
    label: string
    value: any
  }[]
  setEditingField: (field: string | null) => void
}

const FormItem = ({ label, name, options, value, onChange, editingField, setEditingField }: FormItemProps) => {
  const isEditing = editingField === name

  return (
    <View style={styles.item}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.right}>
        {isEditing ? (
          name === 'schoolName' ? (
            <SchoolSearchSelect
              style={{ width: 150 }}
              value={value}
              onValueChange={onChange}
              placeholder={label}
            />
          ) : !!options?.length ? (
            <CustomSelect style={{ width: 100 }} onValueChange={onChange} value={value || ''} options={options} />
          ) : (
            <TextField
              value={value}
              onChangeText={onChange}
              style={styles.input}
              onBlur={() => setEditingField(null)}
            />
          )
        ) : (
          <Text style={styles.valueText} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
        )}

        <TouchableOpacity onPress={() => setEditingField(isEditing ? null : name)}>
          <EditIcon color={palette.grey[500]} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string().nullable(),

  parentName: Yup.string().nullable(),

  parentPhoneNumber: Yup.string().nullable(),

  schoolName: Yup.string().nullable(),

  major: Yup.string().nullable(),

  fullName: Yup.string().required('이름을 입력해주세요.')
})

const UpdateAccount = ({ open, onClose, handleUpdateInfo, gradeOptions, subjectOptions }: Props) => {
  const { t } = useTranslation()
  const user = useAuthStore(state => state.user)
  const [editingField, setEditingField] = useState<string | null>(null)

  const initialValues = {
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    parentName: user?.parentName || '',
    parentPhoneNumber: user?.parentPhoneNumber || '',
    schoolName: user?.schoolName || '',
    grade: user?.grade || 1,
    major: user?.major || ''
  }

  return (
    <SlideDrawerRoot visible={open} onClose={onClose}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[200]} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{t('account_management')}</Text>

        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handleUpdateInfo(values)
          }}
        >
          {({ values, setFieldValue, handleChange, handleSubmit }) =>
          {
            return <>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View>
                  <View style={styles.profile}>
                    <View style={styles.profileRow}>
                      {editingField === 'fullName' ? (
                        <TextField
                          value={values.fullName}
                          onChangeText={handleChange('fullName')}
                          style={styles.profileInput}
                          onBlur={() => setEditingField(null)}
                        />
                      ) : (
                        <Text style={[styles.name, { fontSize: values.fullName ? 20 : 16 }]} onPress={() => setEditingField(editingField === 'fullName' ? null : 'fullName')}>{values.fullName || t('no_name')}</Text>
                      )}

                      <TouchableOpacity
                        onPress={() => setEditingField(editingField === 'fullName' ? null : 'fullName')}
                      >
                        <EditIcon color={palette.grey[500]} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.profileRow}>
                      {Platform.OS === 'android' && <GoogleIcon />}
                      <Text style={styles.email}>{user?.email}</Text>
                    </View>
                  </View>

                  <View style={styles.card}>
                    <FormItem
                      label={t('phone_number')}
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={handleChange('phoneNumber')}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />

                    <Divider />
                    <FormItem
                      label={t('parent_name')}
                      name="parentName"
                      value={values.parentName}
                      onChange={handleChange('parentName')}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />
                    <Divider />

                    <FormItem
                      label={t('parent_phone_number')}
                      name="parentPhoneNumber"
                      value={values.parentPhoneNumber}
                      onChange={handleChange('parentPhoneNumber')}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />
                  </View>

                  <View style={styles.card}>
                    <FormItem
                      label={t('school')}
                      name="schoolName"
                      value={values.schoolName}
                      onChange={handleChange('schoolName')}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />

                    <Divider />

                    <FormItem
                      label={t('grade')}
                      name="grade"
                      value={values.grade}
                      options={gradeOptions}
                      onChange={(value) => setFieldValue('grade', value)}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />
                    <Divider />

                    <FormItem
                      label={t('major')}
                      name="major"
                      options={subjectOptions}
                      value={values.major}
                      onChange={(value) => setFieldValue('major', value)}
                      editingField={editingField}
                      setEditingField={setEditingField}
                    />
                  </View>

                  {/* <View style={styles.deleteCard}>
                  <Text style={styles.deleteText}>계정 삭제하기</Text>
                  <Text style={styles.deleteWarning}>복구는 불가능합니다.</Text>
                </View> */}
                </View>
              </ScrollView>

              <TouchableOpacity style={styles.button} onPress={() => handleSubmit()}>
                <Text style={styles.buttonText}>{t('save')}</Text>
              </TouchableOpacity>
            </>}
          }
        </Formik>
      </View>
    </SlideDrawerRoot>
  )
}

export default UpdateAccount

const styles = ScaledSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    borderBottomWidth: '1@ms',
    borderBottomColor: '#eee'
  },
  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#222'
  },

  backButton: {
    width: '24@ms'
  },

  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    paddingHorizontal: '20@ms'
  },

  profile: {
    gap: '6@ms',
    alignItems: 'center',
    marginBottom: '58@ms',
    marginTop: '47@ms'
  },

  name: {
    fontWeight: '600',
    color: '#222222'
  },

  email: {
    fontSize: '16@ms',
    color: palette.grey[900]
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: '12@ms',
    marginBottom: '16@ms',
    overflow: 'hidden'
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '20@ms',
    paddingHorizontal: '16@ms'
  },

  label: {
    fontSize: '16@ms',
    fontWeight: 600,
    color: '#222',
  },

  right: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  input: {
    fontSize: '15@ms',
    color: '#6A3DE8',
    minWidth: '120@ms',
  },

  divider: {
    height: '1@ms',
    backgroundColor: '#eee'
  },

  deleteCard: {
    backgroundColor: '#fff',
    borderRadius: '12@ms',
    paddingHorizontal: '15@ms',
    paddingVertical: '20@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  deleteText: {
    fontSize: '16@ms',
    fontWeight: '600'
  },

  deleteWarning: {
    color: '#DB4D4D',
    fontSize: '12@ms',
    fontWeight: 600
  },
  button: {
    backgroundColor: palette.main[600],
    marginBottom: '20@ms',
    paddingVertical: '16@ms',
    borderRadius: '12@ms',
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontSize: '15@ms',
    fontWeight: '600'
  },
  valueText: {
    fontSize: '14@ms',
    color: palette.main[600],
    marginRight: '4@ms',
    fontWeight: '500',
    maxWidth: '100@ms'
  },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },

  profileInput: {
    fontSize: '18@ms',
    color: palette.main[600],
    minWidth: '120@ms',
    textAlign: 'center'
  }
})
