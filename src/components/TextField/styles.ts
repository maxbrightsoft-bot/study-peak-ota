import { palette } from '@/theme';
import { ms,ScaledSheet } from 'react-native-size-matters';

const styles = ScaledSheet.create({
  container: {},
  labelView: {
    flexDirection: 'row',
  },
  label: {
    marginBottom:'4@ms',
    fontSize: 15,
    fontWeight: 'bold',
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
    flex: 1,
    minHeight: '40@ms',
    borderBottomWidth: 1,
    borderColor: palette.grey[300],
    padding: '12@ms'
  },
  error: {
    fontSize: '16@ms',
    marginHorizontal: '16@ms',
    marginBottom: '10@ms',
  },
  message: {
    fontSize: '12@ms',
  },
});

export default styles;
