import dotenv from "dotenv";
import { OpenAI } from "openai";
import { GoogleGenAI } from "@google/genai";
import { Chess, NormalMove, Square } from "chessops";

import { LocatedPiece } from "@/types/LocatedPiece";
import { Opinion } from "@/types/Opinion";
import { pieceLabel, buildPrompt } from "./prompt";
import { pcmToWavDataURL } from "./audio";

dotenv.config({ path: "../.env", quiet: true });

interface OpinionOptions {
    position: Chess;
    square: Square
    model: string;
    previousOpinions?: Opinion[];
    move?: NormalMove;
}

const openaiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

const googleClient = new GoogleGenAI({
    apiKey: process.env.TTS_API_KEY
});

export async function getOpinion({
    position,
    model,
    square,
    previousOpinions = [],
    move
}: OpinionOptions) {
    const piece = position.board.get(square);
    if (!piece) return;

    const selectedPiece: LocatedPiece = { ...piece, square };

    // prompt LLM and get response
    console.log(
        `attempting to prompt ${model} for `
        + `${pieceLabel(selectedPiece)}...`
    );

    const llmResponse = await openaiClient.chat.completions.create({
        model: model,
        messages: [{
            role: "user",
            content: buildPrompt({
                position: position,
                piece: selectedPiece,
                context: previousOpinions,
                move: move
            })
        }]
    });

    const message = llmResponse.choices.at(0)?.message.content;
    if (!message) return;

    // prompt the TTS and get audio
    console.log(`attempting to generate speech for ${model}...`);

    const speech = await googleClient.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ text: message }],
        config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: "Kore" }
                }
            }
        }
    });

    const audio = speech.candidates?.at(0)?.content
        ?.parts?.at(0)?.inlineData?.data;
    if (!audio) return;

    // collect in list of stuff
    return {
        ...selectedPiece,
        message: message,
        audio: pcmToWavDataURL(Buffer.from(audio, "base64"))
    };
}