import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAcademyDeepLink } from "@/hooks/useAcademyDeepLink";
import Loading from "@/components/Loading";
import useAuthStore from "@/store/useAuthStore";
import { Routes } from "@/navigators/RouteName";
import { resetToHome } from "@/navigators/NavigationHelpers";
import { getStudentExamSessionsByIdsApi } from "@/containers/ExamResult/apiClients";
import StudentExamSessionPicker from "@/containers/ExamResult/components/StudentExamSessionPicker";
import { ExamSessionResponse } from "@/utils/types";

const PAGE_SIZE = 10;

const parseSessionIds = (raw: any): number[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(Number).filter((n) => !isNaN(n) && n > 0);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  }
  if (typeof raw === "number") {
    return raw > 0 ? [raw] : [];
  }
  return [];
};

export const withMultiStudentSessionExamResult = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const ComponentWithMultiSession = (props: P & { route?: any }) => {
    const route = useRoute<any>() || props.route;
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const setLoading = useAuthStore((state) => state.setLoading);
    const paramDomain = route?.params?.domain;
    const isCheckLinkAccount =
      route?.params?.isCheckLinkAccount === "true" ||
      route?.params?.isCheckLinkAccount === true;

    const rawStudentExamSessionIds =
      route?.params?.studentExamSessionIds;
    const studentExamSessionIds = useMemo(
      () => parseSessionIds(rawStudentExamSessionIds),
      [rawStudentExamSessionIds]
    );

    const isMultiSessionMode =
      isCheckLinkAccount;

    const { isReady } = useAcademyDeepLink(Routes.Auth.ExamResult, paramDomain);

    const [sessions, setSessions] = useState<ExamSessionResponse[] | null>(null);
    const [selectedSession, setSelectedSession] = useState<ExamSessionResponse | null>(null);
    const [isSheetVisible, setIsSheetVisible] = useState<boolean>(false);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number | null>(null);

    const hasMore = useMemo(() => {
      if (!sessions) return false;
      if (totalItems !== null) {
        return sessions.length < totalItems;
      }
      return sessions.length < studentExamSessionIds.length;
    }, [sessions, totalItems, studentExamSessionIds.length]);

    const handleHome = useCallback(() => {
      try {
        resetToHome({ refreshKey: Date.now() });
      } catch {
        try {
          navigation?.navigate?.(Routes.Auth.MainTabs, {
            screen: Routes.Auth.Home,
          });
        } catch {
          navigation?.navigate?.(Routes.Auth.Home);
        }
      }
    }, [navigation]);

    const handleBack = useCallback(() => {
      if ((props as any)?.onClose) {
        (props as any).onClose();
        return;
      }

      // Kiểm tra xem có StackNavigator nào có lịch sử màn hình trước đó không
      let hasStackHistory = false;
      let nav = navigation;
      while (nav) {
        const navState = nav.getState?.();
        if (
          navState?.type === "stack" &&
          typeof navState.index === "number" &&
          navState.index > 0
        ) {
          hasStackHistory = true;
          break;
        }
        nav = nav.getParent?.();
      }

      if (hasStackHistory && navigation?.canGoBack?.()) {
        navigation.goBack();
      } else {
        handleHome();
      }
    }, [navigation, props, handleHome]);

    const loadSessions = useCallback(
      async (pageToLoad = 0) => {
        if (!isMultiSessionMode) return;
        if (studentExamSessionIds.length === 0) {
          setSessions([]);
          setSelectedSession(null);
          setTotalItems(0);
          setPage(0);
          return;
        }

        const isInitial = pageToLoad === 0;
        if (isInitial) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        try {
          const res = await getStudentExamSessionsByIdsApi(studentExamSessionIds, {
            page: pageToLoad,
            limit: PAGE_SIZE,
          });

          const { items = [], totalItems: total = 0 } = res.data || {};

          setTotalItems(total);
          setPage(pageToLoad);

          if (isInitial) {
            setSessions(items);
            if (items.length > 0) {
              setSelectedSession((prev) => {
                if (prev) {
                  const prevId = prev.studentExamSessionId ?? prev.id;
                  const matched = items.find(
                    (i) => (i.studentExamSessionId ?? i.id) === prevId
                  );
                  if (matched) return matched;
                }
                return items[0];
              });
            } else {
              setSelectedSession(null);
            }
          } else {
            setSessions((prev) => {
              if (!prev) return items;
              const existingIds = new Set(
                prev.map((i) => i.studentExamSessionId ?? i.id)
              );
              const filtered = items.filter(
                (i) => !existingIds.has(i.studentExamSessionId ?? i.id)
              );
              return [...prev, ...filtered];
            });
          }
        } catch (error) {
          console.error(
            "[withMultiStudentSessionExamResult] Error loading sessions:",
            error
          );
          if (isInitial) {
            setSessions([]);
            setTotalItems(0);
          }
        } finally {
          if (isInitial) {
            setLoading(false);
          } else {
            setIsLoadingMore(false);
          }
        }
      },
      [isMultiSessionMode, studentExamSessionIds, setLoading]
    );

    const handleLoadMore = useCallback(() => {
      if (isLoadingMore || !hasMore || !sessions) return;
      loadSessions(page + 1);
    }, [isLoadingMore, hasMore, sessions, page, loadSessions]);

    useEffect(() => {
      if (isReady && isMultiSessionMode) {
        loadSessions(0);
      }
    }, [isReady, isMultiSessionMode, studentExamSessionIds, loadSessions]);

    const activeExamCode = isMultiSessionMode
      ? selectedSession?.code || selectedSession?.examCode
      : route?.params?.examCode;

    const activeStudentExamSessionId = isMultiSessionMode
      ? selectedSession?.studentExamSessionId
      : route?.params?.studentExamSessionId;

    const activeExamSessionId = isMultiSessionMode
      ? selectedSession?.id
      : route?.params?.examSessionId;

    const renderCustomHeader = () => {
      if (!isMultiSessionMode) return null;

      const currentTitle =
        selectedSession?.title ||
        selectedSession?.code ||
        t("exam_results");

      return (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerSideButton}
            onPress={handleBack}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#222222" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            {selectedSession ? (
              <TouchableOpacity
                style={styles.headerDropdownButton}
                activeOpacity={0.7}
                onPress={() => setIsSheetVisible(true)}
              >
                <Text style={styles.headerDropdownText} numberOfLines={1}>
                  {currentTitle}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color="#7B2CBF"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            ) : (
              <Text style={styles.emptyHeaderTitle} numberOfLines={1}>
                {t("exam_results")}
              </Text>
            )}
          </View>

          {/* Empty placeholder on the right to keep the center dropdown balanced without 3-dots */}
          <View style={styles.headerSideButton} />
        </View>
      );
    };

    const handleSelectSession = useCallback(
      (session: ExamSessionResponse) => {
        const currentId =
          selectedSession?.studentExamSessionId;
        const nextId = session.studentExamSessionId;
        if (currentId === nextId) return;

        setLoading(true);
        setSelectedSession(session);
      },
      [selectedSession, setLoading]
    );

    if (!isReady || (isMultiSessionMode && sessions === null)) {
      return <Loading />;
    }

    if (isMultiSessionMode && sessions !== null && sessions.length === 0) {
      return (
        <View style={styles.container}>
          {renderCustomHeader()}
          <View style={styles.centerLoading}>
            <Text style={{ color: '#8D99AE', fontSize: 16 }}>{t("no_exams_found")}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <WrappedComponent
          {...props}
          examCode={activeExamCode}
          studentExamSessionId={activeStudentExamSessionId}
          examSessionId={activeExamSessionId}
          onClose={handleBack}
          customHeader={
            isMultiSessionMode ? renderCustomHeader() : undefined
          }
        />

        {isMultiSessionMode && (
          <StudentExamSessionPicker
            isVisible={isSheetVisible}
            onClose={() => setIsSheetVisible(false)}
            sessions={sessions || []}
            selectedStudentExamSessionId={
              selectedSession?.studentExamSessionId
            }
            onSelectSession={handleSelectSession}
            onLoadMore={handleLoadMore}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
        )}
      </View>
    );
  };

  ComponentWithMultiSession.displayName = `withMultiStudentSessionExamResult(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return ComponentWithMultiSession;
};

export const withMultiStudentExamSessionResult = withMultiStudentSessionExamResult;
export default withMultiStudentSessionExamResult;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSideButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerDropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    borderColor: "#D8B4FE",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    maxWidth: 220,
  },
  headerDropdownText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#581C87",
  },
  emptyHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
});
