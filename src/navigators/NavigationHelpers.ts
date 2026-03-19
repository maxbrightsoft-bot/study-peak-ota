import React from "react";
import { CommonActions, StackActions } from "@react-navigation/native";
import { MainRoutes, Routes } from "./RouteName";

export const navigationRef: any = React.createRef();

export const navigate = (routeName: string, params?: object) => {
  if (navigationRef.current.isReady()) {
  navigationRef?.current?.navigate(routeName, params);
  }
};

export const replace = (routeName: string, params?: object) => {
  if (navigationRef.current.isReady()) {
  navigationRef?.current?.replace(routeName, params);
  }
};

export const reset = (routeName: string) => {
  if (navigationRef.current.isReady()) {
  navigationRef?.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: !!Object.values(Routes.Auth).find( i => i === routeName) ? MainRoutes.AuthStack : MainRoutes.UnAuthStack, state: { index: 0, routes: [{ name: routeName}] } }],
    })
  );
  }
};

export const currentScreen = () => navigationRef?.current?.getCurrentRoute()?.name;

function setTopLevelNavigator(_navigatorRef: any) {
  navigationRef.current = _navigatorRef;
}

export const goBack = () => navigationRef?.current?.goBack();

export const currentRoute = () => navigationRef.current?.getCurrentRoute();

export const push = (screenCount: string, params: object) => {
  navigationRef?.current?.dispatch(StackActions.push(screenCount, params));
};

export const setParams = (params: object) => {
  navigationRef?.current?.dispatch(CommonActions.setParams(params));
};

export const pop = (screenCount: number) => {
  navigationRef?.current?.dispatch(StackActions.pop(screenCount));
};

export const popToTop = () => {
  navigationRef?.current?.dispatch(StackActions.popToTop());
};

export const getState = () => {
  navigationRef?.current?.getState();
};

export default {
  navigate,
  goBack,
  reset,
  currentRoute,
  pop,
  push,
  setParams,
  setTopLevelNavigator,
  popToTop,
};