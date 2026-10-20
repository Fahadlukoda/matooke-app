import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Pause as PauseIcon,
  Play,
  Square,
  Crosshair,
  Trash2,
  Flame,
} from "lucide-react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { LiveRouteMap } from "@/components/LiveRouteMap";
import {
  useRun,
  formatDuration,
  formatPace,
  formatDistanceKm,
} from "@/hooks/useRun";
import { useRunStore } from "@/lib/run-store";
import { computeCaloriesEstimate } from "@/lib/run-tracker";
import type { RunStackParamList } from "@/navigation/RunStack";

type Props = NativeStackScreenProps<RunStackParamList, "RunLive">;

const AnimatedText = Animated.createAnimatedComponent(Text as any);

export function RunLive({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { eventId } = route.params;
  const {
    status,
    derived,
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    discardRun,
  } = useRun();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [follow, setFollow] = useState(true);
  const [calories, setCalories] = useState(0);
  const previousStatus = useRef(status);
  const sheetHeight = useSharedValue(
    windowHeight * (status === "paused" ? 0.7 : 0.3),
  );

  const routeSnapshot = useRunStore((s) => s.snapshot.route);

  const updateCalories = useCallback(
    (distanceM: number, durationMs: number) => {
      setCalories(computeCaloriesEstimate(distanceM, durationMs));
    },
    [],
  );

  useEffect(() => {
    if (status === "idle" && !bootstrapped) {
      setBootstrapped(true);
      startRun(eventId);
    }
  }, [status, bootstrapped, startRun, eventId]);

  useEffect(() => {
    if (status === "finished") {
      navigation.replace("RunSummary");
    } else if (status === "idle" && previousStatus.current !== "idle") {
      navigation.popToTop();
    }
    previousStatus.current = status;
  }, [status, navigation]);

  useEffect(() => {
    sheetHeight.value = withTiming(
      windowHeight * (status === "paused" ? 0.7 : 0.3),
      {
        duration: 300,
        easing: Easing.inOut(Easing.cubic),
      },
    );
  }, [status, windowHeight, sheetHeight]);

  const sheetStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    bottom: sheetHeight.value,
  }));

  const elapsedProps = useAnimatedProps(() => ({
    children: formatDuration(derived.elapsedMsShared.value),
  }));

  const paceProps = useAnimatedProps(() => ({
    children: formatPace(derived.currentPaceShared.value),
  }));

  const avgProps = useAnimatedProps(() => ({
    children: `AVG ${formatPace(derived.avgPaceShared.value)}`,
  }));

  const pausedAvgProps = useAnimatedProps(() => ({
    children: formatPace(derived.avgPaceShared.value),
  }));

  const distanceProps = useAnimatedProps(() => ({
    children: formatDistanceKm(derived.distanceMShared.value),
  }));

  const stepsProps = useAnimatedProps(() => ({
    children: derived.stepsShared.value.toString(),
  }));

  const caloriesProps = useAnimatedProps(() => ({
    children: calories.toString(),
  }));

  useAnimatedReaction(
    () => ({
      distanceM: derived.distanceMShared.value,
      durationMs: derived.elapsedMsShared.value,
    }),
    ({ distanceM, durationMs }) => {
      runOnJS(updateCalories)(distanceM, durationMs);
    },
    [updateCalories],
  );

  const paused = status === "paused";

  return (
    <View style={styles.root}>
      <LiveRouteMap
        route={routeSnapshot}
        followUser={follow}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView
        style={styles.mapOverlay}
        edges={["top"]}
        pointerEvents="box-none"
      >
        <View style={styles.mapTopBar} pointerEvents="box-none">
          <Pressable
            onPress={() => setFollow((f) => !f)}
            accessibilityRole="button"
            accessibilityLabel="Recenter map"
            style={styles.recenterBtn}
            hitSlop={8}
          >
            <Crosshair
              size={20}
              color={theme.textColors.ink[900]}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <Animated.View
        pointerEvents="none"
        style={[styles.shadowBand, shadowStyle]}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.10)"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View style={[styles.panel, sheetStyle]}>
        <View
          style={[
            styles.panelContent,
            { paddingBottom: insets.bottom + theme.spacing.xs },
          ]}
        >
          <View style={styles.grabber} />

          {paused ? (
            <>
              <Text variant="displayL" style={styles.pausedTitle}>
                PAUSED
              </Text>
              <View style={styles.pausedStats}>
                <View style={styles.pausedStatRow}>
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Time
                  </Text>
                  <AnimatedText
                    variant="displayM"
                    tabular
                    animatedProps={elapsedProps}
                  >
                    00:00
                  </AnimatedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.pausedStatRow}>
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Distance
                  </Text>
                  <View style={styles.statValueRow}>
                    <AnimatedText
                      variant="displayM"
                      tabular
                      animatedProps={distanceProps}
                    >
                      0.00
                    </AnimatedText>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      tabular
                    >
                      km
                    </Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.pausedStatRow}>
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Avg pace
                  </Text>
                  <AnimatedText
                    variant="displayM"
                    tabular
                    animatedProps={pausedAvgProps}
                  >
                    —:—
                  </AnimatedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.pausedStatRow}>
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Steps
                  </Text>
                  <AnimatedText
                    variant="displayM"
                    tabular
                    animatedProps={stepsProps}
                  >
                    0
                  </AnimatedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.pausedStatRow}>
                  <View style={styles.caloriesLabel}>
                    <Flame size={14} color={theme.fills.clay[500]} />
                    <Text
                      variant="caption"
                      color={theme.semantic.text.secondary}
                    >
                      Calories
                    </Text>
                  </View>
                  <View style={styles.calorieValue}>
                    <AnimatedText
                      variant="displayM"
                      tabular
                      animatedProps={caloriesProps}
                    >
                      0
                    </AnimatedText>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      tabular
                    >
                      kcal
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.paceBlock}>
                <Text variant="caption" color={theme.semantic.text.secondary}>
                  Current pace
                </Text>
                <View style={styles.paceValueRow}>
                  <AnimatedText
                    variant="displayXL"
                    tabular
                    animatedProps={paceProps}
                    style={styles.paceValue}
                  >
                    {formatPace(0)}
                  </AnimatedText>
                  <Text
                    variant="bodyS"
                    color={theme.semantic.text.secondary}
                    tabular
                  >
                    per km
                  </Text>
                  <AnimatedText
                    variant="bodyS"
                    color={theme.semantic.text.secondary}
                    tabular
                    animatedProps={avgProps}
                    style={styles.avgPace}
                  >
                    AVG —:—
                  </AnimatedText>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCell}>
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Time
                  </Text>
                  <AnimatedText
                    variant="displayM"
                    tabular
                    animatedProps={elapsedProps}
                    style={styles.statValue}
                  >
                    00:00
                  </AnimatedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Distance
                  </Text>
                  <View style={styles.statValueRow}>
                    <AnimatedText
                      variant="displayM"
                      tabular
                      animatedProps={distanceProps}
                    >
                      0.00
                    </AnimatedText>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      tabular
                    >
                      km
                    </Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <View style={styles.caloriesLabel}>
                    <Flame size={14} color={theme.fills.clay[500]} />
                    <Text
                      variant="caption"
                      color={theme.semantic.text.secondary}
                    >
                      Calories
                    </Text>
                  </View>
                  <View style={styles.calorieValue}>
                    <AnimatedText
                      variant="displayM"
                      tabular
                      animatedProps={caloriesProps}
                      style={styles.statValue}
                    >
                      0
                    </AnimatedText>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      tabular
                    >
                      kcal
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}

          <View style={paused ? styles.pausedActions : styles.runningActions}>
            <Button
              label={paused ? "Resume" : "Pause"}
              onPress={
                paused
                  ? () => {
                      void resumeRun();
                    }
                  : pauseRun
              }
              variant={paused ? "gold" : "hero"}
              size="md"
              leadingIcon={
                paused ? (
                  <Play
                    size={16}
                    color={theme.textColors.ink[900]}
                    strokeWidth={2.5}
                  />
                ) : (
                  <PauseIcon
                    size={18}
                    color={theme.textColors.paper}
                    strokeWidth={2.5}
                  />
                )
              }
              style={styles.primaryAction}
            />
            <Button
              label="Finish"
              onPress={finishRun}
              variant="secondary"
              size="md"
              leadingIcon={
                <Square
                  size={16}
                  color={theme.textColors.ink[900]}
                  strokeWidth={2.5}
                  fill={theme.textColors.ink[900]}
                />
              }
              style={styles.finishAction}
            />
          </View>

          {paused ? (
            <Button
              label="Discard"
              onPress={discardRun}
              variant="ghost"
              size="sm"
              leadingIcon={
                <Trash2
                  size={14}
                  color={theme.textColors.clay[500]}
                  strokeWidth={2}
                />
              }
              style={styles.discardAction}
            />
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  mapTopBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: theme.spacing.md,
  },
  recenterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.fills.paper,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 4 },
    }),
  },
  shadowBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 24,
  },
  panel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.semantic.bg.page,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.fills.ink[300],
    alignSelf: "center",
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  paceBlock: { marginBottom: theme.spacing.xs },
  paceValue: { marginTop: 0, fontSize: 32, lineHeight: 36 },
  paceValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing.xs,
  },
  avgPace: {
    marginLeft: "auto",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.fills.matooke[100],
    borderRadius: theme.radii.card,
    paddingVertical: theme.spacing.xs,
  },
  statCell: { flex: 1, alignItems: "center" },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: theme.fills.matooke[200],
  },
  statValue: { marginTop: theme.spacing.xxs },
  statValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  caloriesLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  calorieValue: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  pausedTitle: {
    fontSize: 22,
    lineHeight: 26,
    marginBottom: theme.spacing.xs,
  },
  pausedStats: {
    backgroundColor: theme.fills.matooke[100],
    borderRadius: theme.radii.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  pausedStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 32,
  },
  runningActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  pausedActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  primaryAction: { flex: 1 },
  finishAction: { width: 120 },
  discardAction: {
    alignSelf: "center",
    marginTop: theme.spacing.xxs,
  },
});
