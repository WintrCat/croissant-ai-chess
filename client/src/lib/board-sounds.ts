import { Chess, NormalMove } from "chessops";
import { makeSanAndPlay } from "chessops/san";

export function playBoardSound(position: Chess, move: NormalMove) {
    position = position.clone();
    const san = makeSanAndPlay(position, move);

    if (position.isEnd()) {
        new Audio("/audio/gameend.mp3").play();
    }

    if (position.isCheck() || position.isCheckmate()) {
        new Audio("/audio/check.mp3").play();
    } else if (san.includes("O-O")) {
        new Audio("/audio/castle.mp3").play();
    } else if (san.includes("=")) {
        new Audio("/audio/promote.mp3").play();
    } else if (san.includes("x")) {
        new Audio("/audio/capture.mp3").play();
    } else {
        new Audio("/audio/move.mp3").play();
    }
}