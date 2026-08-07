import { palette, TYPO } from '@/theme'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-paper'
import useSelectAcademy from './hooks/useSelectAcademy'
import Select from '@/components/Select/CustomSelect'
import { ScaledSheet } from 'react-native-size-matters'

const SelectAcademy = () => {
  const { academy, academyOptions, handleSwitchAcademy, handleSelectedAcademy } = useSelectAcademy()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>스터디 스페이스를 선택해주세요.</Text>
          <Text style={styles.labelText}>스터디 스페이스</Text>
          <Select onValueChange={handleSelectedAcademy} value={academy} options={academyOptions} />
          <Text style={styles.helperText}>안내 텍스트입니다.</Text>
        </View>
      </View>
      <View
        style={{
          position: 'absolute',
          bottom: 50,
          flexDirection: 'column',
          width: '100%',
          transform: 'translateX(25%)'
        }}
      >
        <Button
          style={{
            backgroundColor: palette.main[600],
            borderRadius: 12,
            width: '100%',
            padding: 8,
          }}
          onPress={() => handleSwitchAcademy(!academy)}
        >
          <Text style={{ color: '#FFF' }}>확인</Text>
        </Button>
        <View>
          <Button mode="outlined" style={styles.cancelButton} onPress={() => handleSwitchAcademy(true)}>
            <Text style={{ color: palette.main[600] }}>건너뛰기</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default SelectAcademy

const styles = ScaledSheet.create({
  container: { flex: 1, paddingHorizontal: '24@ms' },
  content: {
    justifyContent: 'center'
  },
  title: { ...TYPO.heading1, color: palette.main[600], marginBottom: '80@ms', marginTop: '156@ms' },
  label: { ...TYPO.caption },
  input: {
    fontSize: '16@ms',
    paddingVertical: '4@ms'
  },
  error: { color: 'red', marginBottom: '12@ms' },
  button: {
    backgroundColor: palette.main[600],
    padding: '16@ms',
    borderRadius: '6@ms',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textButton: {
    ...TYPO.button2,
    color: '#FFF'
  },
  labelText: {
    ...TYPO.caption,
    color: palette.grey[900],
    marginBottom: '8@ms'
  },
  helperText: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginTop: '4@ms'
  },
  checkbox: {
    padding: 0
  },
  containerCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  containerSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  cancelButton: {
    borderRadius: '12@ms',
    padding: '8@ms',
    marginTop: '24@ms',
    borderColor: palette.main[600]
  }
})
