import { palette, TYPO } from '@/theme'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-paper'
import useSelectAcademy from './hooks/useSelectAcademy'
import Select from '@/components/Select/CustomSelect'

const SelectAcademy = () => {
  const { academy, academyOptions, handleRedirectHome, handleSwitchAcademy, handleSelectedAcademy } = useSelectAcademy()
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ gap: 4 }}>
          <Text style={styles.title}>스터디 스페이스를 선택해주세요.</Text>
          <Select onValueChange={handleSelectedAcademy} value={academy} items={academyOptions} />
          <Text style={styles.helperText}>안내 텍스트입니다.</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', bottom: 50, flexDirection: "column", width: "100%", transform: "translateX(25%)" }}>
        <Button
          style={{ backgroundColor: palette.main[500], borderRadius: 6, width: '100%', padding: 8 }}
          onPress={() => handleSwitchAcademy(false)}
        >
          <Text style={{ color: '#FFF' }}>확인</Text>
        </Button>
        <View>
          <Button style={{ padding: 8, marginTop: 24 }} onPress={handleRedirectHome}>
            <Text style={{ color: palette.main[500] }}>건너뛰기</Text>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default SelectAcademy

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 80 },
  content: {
    justifyContent: 'center'
  },
  title: { ...TYPO.caption, color: palette.grey[900] },
  label: { ...TYPO.caption },
  input: {
    fontSize: 16,
    paddingVertical: 4
  },
  error: { color: 'red', marginBottom: 12 },
  button: {
    backgroundColor: palette.main[500],
    padding: 16,
    borderRadius: 6,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textButton: {
    ...TYPO.button2,
    color: '#FFF'
  },
  helperText: {
    ...TYPO.caption,
    color: palette.grey[500]
  },
  checkbox: {
    padding: 0
  },
  containerCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  containerSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  }
})
