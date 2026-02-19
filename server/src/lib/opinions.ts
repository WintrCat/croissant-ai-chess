import dotenv from "dotenv";
import { OpenAI } from "openai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Chess, Square } from "chessops";

import { LocatedPiece } from "@/types/LocatedPiece";
import { Opinion } from "@/types/Opinion";
import { getPieceVoice } from "@/constants/llm-voices";
import { pieceLabel, buildPrompt } from "./prompt";
import { SAN_REGEX, ttsMoveNotation } from "./audio";

dotenv.config({ path: "../.env", quiet: true });

interface OpinionOptions {
    position: Chess;
    square: Square
    model: string;
    previousOpinions?: Opinion[];
    moveSan?: string;
}

const openaiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

const ttsClient = new ElevenLabsClient({
    apiKey: process.env.TTS_API_KEY
});

export async function getOpinion({
    position,
    model,
    square,
    previousOpinions = [],
    moveSan
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
                moveSan: moveSan
            })
        }]
    });

    const message = llmResponse.choices.at(0)?.message.content;
    if (!message) return;

    let ttsMessage = message;

    // replace all SANs (except ones that are synonymous with squares)
    // with TTS-pronouncable versions
    const sanMatches = ttsMessage.matchAll(new RegExp(SAN_REGEX, "g"))
        .filter(move => move[0].length > 2)
        .toArray();

    for (const sanMatch of sanMatches) {
        ttsMessage = ttsMessage.replace(
            sanMatch[0], ttsMoveNotation(sanMatch[0])
        );
    }

    // extract all [emotional instructions]
    const instructionMatches = ttsMessage.matchAll(/\[.+?\]/g)
        .map(match => match[0]).toArray();

    for (const instructionMatch of instructionMatches) {
        ttsMessage = ttsMessage.replace(instructionMatch, "");
    }

    // prompt the TTS and get audio
    const pieceVoice = getPieceVoice(model, selectedPiece);
    console.log(
        `attempting to generate speech for ${model}` 
        + ` with voice ${pieceVoice}...`
    );

    const speech = await ttsClient.textToSpeech.convert(pieceVoice, {
        text: ttsMessage,
        modelId: "eleven_turbo_v2_5",
        outputFormat: "wav_24000",
        nextText: instructionMatches.join(" ")
    });

    const chunks: Uint8Array[] = [];
    for await (const byte of speech) {
        chunks.push(byte);
    }

    const audio = Buffer.concat(chunks).toString("base64");

    // collect in list of stuff
    return {
        ...selectedPiece,
        message: message,
        audio: `data:audio/wav;base64,${audio}`
    };
}