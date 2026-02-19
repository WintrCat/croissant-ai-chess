import { LocatedPiece } from "@/types/LocatedPiece";

// https://docs.cloud.google.com/text-to-speech/docs/gemini-tts
export const LLM_VOICES: Record<string, string> = {
    "openai/gpt-5.2": "DMyrgzQFny3JI1Y1paM5",
    "openai/gpt-4o": "EST9Ui6982FZPSi7gCHi",
    "anthropic/claude-sonnet-4.5": "4e32WqNVWRquDa1OcRYZ",
    "anthropic/claude-haiku-4.5": "7p1Ofvcwsv7UBPoFNcpI",
    "deepseek/deepseek-v3.2": "dtSEyYGNJqjrtBArPCVZ",
    "deepseek/deepseek-r1-0528": "kPzsL2i3teMYv0FxEYQ6",
    "google/gemini-3-flash-preview": "5l5f8iK3YPeGga21rQIX",
    "google/gemini-3-pro-preview": "rPMkKgdwgIwqv4fXgR6N",
    "moonshotai/kimi-k2.5": "1SM7GgM6IMuvQlz2BwM3",
    "meta-llama/llama-4-maverick": "WZlYpi1yf6zJhNWXih74",
    "qwen/qwen3-32b": "xctasy8XvGp2cVO9HL9k",
    "x-ai/grok-4": "s3TPKV1kjDlVtZbl4Ksh",
    "z-ai/glm-4.7": "WtA85syCrJwasGeHGH2p",
    "mistralai/ministral-14b-2512": "3TStB8f3X3To0Uj5R7RK",
    "minimax/minimax-m2.1": "hU1ratPhBTZNviWitzAh",
    "nvidia/nemotron-3-nano-30b-a3b": "Nhs7eitvQWFTQBsf0yiT"
};

export const LLM_ROYAL_VOICES = {
    white: {
        king: "DMyrgzQFny3JI1Y1paM5",
        queen: "ksryVoNAGZT8GxWCTiVm"
    },
    black: {
        king: "DMyrgzQFny3JI1Y1paM5",
        queen: "Qbw4VpyUrHEG7NigKzty"
    }
};

export function getPieceVoice(model: string, piece?: LocatedPiece) {
    if (piece?.role == "queen" || piece?.role == "king")
        return LLM_ROYAL_VOICES[piece.color][piece.role];

    return LLM_VOICES[model] || "DMyrgzQFny3JI1Y1paM5";
}