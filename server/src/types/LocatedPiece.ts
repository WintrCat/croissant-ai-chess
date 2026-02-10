import { Piece, Square } from "chessops";

export interface LocatedPiece extends Piece {
    square: Square;
}