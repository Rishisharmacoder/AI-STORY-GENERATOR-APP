import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BookOpen, Sparkles, Wand2 } from "lucide-react-native";
import { EXAMPLE_PROMPTS } from "@/constant";
import { Colors, Theme } from "@/constant/theme";
import { useEffect, useState } from "react";
import {
  getStories,
  saveStory,
  type SavedStory,
  type StoryResponse,
} from "@/lib/storage";

export default function Index() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<SavedStory[]>([]);

  useEffect(() => {
    getStories().then(setStories);
  }, []);

  const handleGenerate = async () => {
    const storyPrompt = prompt.trim();
    if (!storyPrompt) {
      Alert.alert("Add a story idea", "Enter a prompt or choose an example first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: storyPrompt }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Could not generate the story. Please try again.";
        throw new Error(message);
      }

      if (!isStoryResponse(result)) {
        throw new Error("The server returned an invalid story. Please try again.");
      }

      const savedStory = await saveStory(result, storyPrompt);
      setStories((currentStories) => [
        savedStory,
        ...currentStories.filter((story) => story.id !== savedStory.id),
      ]);
      router.push({ pathname: "/story", params: { id: savedStory.id } });
    } catch (error) {
      Alert.alert(
        "Unable to generate story",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <BookOpen color={Theme.primary} size={32} />
            </View>
            <Text style={styles.title}>AI Story Generator</Text>
            <Text style={styles.subtitle}>
              Powered by OpenRouter • Create magical stories
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Describe your story idea... (e.g., A brave knight discovers a hidden portal to a magical realm)"
              placeholderTextColor={Theme.textSecondary}
              multiline
              numberOfLines={4}
              value={prompt}
              onChangeText={setPrompt}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGenerate}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <>
                <ActivityIndicator color={Colors.zinc[950]} />
                <Text style={styles.buttonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Wand2 color={Colors.zinc[950]} size={20} />
                <Text style={styles.buttonText}>Generate Story</Text>
                <Sparkles color={Colors.zinc[950]} size={20} />
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.goToStoryButton}
            onPress={() =>
              stories.length > 0
                ? router.push({
                    pathname: "/story",
                    params: { id: stories[0].id },
                  })
                : router.push("/story")
            }
            activeOpacity={0.8}
          >
            <BookOpen color={Theme.primary} size={20} />
            <Text style={styles.goToStoryButtonText}>Go to Story</Text>
          </TouchableOpacity>

          {EXAMPLE_PROMPTS.length > 0 && (
            <View style={styles.examplesContainer}>
              <Text style={styles.examplesTitle}>Example Prompts</Text>
              <View style={styles.examplesGrid}>
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleCard}
                    onPress={() => handleExamplePrompt(example)}
                    disabled={loading}
                  >
                    <Text style={styles.exampleText} numberOfLines={2}>
                      {example}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
        {stories.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Your Stories</Text>
            {stories.map((story) => (
              <TouchableOpacity
                key={story.id}
                style={styles.storyCard}
                onPress={() =>
                  router.push({ pathname: "/story", params: { id: story.id } })
                }
              >
                <Text style={styles.storyCardTitle}>{story.title}</Text>
                <Text style={styles.storyCardPrompt} numberOfLines={2}>
                  {story.prompt}
                </Text>
                <Text style={styles.storyCardDate}>
                  {new Date(story.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  content: {
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.zinc[900],
    borderWidth: 2,
    borderColor: Theme.primary,
    borderStyle: "dotted",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Theme.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Theme.textSecondary,
    textAlign: "center",
  },
  inputContainer: {
    backgroundColor: Colors.zinc[900],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Theme.border,
    borderStyle: "dotted",
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: Theme.text,
    minHeight: 120,
  },
  button: {
    backgroundColor: Theme.primary,
    paddingVertical: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  goToStoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.primary,
    backgroundColor: Colors.zinc[900],
  },
  goToStoryButtonText: {
    color: Theme.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.zinc[950],
  },
  examplesContainer: {
    gap: 12,
  },
  examplesTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.text,
  },
  examplesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  exampleCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.zinc[900],
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: "dotted",
  },
  exampleText: {
    fontSize: 13,
    color: Theme.textSecondary,
    lineHeight: 18,
  },
  historyContainer: {
    gap: 12,
    marginTop: 8,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.text,
  },
  storyCard: {
    backgroundColor: Colors.zinc[900],
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.border,
    borderStyle: "dotted",
  },
  storyCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Theme.text,
    marginBottom: 4,
  },
  storyCardPrompt: {
    fontSize: 13,
    color: Theme.textSecondary,
    marginBottom: 4,
  },
  storyCardDate: {
    fontSize: 11,
    color: Theme.textSecondary,
    opacity: 0.7,
  },
});

function isStoryResponse(value: unknown): value is StoryResponse {
  if (typeof value !== "object" || value === null || !("title" in value) || !("paragraphs" in value)) {
    return false;
  }

  return (
    typeof value.title === "string" &&
    Array.isArray(value.paragraphs) &&
    value.paragraphs.every(
      (part) =>
        typeof part === "object" &&
        part !== null &&
        "paragraph" in part &&
        "promptToImage" in part &&
        typeof part.paragraph === "string" &&
        typeof part.promptToImage === "string",
    )
  );
}
