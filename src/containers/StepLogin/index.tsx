import React from "react";
import { View, StyleSheet } from "react-native";

import * as yup from "yup";
import { Formik } from "formik";
import StepItem from "./components/StepItem";
import useStep from "./hooks/useStep";

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const schema = (t: any) =>
  yup.object().shape({
    fullName: yup.string().required("StudentName is required!"),
    phoneNumber: yup
      .string()
      .trim()
      .matches(phoneRegExp, {
        message: "Phone number is not valid",
      })
      .required(),
    grade: yup.number(),
    major: yup.string(),
    schoolName: yup.string().required(),
  });

const StepLogin = () => {
  const { t, handleSubmit } = useStep();
  const initValues = {
    fullName: "",
    phoneNumber: "",
    schoolName: "",
    grade: 1,
    major: t("liberal_arts"),
  };

  return (
    <>
      <Formik
        initialValues={initValues}
        onSubmit={handleSubmit}
        enableReinitialize={true}
        validationSchema={() => schema(t)}
      >
        {({ setFieldValue, values, errors, touched, setFieldTouched }) => (
          <StepItem
          touched={touched}
            setFieldTouched={setFieldTouched}
            values={values}
            errors={errors}
            setFieldValue={setFieldValue}
          />
        )}
      </Formik>
    </>
  );
};

export default StepLogin;
