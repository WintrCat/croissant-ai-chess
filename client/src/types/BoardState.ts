import { Chess, NormalMove } from "chessops";
import { ControlledPieces } from "@/constants/llms";

export interface BoardState {
    position: Chess;
    llms: ControlledPieces;
    move?: NormalMove;
}