import { palette, TYPO } from '@/theme';
import { ScaledSheet } from 'react-native-size-matters';

const styles = ScaledSheet.create({
  container: {
    backgroundColor: palette.grey[100],
    borderRadius: 10,
  },
  labelView: {
    flexDirection: 'row',
  },
  label: {
    ...TYPO.caption
  },
  requiredText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textInput: {
    borderColor: palette.grey[300],
    color: palette.grey[900]
  },
  error: {
    ...TYPO.body3,
    marginBottom: '10@ms',
    paddingTop: '10@ms',
    paddingHorizontal: 8,
    color: 'red',
  },
  message: {
    fontSize: '12@ms',
  },
});

export default styles;
