import { palette, TYPO } from '@/theme';
import { ScaledSheet } from 'react-native-size-matters';

const styles = ScaledSheet.create({
  container: {},
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
    height: '56@ms',
    borderRadius: 4,
    paddingHorizontal: '16@ms',
    alignItems: 'center',
    overflow: 'hidden',
  
  },
  textInput: {
    minHeight: '40@ms',
    borderBottomWidth: 1,
    borderColor: palette.grey[300],
    padding: '12@ms'
  },
  error: {
    ...TYPO.body3,
    marginBottom: '10@ms',
    paddingTop: '10@ms',
    color: 'red',
  },
  message: {
    fontSize: '12@ms',
  },
});

export default styles;
