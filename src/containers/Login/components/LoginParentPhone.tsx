import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';

const LoginParentPhone = () => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { id: '', password: '' },
    validationSchema: Yup.object({
      id: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: (values) => {
      console.log('Submitted', values);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="ID"
          placeholderTextColor="#43A047"
          style={styles.input}
          onChangeText={formik.handleChange('id')}
          onBlur={formik.handleBlur('id')}
          value={formik.values.id}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#43A047"
          secureTextEntry={!showPassword}
          style={styles.input}
          onChangeText={formik.handleChange('password')}
          onBlur={formik.handleBlur('password')}
          value={formik.values.password}
        />
        <TouchableOpacity
          style={styles.icon}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color="#607D8B" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => formik.handleSubmit()}>
        <Text style={styles.buttonText}>Confirmation</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginParentPhone;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  icon: {
    padding: 5,
  },
  button: {
    backgroundColor: '#E8FCEF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#43A047',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
