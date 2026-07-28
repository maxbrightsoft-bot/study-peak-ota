import React from "react";
import { useRoute } from "@react-navigation/native";
import ExamResultList from "@/containers/ExamResultList";
import { useAcademyDeepLink } from "@/hooks/useAcademyDeepLink";
import Loading from "@/components/Loading";
import { Routes } from "@/navigators/RouteName";

const ExamResultListScreen = () => {
  const route = useRoute<any>();
  const paramDomain = route?.params?.domain;
  const { isReady } = useAcademyDeepLink(paramDomain, Routes.Auth.ExamResultList);

  if (!isReady) {
    return <Loading />;
  }

  return <ExamResultList />;
};

export default ExamResultListScreen;