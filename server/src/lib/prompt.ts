import { Chess, makeSquare, Square } from "chessops";
import { makeFen } from "chessops/fen";

import { LocatedPiece } from "@/types/LocatedPiece";
import { Opinion } from "@/types/Opinion";

export function pieceLabel(piece: LocatedPiece, self?: Square) {
    const selfComment = self == piece.square ? " (you)" : "";
    return `${piece.role} on ${makeSquare(piece.square)}${selfComment}`;
}

export function buildPrompt(
    position: Chess,
    piece: LocatedPiece,
    context: Opinion[] = []
) {
    const pieces = [...position.board.occupied].map(square => {
        const currPiece = position.board.get(square);
        if (!currPiece) return;

        return pieceLabel({ ...currPiece, square }, piece.square);
    }).filter(label => label != undefined);

    const contextComment = context.length > 0
        ? `Your peers (the other ${position.turn} pieces) have already made`
            + "the following comments about the position or the move that "
            + "they would like to make:\n"
            + context.map(ctx => (
                `${pieceLabel(ctx)}: "${ctx.message}"`
            )).join("\n")
        : "";

    const auxiliaryContextComment = contextComment
        ? "If you would like, you may also respond to one of your peers."
        : "";

    return `
        You are a ${piece.role} on a Chess board. You are currently on the
        ${makeSquare(piece.square)} square. The position in FEN notation is
        \`${makeFen(position.toSetup())}\`. In accordance with the FEN, the
        pieces on the board are as follows: ${pieces.join(", ")}.
        ${contextComment}
        Using this information, make a comment (not exceeding 25-30 words)
        about the position or the move that you think your side
        (${position.turn}) should make. ${auxiliaryContextComment}
        This prompt will be given to a Text-to-Speech engine, so you may
        precede your response with some instructions (e.g. "(shout angrily)")
        if necessary to convey the piece's thoughts.
    `;
}