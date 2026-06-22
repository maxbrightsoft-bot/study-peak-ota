import React from "react";

import * as yup from "yup";
import { Formik } from "formik";
import StepItem from "./components/StepItem";
import useStep from "./hooks/useStep";

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;

const schema = (t: any) =>
  yup.object().shape({
    fullName: yup.string().when("loginMethod", {
      is: "Apple",
      then: (schema) => schema.notRequired(),
      otherwise: (schema) => schema.required(),
    }),
    phoneNumber: yup
      .string()
      .trim()
      .matches(phoneRegExp, {
        message: "Phone number is not valid",
      })
      .required(),
    parentName: yup.string().required("ParentName is required!"),
    parentPhoneNumber: yup
      .string()
      .trim()
      .matches(phoneRegExp, {
        message: "Parent phone number is not valid",
      })
      .required(),
    grade: yup.number(),
    major: yup.string(),
    schoolName: yup.string().required(),
  });

const StepLogin = () => {
  const { t, user, handleSubmit } = useStep();
  const initValues = {
    loginMethod: user?.loginMethod || "",
    fullName: "",
    phoneNumber: user?.phoneNumber || "",
    parentName: user?.parentName || "",
    parentPhoneNumber: user?.parentPhoneNumber || "",
    schoolName: user?.schoolName || "",
    grade: user?.grade || 1,
    major: user?.major || null,
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
