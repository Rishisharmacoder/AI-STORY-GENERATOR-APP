import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoryPart {
  paragraph: string;
  promptToImage: string;
}

export interface StoryResponse {
  title: string;
  paragraphs: StoryPart[];
}

export interface SavedStory extends StoryResponse {
  id: string;
  createdAt: number;
  prompt: string;
}

const MAX_STORIES = 50;
const STORIES_KEY = "@ai_story_generator:stories";

export const saveStory = async (story: StoryResponse, prompt: string) => {
  try {
    const savedStory = {
      ...story,
      id: Date.now().toString(),
      createdAt: Date.now(),
      prompt: prompt,
    };
    const existingStories = await getStories();
    const updatedStories = [savedStory, ...existingStories].slice(
      0,
      MAX_STORIES,
    );

    await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));

    return savedStory;
  } catch (error) {
    throw error;
  }
};

export const getStories = async (): Promise<SavedStory[]> => {
  try {
    const data = await AsyncStorage.getItem(STORIES_KEY);
    if (!data) return [];

    return JSON.parse(data) as SavedStory[];
  } catch (error) {
    return [];
  }
};

export const getStory = async (id: string): Promise<SavedStory | null> => {
  try {
    const stories = await getStories();
    return stories.find((s) => s.id === id) || null;
  } catch (error) {
    return null;
  }
};

export const deleteStory = async (id: string) => {
  try {
    const stories = await getStories();
    const updatedStories = stories.filter((s) => s.id !== id);
    await AsyncStorage.setItem(STORIES_KEY, JSON.stringify(updatedStories));
  } catch (error) {
    throw error;
  }
};

export const clearStories = async () => {
  try {
    await AsyncStorage.removeItem(STORIES_KEY);
  } catch (error) {
    throw error;
  }
};
