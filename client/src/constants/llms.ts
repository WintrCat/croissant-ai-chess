import { Board, makeSquare, SquareName } from "chessops";
import { shuffle } from "es-toolkit";

export const LLMS = {
    "openai/gpt-5.2": {
        logo: "llms/chatgpt.svg",
        name: "GPT-5.2"
    },
    "openai/gpt-4o": {
        logo: "llms/chatgpt.svg",
        name: "GPT-4o"
    },
    "anthropic/claude-sonnet-4.5": {
        logo: "llms/claude.svg",
        name: "Claude Sonnet 4.5"
    },
    "anthropic/claude-haiku-4.5": {
        logo: "llms/claude.svg",
        name: "Claude Haiku 4.5"
    },
    "deepseek/deepseek-v3.2": {
        logo: "llms/deepseek.svg",
        name: "DeepSeek v3.2"
    },
    "deepseek/deepseek-r1-0528": {
        logo: "llms/deepseek.svg",
        name: "DeepSeek R1"
    },
    "google/gemini-3-flash-preview": {
        logo: "llms/gemini.svg",
        name: "Gemini 3 Flash"
    },
    "google/gemini-3-pro-preview": {
        logo: "llms/gemini.svg",
        name: "Gemini 3 Pro"
    },
    "moonshotai/kimi-k2.5": {
        logo: "llms/kimi.svg",
        name: "Kimi K2.5"
    },
    "meta-llama/llama-4-maverick": {
        logo: "llms/llama.svg",
        name: "Llama 4 Maverick"
    },
    "qwen/qwen3-32b": {
        logo: "llms/qwen.svg",
        name: "Qwen 3"
    },
    "x-ai/grok-4": {
        logo: "llms/grok.svg",
        name: "Grok 4"
    },
    "z-ai/glm-4.7": {
        logo: "llms/glm.svg",
        name: "GLM 4.7"
    },
    "mistralai/ministral-14b-2512": {
        logo: "llms/mistral.svg",
        name: "Ministral"
    },
    "minimax/minimax-m2.1": {
        logo: "llms/minimax.svg",
        name: "MiniMax M2.1"
    },
    "nvidia/nemotron-3-nano-30b-a3b": {
        logo: "llms/nemotron.svg",
        name: "Nemotron 3 Nano"
    }
};

export const LLM_MODELS = Object.keys(LLMS) as (keyof typeof LLMS)[];

export type ControlledPieces = Partial<
    Record<SquareName, keyof typeof LLMS>
>;

export function generateDefaultPieces(): ControlledPieces {
    const models = shuffle(LLM_MODELS);

    const entries = [...Board.default().occupied]
        .map((square, index) => [
            makeSquare(square),
            models[index % models.length]
        ]);

    return Object.fromEntries(entries);
}