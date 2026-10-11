import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";

const paragraphSchema = z.object({
  paragraph: z
    .string()
    .describe("A single paragraph of the story (3-5 sentences)"),
  promptToImage: z
    .string()
    .describe(
      "A detailed visual description for generating an image that matches this paragraph",
    ),
});

const storySchema = z.object({
  title: z.string().describe("The title of the story"),
  paragraphs: z
    .array(paragraphSchema)
    .min(10)
    .describe(
      "Array of at least 10 paragraphs ,each with story text and image prompt",
    ),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const prompt =
      typeof body === "object" && body !== null && "prompt" in body
        ? body.prompt
        : null;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return Response.json(
        {
          error: "Enter a prompt before generating a story.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not configured.");
      return Response.json(
        { error: "Story generation is not configured on the server." },
        { status: 500 },
      );
    }

    const openrouter = createOpenRouter({ apiKey });
    const { output } = await generateText({
      model: openrouter("openai/gpt-4o-mini"),
      output: Output.object({
        schema: storySchema,
      }),
      system: `You are a creative storyteller. Generate a detailed, engaging story with at least 10 paragraphs. 
      
      For each paragraph:
      1. Write 3-5 compelling sentences that advance the story
      2. Create a detailed visual prompt for AI image generation (be specific about scene, characters, mood, colors, style)
      
      Make sure the story has a clear beginning, middle, and end. Each paragraph should flow naturally to the next.`,
      prompt: `Write a creative story based on: ${prompt.trim()}. The story must have at least 10 detailed paragraphs with corresponding image prompts for each paragraph.`,
      temperature: 0.7,
    });

    return Response.json(output);
  } catch (error) {
    console.error("Story generation failed:", error);
    return Response.json(
      { error: "Could not generate the story. Please try again." },
      { status: 500 },
    );
  }
}
