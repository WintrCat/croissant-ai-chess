import { json, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Chess, makeSquare, ROLES } from "chessops";
import { parseFen } from "chessops/fen";
import z from "zod";

import { Opinion } from "./types/Opinion";
import { pickPieces } from "./lib/pick-pieces";
import { getOpinion } from "./lib/opinions";

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

router.use(path, json());

router.post(path, async (req, res) => {
    const body = requestSchema.safeParse(req.body).data;
    if (!body) return res.status(StatusCodes.BAD_REQUEST).end();

    const position = Chess.fromSetup(
        parseFen(body.position).unwrap()
    ).unwrap();

    if (body.move) {
        const piece = position.board.get(body.move.to);
        const model = body.pieces[makeSquare(body.move.to)];

        if (!piece || !model) return res.status(
            StatusCodes.INTERNAL_SERVER_ERROR
        ).end();

        const moveOpinion = await getOpinion({
            position: position,
            model: model,
            square: body.move.to
        });

        return moveOpinion
            ? res.send([moveOpinion])
            : res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();
    }

    const selectedPieces = pickPieces(position,
        Number(process.env.PIECE_PICK_COUNT) || 1
    );

    const opinions: Opinion[] = [];

    for (const selectedPiece of selectedPieces) {
        // find corresponding LLM
        const model = body.pieces[makeSquare(selectedPiece.square)];
        if (!model) continue;

        const opinion = await getOpinion({
            position: position,
            model: model,
            square: selectedPiece.square,
            previousOpinions: opinions
        });

        if (opinion) opinions.push(opinion);
    }

    res.send(opinions);
});

export default router;