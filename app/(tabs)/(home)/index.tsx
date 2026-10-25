import { Link, Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { AdBanner } from "@/src/features/ads/ad-banner";
import { useAllItems } from "@/src/features/items/queries";
import { ListRow } from "@/src/ui/list-row";
import { DURATION } from "@/src/ui/motion";
import { Screen } from "@/src/ui/screen";
import { StartHere } from "@/src/ui/start-here";
import { EmptyState, ErrorState, LoadingState } from "@/src/ui/state-views";

function RowSeparator() {
  return (
    <View className="bg-surface-card">
      <View className="ml-4 h-px bg-border-hairline" />
    </View>
  );
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, error } = useAllItems();

  return (
    <Screen scroll={false}>
      {/* Native header item — iOS 26 renders it as a liquid-glass button. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="plus"
          accessibilityLabel={t("home.new")}
          onPress={() => router.push("/items/new")}
        />
      </Stack.Toolbar>
      {error ? (
        <ErrorState />
      ) : isLoading ? (
        <LoadingState />
      ) : (
        <Animated.FlatList
          data={data}
          // Rows slide into place when one is added/deleted instead of jumping.
          itemLayoutAnimation={LinearTransition.duration(DURATION.layout)}
          keyExtractor={(item) => String(item.id)}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="p-4"
          // PLACEHOLDER: <StartHere /> is create-mt-app's "get started" screen (dev
          // builds only). When you build Home, delete it + src/ui/start-here.tsx
          // and keep EmptyState as the real empty state.
          ListEmptyComponent={__DEV__ ? <StartHere /> : <EmptyState message={t("home.empty")} />}
          // Same inset-grouped look as ListSection: one rounded card, inset hairlines.
          ItemSeparatorComponent={RowSeparator}
          renderItem={({ item, index }) => (
            <View
              className={`overflow-hidden bg-surface-card ${index === 0 ? "rounded-t-2xl" : ""} ${
                index === (data?.length ?? 0) - 1 ? "rounded-b-2xl" : ""
              }`}
            >
              <Link href={{ pathname: "/items/[id]", params: { id: String(item.id) } }} asChild>
                <ListRow title={item.title} subtitle={item.notes ?? undefined} onPress={() => {}} />
              </Link>
            </View>
          )}
        />
      )}
      <AdBanner />
    </Screen>
  );
}
