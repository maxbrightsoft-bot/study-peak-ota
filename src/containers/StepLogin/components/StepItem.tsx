import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, TYPO } from "@/theme";
import { Field } from "formik";
import TextField from "@/components/TextField";
import GridContainer from "@/components/Grid/GridContainer";
import GridItem from "@/components/Grid/GridItem";
import Select from "@/components/Select/CustomSelect";
import useStepItem from "../hooks/useStepItem";
import { OutlineButton, PrimaryButton } from "@/components/Button";

type Props = {
  values: any;
  touched: any
  errors: any;
  setFieldValue: any;
  setFieldTouched: any
};

const StepItem = ({ values, errors, touched, setFieldValue, setFieldTouched }: Props) => {
  const { t, step, onNext, subjectOptions, gradeOptions, handleRedirectHome } = useStepItem({
    values,
    setFieldTouched
  });

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.title}>먼저, 이름을 입력해주세요.</Text>
            <Text style={styles.label}>이름</Text>
            <Field
              name="studentName"
              render={({ field }: any) => (
                <TextField
                  value={values.studentName}
                  style={styles.input}
                  onChangeText={(value: string) =>
                    setFieldValue("studentName", value)
                  }
                />
              )}
            />
            {touched.studentName && errors.studentName && (
              <Text style={styles.error}>이름은 필수입니다</Text>
            )}
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.title}>전화번호를 입력해주세요.</Text>
            <Text style={styles.label}>전화번호</Text>
            <Field
              name="phoneNumber"
              render={({ field }: any) => (
                <TextField
                  style={styles.input}
                  value={values.phoneNumber}
                  keyboardType="phone-pad"
                  onChangeText={(value: string) =>
                    setFieldValue("phoneNumber", value)
                  }
                />
              )}
            />
            {touched.phoneNumber && errors.phoneNumber && (
              <Text style={styles.error}>전화번호는 필수입니다</Text>
            )}
          </>
        );
      case 2:
        return (
          <>
            <View>
              <Text style={styles.title}>재학 중인 학교를 선택해주세요.</Text>
              <Text style={styles.label}>전화번호</Text>
              <Field
                name="schoolName"
                render={({ field }: any) => (
                  <TextField
                    value={values.schoolName}
                    style={styles.input}
                    onChangeText={(value: string) =>
                      setFieldValue("schoolName", value)
                    }
                  />
                )}
              />
              {touched.schoolName && errors.schoolName && (
                <Text style={styles.error}>학교 이름은 필수입니다</Text>
              )}
              <Text style={styles.helperText}>안내 텍스트입니다.</Text>
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>학과와 학년을 선택해주세요.</Text>
            <GridContainer spacing={12}>
              <GridItem xs={4} style={{ justifyContent: "space-between" }}>
                <Text style={styles.label}>
                  {t("select_liberal_arts/science")}
                </Text>
                <Field
                  name="subject"
                  render={({ field }: any) => (
                    <Select
                      onValueChange={(value) => setFieldValue("subject", value)}
                      value={values.subject || ""}
                      items={subjectOptions}
                    />
                  )}
                />
              </GridItem>
              <GridItem xs={4} style={{ justifyContent: "space-between" }}>
                <Text style={styles.label}>{t("current_grade")}</Text>
                <Field
                  name="currentGrade"
                  render={({ field }: any) => (
                    <Select
                      onValueChange={(value) =>
                        setFieldValue("currentGrade", value)
                      }
                      value={values.currentGrade || ""}
                      items={gradeOptions}
                    />
                  )}
                />
              </GridItem>
            </GridContainer>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>스터디 스페이스를 선택해주세요.</Text>
            <Text style={styles.label}>스페이스</Text>
            <Field
              name="studySpace"
              render={({ field }: any) => (
                <TextField
                  value={values.studySpace}
                  style={styles.input}
                  onChangeText={(value: string) =>
                    setFieldValue("studySpace", value)
                  }
                />
              )}
            />
            {touched.studySpace && errors.studySpace && (
              <Text style={styles.error}>학교 이름은 필수입니다</Text>
            )}
          </>
        );
    }
  };

  return (
    <>
      <View style={styles.content}>{renderStep()}</View>
      <PrimaryButton label="확인" onPress={onNext} />
      {!!values.studySpace && (
        <OutlineButton label="건너뛰기" onPress={handleRedirectHome} />
      )}
    </>
  );
};

export default StepItem;

const styles = StyleSheet.create({
  container: { flex: 1, paddingBottom: 24 },
  content: {
    justifyContent: "center",
  },
  title: { ...TYPO.heading1, marginBottom: 80 },
  label: { ...TYPO.caption },
  input: {
    fontSize: 16,
    paddingVertical: 4,
  },
  error: { color: "red", marginBottom: 12 },
  button: {
    backgroundColor: palette.main[500],
    padding: 16,
    borderRadius: 6,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  textButton: {
    ...TYPO.button2,
    color: "#FFF",
  },
  helperText: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginTop: 4,
  },
  checkbox: {
    padding: 0,
  },
  containerCheckbox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  containerSelect: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
