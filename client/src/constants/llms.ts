import { Board, makeSquare, SquareName } from "chessops";

export const LLM_LOGOS = {
    "openai/gpt-5.2": "llms/chatgpt.svg",
    "openai/gpt-4o": "llms/chatgpt.svg",
    "anthropic/claude-sonnet-4.5": "llms/claude.svg",
    "anthropic/claude-haiku-4.5": "llms/claude.svg",
    "deepseek/deepseek-v3.2": "llms/deepseek.svg",
    "deepseek/deepseek-r1-0528": "llms/deepseek.svg",
    "google/gemini-3-flash-preview": "llms/gemini.svg",
    "google/gemini-3-pro-preview": "llms/gemini.svg",
    "moonshotai/kimi-k2.5": "llms/kimi.svg",
    "meta-llama/llama-4-maverick": "llms/llama.svg",
    "qwen/qwen3-4b:free": "llms/qwen.svg",
    "baidu/ernie-4.5-21b-a3b": "llms/ernie.svg",
    "z-ai/glm-4.7": "llms/glm.svg",
    "mistralai/ministral-14b-2512": "llms/mistral.svg",
    "minimax/minimax-m2.1": "llms/minimax.svg",
    "nvidia/nemotron-3-nano-30b-a3b": "llms/nemotron.svg"
};

export const LLM_MODELS = Object.keys(LLM_LOGOS) as (keyof typeof LLM_LOGOS)[];

export type ControlledPieces = Partial<
    Record<SquareName, keyof typeof LLM_LOGOS>
>;

export const DEFAULT_PIECES: ControlledPieces = Object.fromEntries(
    [...Board.default().occupied].map((square, index) => [
        makeSquare(square),
        LLM_MODELS[index % LLM_MODELS.length]
    ])
);