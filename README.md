# AI Story Generator

A mobile-first story generator built with Expo, React Native, Expo Router, and OpenRouter. Enter a story idea or choose an example prompt to generate a story, read it in the app, and revisit saved stories.

## Requirements

- Bun (the repository includes `bun.lock`)
- An OpenRouter API key with access to the configured model
- Expo-compatible Android or iOS device/emulator, or a browser for the web app

## Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create a `.env` file in the project root and add your OpenRouter key:

   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

   Keep this key private. Do not use an `EXPO_PUBLIC_` prefix or commit the `.env` file.

3. Start the Expo development server:

   ```bash
   bunx expo start
   ```

   Open the app on a device or emulator using the options printed by Expo CLI.

## Using the app

1. Enter a story idea, or tap one of the example prompts.
2. Tap **Generate Story** and wait for generation to finish.
3. Read the generated story. It is saved locally on the device.
4. Return to the home screen to open the latest saved story with **Go to Story**, or select a story from **Your Stories**.

## Project structure

```text
src/
  app/
    _layout.tsx          Expo Router stack and app-wide status bar
    index.tsx            Prompt input, generation, and saved story list
    story.tsx            Saved story reader
    api/
      generate+api.ts    Server endpoint that calls OpenRouter
  constant/
    index.ts             Example prompts
    theme.ts             App colors and theme
  lib/
    storage.ts           AsyncStorage helpers for saved stories
```

## Story generation and deployment

The `/api/generate` Expo Router API route calls OpenRouter using `OPENROUTER_API_KEY` and the `openai/gpt-4o-mini` model. The model returns a structured story with a title and paragraphs; the app stores the result using AsyncStorage.

API routes run on a server, not inside the native Android or iOS app. They work with the Expo development server during development, but production requires deploying the API route to a server environment that supports Expo Router API routes. Configure the OpenRouter key as a server-side environment variable on that deployment. Do not bundle the key into a native app.

## Useful commands

```bash
bunx expo start                 # Start the development server
bunx expo start --android       # Start and open Android
bunx expo start --ios           # Start and open iOS
bunx expo start --web           # Start the web app
bunx expo lint                  # Run ESLint
bunx tsc --noEmit               # Type-check TypeScript
bunx expo install --check       # Check Expo package compatibility
```
