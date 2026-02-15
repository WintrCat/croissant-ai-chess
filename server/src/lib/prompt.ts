import { Chess, makeSquare, Square } from "chessops";
import { makeFen } from "chessops/fen";
import { makeSan } from "chessops/san";

import { LocatedPiece } from "@/types/LocatedPiece";
import { Opinion } from "@/types/Opinion";
import { getLegalMoves } from "./legal-moves";

interface PromptOptions {
    position: Chess;
    piece: LocatedPiece;
    moveSan?: string;
    context?: Opinion[];
}

export function pieceLabel(piece: LocatedPiece, self?: Square) {
    const selfComment = self == piece.square ? " (you)" : "";
    
    return `${makeSquare(piece.square)} ${piece.color}`
        + ` ${piece.role}${selfComment}`;
}

export function buildPrompt({
    position,
    piece,
    moveSan,
    context = []
}: PromptOptions) {
    const pieces = [...position.board.occupied].map(square => {
        const currPiece = position.board.get(square);
        if (!currPiece) return;

        return pieceLabel({ ...currPiece, square }, piece.square);
    }).filter(label => label != undefined);

    const legalMoves = getLegalMoves(position)
        .map(move => makeSan(position, move));

    const moveComment = moveSan ? (
        "The move that has just been played in this"
        + ` position is ${moveSan}, which moved you.`
    ) : "";

    const contextComment = !moveSan && context.length > 0 ? (
        `Your peers (the other ${position.turn} pieces) have already made`
        + "the following comments about the position or the move that "
        + "they would like to make:\n"
        + context.map(ctx => (
            `${pieceLabel(ctx)}: "${ctx.message}"`
        )).join("\n")
    ) : "";

    const requestComment = moveSan ? (
        "about the move that has just moved you, or what you want to do"
        + " having now been moved, or what you think you have achieved in"
        + " having been moved here."
    ) : (
        "about the position or the legal move that you think your side"
        + ` (${position.turn}) should make.`
    );

    const afterContextComment = contextComment
        ? "If you would like, you may also respond to one of your peers."
        : "";

    return `
        You are a ${piece.role} on a Chess board. You are currently on the
        ${makeSquare(piece.square)} square. The position in FEN notation is
        \`${makeFen(position.toSetup())}\`. In accordance with the FEN, the
        pieces on the board are as follows: ${pieces.join(", ")}.
        The legal moves in this position (in SAN notation) are:
        ${legalMoves.join("\n")}
        ${moveComment || ""} ${contextComment}
        Using this information, make a comment (not exceeding 25-30 words)
        ${requestComment} ${afterContextComment}
        You must ALWAYS refer to yourself as "I", "me", "myself" etc. NEVER
        refer to yourself as "my pawn" etc.
        The response will be given to a Text-to-Speech engine, so you may
        precede your response with some instructions (e.g. "(shout angrily)")
        if necessary to convey the piece's thoughts.
    `;
}