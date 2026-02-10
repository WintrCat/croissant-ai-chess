import { LocatedPiece } from "./LocatedPiece";

export interface Opinion extends LocatedPiece {
    /** Textual message of the opinion. */
    message: string;
    /** Base64 encoded audio of the speech. */
    audio: string;
}