import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors, Theme } from "@/constant/theme";
import { getStory, type SavedStory } from "@/lib/storage";

export default function Story() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [story, setStory] = useState<SavedStory | null>(null);
  const [loadedStoryId, setLoadedStoryId] = useState<string>();

  useEffect(() => {
    let active = true;

    if (!id) return;

    getStory(id)
      .then((savedStory) => {
        if (active) {
          setStory(savedStory);
          setLoadedStoryId(id);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load saved story:", error);
        if (active) {
          setStory(null);
          setLoadedStoryId(id);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (id && loadedStoryId !== id) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Theme.primary} size="large" />
        <Text style={styles.secondaryText}>Loading your story...</Text>
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No story to display</Text>
        <Text style={styles.secondaryText}>
          Generate a story first, then you can read it here.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={Theme.primary} size={20} />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color={Theme.primary} size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Your Story
        </Text>
        <View style={styles.headerButton} />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.prompt}>Inspired by: {story.prompt}</Text>
        {story.paragraphs.map((part, index) => (
          <View key={`${story.id}-${index}`} style={styles.partContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{part.paragraph}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.footer}>The End</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    backgroundColor: Theme.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: Theme.text,
    textAlign: "center",
    marginHorizontal: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.background,
    padding: 24,
    gap: 16,
  },
  emptyTitle: {
    color: Theme.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryText: {
    color: Theme.textSecondary,
    fontSize: 15,
    textAlign: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.zinc[900],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  backButtonText: {
    color: Theme.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    color: Theme.text,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  prompt: {
    color: Theme.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  partContainer: {
    marginBottom: 8,
  },
  textContainer: {
    padding: 20,
    backgroundColor: Colors.zinc[900],
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: Theme.primary,
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: "dotted",
  },
  text: {
    fontSize: 17,
    lineHeight: 28,
    color: Theme.text,
  },
  footer: {
    color: Theme.primary,
    fontSize: 28,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },
});
