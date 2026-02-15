import { LocatedPiece } from "@/types/LocatedPiece";

// https://docs.cloud.google.com/text-to-speech/docs/gemini-tts
export const LLM_VOICES: Record<string, string> = {
    "openai/gpt-5.2": "Puck",
    "openai/gpt-4o": "Charon",
    "anthropic/claude-sonnet-4.5": "Kore",
    "anthropic/claude-haiku-4.5": "Fenrir",
    "deepseek/deepseek-v3.2": "Orus",
    "deepseek/deepseek-r1-0528": "Aoede",
    "google/gemini-3-flash-preview": "Callirrhoe",
    "google/gemini-3-pro-preview": "Autonoe",
    "moonshotai/kimi-k2.5": "Umbriel",
    "meta-llama/llama-4-maverick": "Algieba",
    "qwen/qwen3-32b": "Despina",
    "x-ai/grok-4": "Erinome",
    "z-ai/glm-4.7": "Algenib",
    "mistralai/ministral-14b-2512": "Rasalgethi",
    "minimax/minimax-m2.1": "Laomedeia",
    "nvidia/nemotron-3-nano-30b-a3b": "Achernar"
};

export const LLM_ROYAL_VOICES = {
    white: {
        king: "Enceladus",
        queen: "Zephyr"
    },
    black: {
        king: "Iapetus",
        queen: "Leda"
    }
};

export function getPieceVoice(model: string, piece?: LocatedPiece) {
    if (piece?.role == "queen" || piece?.role == "king")
        return LLM_ROYAL_VOICES[piece.color][piece.role];

    return LLM_VOICES[model] || "Kore";
}