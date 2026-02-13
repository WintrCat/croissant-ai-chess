import { Chess, NormalMove, Role, SquareSet } from "chessops";

const PROMOTABLES: Role[] = ["bishop", "knight", "rook", "queen"];

/* Returns all legal SAN moves in a position. */
export function getLegalMoves(position: Chess) {
    const moves: NormalMove[] = [];
    const dests = position.allDests();

    for (const [ source, targets ] of dests.entries()) {
        const piece = position.board.get(source);
        if (!piece) continue;

        for (const target of targets) {
            const isPromotion = piece.role == "pawn"
                && SquareSet.backranks().has(target);

            const move: NormalMove = { from: source, to: target };

            if (isPromotion) {
                for (const promotable of PROMOTABLES) {
                    moves.push({ ...move, promotion: promotable });
                }
            } else {
                moves.push(move);
            }
        }
    }

    return moves;
}