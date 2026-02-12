import { Chess, Role } from "chessops";
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

/** Pick pieces by weighted probability to give an opinion */
export function pickPieces(position: Chess, max = 6) {
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

    for (let i = 0; i < Math.min(max, pieces.length); i++) {
        const num = Math.round(random(0, sum(weights)));
    
        let index = 0, count = 0;
        for (const weight of weights) {
            count += weight;
            if (count > num) break;
            index++;
        }

        if (!pieces[index]) continue;
        selectedPieces.push(pieces[index]!);
        pieces.splice(index, 1);
        weights.splice(index, 1);
    }
    
    return selectedPieces;
}