import React from "react";
import { CommonActions, StackActions } from "@react-navigation/native";

export const navigationRef: any = React.createRef();

export const navigate = (routeName: string, params?: object) => {
  navigationRef?.current?.navigate(routeName, params);
};

export const reset = (routeName: string) => {
  navigationRef?.current?.dispatch(
    CommonActions.reset({
      index: 1,
      routes: [{ name: routeName }],
    })
  );
};

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
