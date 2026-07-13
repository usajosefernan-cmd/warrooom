import { NextResponse } from "next/server";

export async function GET() {
  const openRouter = !!process.env.OPENROUTER_API_KEY;
  const anthropic = !!process.env.ANTHROPIC_API_KEY;
  const gemini = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;

  const defaultProvider = process.env.AI_DEFAULT_PROVIDER || (gemini ? "gemini" : openRouter ? "openrouter" : anthropic ? "anthropic" : "mock");

  return NextResponse.json({
    providers: {
      openrouter: {
        active: openRouter,
        model: process.env.AI_MODEL_FAST || "google/gemma-2-9b-it:free (default)"
      },
      anthropic: {
        active: anthropic,
        model: "claude-3-5-haiku-20241022"
      },
      gemini: {
        active: gemini,
        model: process.env.AI_MODEL_FAST || "gemini-2.5-flash"
      },
      mock: {
        active: true,
        model: "mock-logic-v1"
      }
    },
    defaultProvider
  });
}
