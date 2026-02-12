import { json, Router } from "express";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { Chess, makeSquare, ROLES } from "chessops";
import { parseFen } from "chessops/fen";
import z from "zod";

import { Opinion } from "./types/Opinion";
import { pickPieces } from "./lib/pick-pieces";
import { buildPrompt, pieceLabel } from "./lib/prompt";

dotenv.config({ path: "../.env", quiet: true });

const router = Router();
const path = "/api/opinions";

const requestSchema = z.object({
    position: z.string(),
    move: z.object({
        from: z.int(),
        to: z.int(),
        promotion: z.enum(ROLES).optional()
    }).optional(),
    pieces: z.record(z.string(), z.string())
});

const openaiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY
});

router.use(path, json());

router.post(path, async (req, res) => {
    const body = requestSchema.safeParse(req.body).data;
    if (!body) return res.status(StatusCodes.BAD_REQUEST).end();

    const position = Chess.fromSetup(
        parseFen(body.position).unwrap()
    ).unwrap();

    const selectedPieces = pickPieces(position, 2);
    const opinions: Opinion[] = [];

    for (const selectedPiece of selectedPieces) {
        // find corresponding LLM
        const model = body.pieces[makeSquare(selectedPiece.square)];
        if (!model) continue;

        // prompt LLM and get response
        console.log(
            `attempting to prompt ${model} for `
            + `${pieceLabel(selectedPiece)}...`
        );

        const llmResponse = await openaiClient.chat.completions.create({
            model: model,
            messages: [{
                role: "user",
                content: buildPrompt(position, selectedPiece, opinions)
            }]
        });

        const message = llmResponse.choices.at(0)?.message.content;
        if (!message) continue;

        // prompt the TTS and get audio


        // collect in list of stuff
        opinions.push({
            ...selectedPiece,
            message: message,
            audio: ""
        });
    }

    res.send(opinions);
});

export default router;