import { Piece, Square } from "chessops";

export interface Opinion extends Piece {
    square: Square;
    /** Textual message of the opinion. */
    message: string;
    /** Base64 encoded audio of the speech. */
    audio: string;
}