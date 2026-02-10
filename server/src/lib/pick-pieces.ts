import { Chess, Piece, Role } from "chessops";
import { random, sum } from "es-toolkit";

import { LocatedPiece } from "@/types/LocatedPiece";

const PIECE_VALUES: Record<Role, number> = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: Infinity
};

const PIECE_TALK_COUNT = 6;

/** Pick pieces by weighted probability to give an opinion */
export function pickPieces(position: Chess) {
    const pieces: LocatedPiece[] = [...position.board[position.turn]]
        .map(square => {
            const piece = position.board.get(square);
            return piece && { ...piece, square };
        })
        .filter(piece => piece != undefined)
        .sort((a, b) => PIECE_VALUES[b.role] - PIECE_VALUES[a.role]);

    const weights = pieces.map((_, index) => (
        Math.pow(pieces.length - index, 2)
    ));

    const selectedPieces: LocatedPiece[] = [];

    const numToTake = Math.min(PIECE_TALK_COUNT, pieces.length);
    for (let i = 0; i < numToTake; i++) {
        const num = Math.round(random(0, sum(weights)));
    
        let index = 0, count = 0;
        for (const weight of weights) {
            count += weight;
            if (count > num) break;
            index++;
        }

        if (!pieces[i]) continue;
        pieces.splice(i, 1);
        selectedPieces.push(pieces[i]);
    }
    
    return selectedPieces;
}