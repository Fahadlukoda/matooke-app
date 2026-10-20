import React, { useMemo, useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { TextField } from "@/components/TextField";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useUpdateMemberRole } from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "ManageMembers">;

type Member = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  city: string | null;
  role: "member" | "captain" | "admin";
  level: string | null;
};

type RoleFilter = "all" | "member" | "captain" | "admin";

async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, city, role, level")
    .is("deleted_at", null)
    .order("full_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Member[];
}

export function ManageMembers({ navigation }: Props) {
  const membersQuery = useQuery({
    queryKey: ["admin", "members"],
    queryFn: fetchMembers,
    staleTime: 1000 * 60,
  });

  const updateRole = useUpdateMemberRole();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  const members = membersQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members.filter((m) => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (q && !m.full_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [members, search, roleFilter]);

  function confirmAsync(title: string, message: string): Promise<boolean> {
    if (Platform.OS === "web") {
      return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }
    return new Promise((resolve) => {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Confirm", style: "destructive", onPress: () => resolve(true) },
      ]);
    });
  }

  async function changeRole(m: Member, role: "member" | "captain" | "admin") {
    if (m.role === role) return;
    const verb =
      role === "admin"
        ? "Make this member an admin?"
        : role === "captain"
          ? "Make this member a captain?"
          : "Return this member to regular member?";
    const ok = await confirmAsync(verb, `${m.full_name}`);
    if (!ok) return;
    await updateRole.mutateAsync({ profileId: m.id, role });
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Manage members" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <TextField
            label="Search members"
            placeholder="Search by name"
            value={search}
            onChangeText={setSearch}
          />
          <View style={styles.chipRow}>
            {(["all", "member", "captain", "admin"] as RoleFilter[]).map(
              (r) => (
                <Chip
                  key={r}
                  label={
                    r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)
                  }
                  selected={roleFilter === r}
                  onPress={() => setRoleFilter(r)}
                />
              ),
            )}
          </View>
        </Card>

        {membersQuery.isLoading ? (
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            align="center"
            style={styles.status}
          >
            Loading…
          </Text>
        ) : membersQuery.isError ? (
          <Text
            variant="bodyS"
            color={theme.semantic.text.danger}
            align="center"
            style={styles.status}
          >
            Could not load members. Try again later.
          </Text>
        ) : filtered.length === 0 ? (
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            align="center"
            style={styles.status}
          >
            No members match this filter.
          </Text>
        ) : (
          <View style={styles.list}>
            {filtered.map((m) => (
              <Card key={m.id}>
                <View style={styles.memberHead}>
                  <Avatar
                    uri={m.avatar_url}
                    name={m.full_name}
                    size={40}
                    role={m.role}
                  />
                  <View style={styles.memberBody}>
                    <Text variant="bodyM" numberOfLines={1}>
                      {m.full_name}
                    </Text>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      numberOfLines={1}
                    >
                      {[m.city, m.level].filter(Boolean).join(" · ") || "—"}
                    </Text>
                  </View>
                  {m.role !== "member" ? (
                    <Badge
                      label={m.role === "admin" ? "Admin" : "Captain"}
                      variant="role"
                      size="sm"
                    />
                  ) : null}
                </View>

                <View style={styles.roleRow}>
                  <Chip
                    label="Member"
                    selected={m.role === "member"}
                    onPress={() => changeRole(m, "member")}
                    disabled={updateRole.isPending}
                  />
                  <Chip
                    label="Captain"
                    selected={m.role === "captain"}
                    onPress={() => changeRole(m, "captain")}
                    disabled={updateRole.isPending}
                  />
                  <Chip
                    label="Admin"
                    selected={m.role === "admin"}
                    onPress={() => changeRole(m, "admin")}
                    disabled={updateRole.isPending}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: 120 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  status: { marginTop: theme.spacing.lg },
  list: { gap: theme.spacing.md },
  memberHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },
  memberBody: { flex: 1 },
  roleRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
});
