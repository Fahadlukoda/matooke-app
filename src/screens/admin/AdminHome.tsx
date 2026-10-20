import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Calendar,
  Users,
  Trophy,
  Megaphone,
  ChevronRight,
  UserCog,
  Tag,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { ScreenHeader } from "@/components/ScreenHeader";
import { StatGrid } from "@/components/StatGrid";
import { useAdminCounts } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminHome">;

export function AdminHome({ navigation }: Props) {
  const countsQuery = useAdminCounts();
  const profileQuery = useProfile();
  const counts = countsQuery.data;
  const isAdmin = profileQuery.data?.role === "admin";
  const title = isAdmin ? "Admin tools" : "Captain tools";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text variant="caption" color={theme.semantic.text.secondary}>
            At a glance
          </Text>
          <View style={styles.gapSm} />
          {countsQuery.isLoading || !counts ? (
            <View style={styles.countsLoading}>
              <ActivityIndicator color={theme.fills.matooke[500]} />
            </View>
          ) : (
            <StatGrid
              columns={2}
              cells={[
                {
                  label: "Upcoming events",
                  value: String(counts.upcomingEvents),
                },
                {
                  label: "Pending registrations",
                  value: String(counts.pendingRegistrations),
                },
                {
                  label: "Unpublished results",
                  value: String(counts.unpublishedResults),
                },
                { label: "Members", value: String(counts.totalMembers) },
              ]}
            />
          )}
        </Card>

        <Text
          variant="caption"
          color={theme.semantic.text.secondary}
          style={styles.sectionLabel}
        >
          Create
        </Text>
        <Card padding={0}>
          <Row
            icon={
              <Calendar
                size={20}
                color={theme.textColors.matooke[700]}
                strokeWidth={2}
              />
            }
            label="New event"
            onPress={() => navigation.navigate("CreateEvent")}
          />
          <Divider inset={theme.spacing.lg} />
          <Row
            icon={
              <Megaphone
                size={20}
                color={theme.textColors.matooke[700]}
                strokeWidth={2}
              />
            }
            label="New announcement"
            onPress={() => navigation.navigate("NewAnnouncement")}
          />
          <Divider inset={theme.spacing.lg} />
          <Row
            icon={
              <Tag
                size={20}
                color={theme.textColors.matooke[700]}
                strokeWidth={2}
              />
            }
            label="New ad"
            onPress={() => navigation.navigate("NewAd")}
          />
        </Card>

        <Text
          variant="caption"
          color={theme.semantic.text.secondary}
          style={styles.sectionLabel}
        >
          Manage
        </Text>
        <Card padding={0}>
          {isAdmin ? (
            <>
              <Row
                icon={
                  <UserCog
                    size={20}
                    color={theme.textColors.matooke[700]}
                    strokeWidth={2}
                  />
                }
                label="Manage members"
                onPress={() => navigation.navigate("ManageMembers")}
              />
              <Divider inset={theme.spacing.lg} />
            </>
          ) : null}
          <Row
            icon={
              <Users
                size={20}
                color={theme.textColors.matooke[700]}
                strokeWidth={2}
              />
            }
            label="Manage registrations"
            onPress={() => navigation.navigate("ManageRegistrations")}
          />
          <Divider inset={theme.spacing.lg} />
          <Row
            icon={
              <Trophy
                size={20}
                color={theme.textColors.matooke[700]}
                strokeWidth={2}
              />
            }
            label="Upload results"
            onPress={() => navigation.navigate("UploadResults")}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text variant="bodyM" style={styles.rowLabel}>
        {label}
      </Text>
      <ChevronRight
        size={20}
        color={theme.textColors.ink[300]}
        strokeWidth={2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: 120 },
  gapSm: { height: theme.spacing.sm },
  sectionLabel: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  countsLoading: {
    paddingVertical: theme.spacing["2xl"],
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },
  rowIcon: { width: 20, alignItems: "center" },
  rowLabel: { flex: 1, marginLeft: theme.spacing.md },
});
