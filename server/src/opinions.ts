import { json, Router } from "express";
import { StatusCodes } from "http-status-codes";
import { Chess, ROLES } from "chessops";
import { parseFen } from "chessops/fen";
import z from "zod";

import { pickPieces } from "./lib/pick-pieces";

const router = Router();
const path = "/api/opinions";

const requestSchema = z.object({
    position: z.string(),
    move: z.object({
        from: z.int(),
        to: z.int(),
        promotion: z.enum(ROLES).optional()
    })
});

router.use(path, json());

router.post(path, async (req, res) => {
    const body = requestSchema.safeParse(req.body).data;
    if (!body) return res.status(StatusCodes.BAD_REQUEST).end();

    const position = Chess.fromSetup(
        parseFen(body.position).unwrap()
    ).unwrap();

    const pieces = pickPieces(position);

    
});

export default router;