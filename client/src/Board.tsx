import { useState } from "react";
import { Chessboard, defaultPieces } from "react-chessboard";
import { useDisclosure } from "@mantine/hooks";
import {
    charToRole,
    Chess,
    NormalMove,
    parseSquare,
    Role,
    ROLE_CHARS,
    RoleChar,
    Square,
    squareFile,
    SquareName,
    SquareSet
} from "chessops";
import { makeFen } from "chessops/fen";

import styles from "./Board.module.css";
import { playBoardSound } from "./lib/board-sounds";

type ColourChar = "w" | "b";
type Promotion = NormalMove & { colour: ColourChar };

function getRoleChars(colour: ColourChar, promotable = true) {
    return ROLE_CHARS
        .filter(char => !promotable || (char != "k" && char != "p"))
        .map(char => `${colour}${char.toUpperCase()}`);
}

function Board() {
    const [ position, setPosition ] = useState(Chess.default());

    const [ highlighted, setHighlighted ] = useState<string[]>([]);
    const [ promotionOpen, promotionDialog ] = useDisclosure();
    const [ promotionMove, setPromotionMove ] = useState<Promotion>();

    const [ held, setHeld ] = useState<Square>();

    const handlePromotion = (piece: Role) => {
        if (!promotionMove) return;
        const move: NormalMove = { ...promotionMove, promotion: piece };

        playBoardSound(position, move);
        position.play(move);
        setPosition(position.clone());

        promotionDialog.close();
        setPromotionMove(undefined);
    };

    return <div className={styles.wrapper}>
        <Chessboard options={{
            position: makeFen(position.toSetup()),
            dragActivationDistance: 0,
            draggingPieceGhostStyle: { opacity: 0 },
            onSquareRightClick: ({ square }) => {
                setHighlighted(prev => prev.includes(square)
                    ? prev.filter(sq => sq != square)
                    : [...prev, square]
                );
            },
            onSquareClick: () => {
                setHighlighted([]);
                promotionDialog.close();
            },
            squareStyles: Object.fromEntries(highlighted.map(
                square => [square, { backgroundColor: "#eb6150cc" }]
            )),
            onPieceDrag: ({ square }) => {
                console.log(`square: ${square}`);
                setHeld(parseSquare(square as SquareName));

                setHighlighted([]);
                promotionDialog.close();
            },
            onPieceDrop: ({ piece, sourceSquare, targetSquare }) => {
                setHeld(undefined);

                const from = parseSquare(sourceSquare);
                const to = targetSquare && parseSquare(targetSquare);
                if (!from || !to) return false;

                const dests = position.dests(from);
                if (!dests.has(to)) return false;

                const move: NormalMove = { from, to };

                const backrankDests = dests.intersect(SquareSet.backranks());
                if (piece.pieceType.endsWith("P") && backrankDests.has(to)) {
                    promotionDialog.open();
                    setPromotionMove({
                        ...move,
                        colour: piece.pieceType.charAt(0) == "w" ? "w" : "b"
                    });
                    
                    return false;
                }

                playBoardSound(position, move);
                position.play(move);
                setPosition(position.clone());

                return true;
            },
            squareRenderer: ({ square, children }) => {
                const parsedSquare = parseSquare(square as SquareName);

                const isDestination = held && position.dests(held)
                    .has(parsedSquare);
                const hasPiece = !!position.board.get(parsedSquare);
                
                return <div className={styles.square}>
                    {isDestination && <div className={hasPiece
                        ? styles.captureDestCircle
                        : styles.destCircle
                    }/>}

                    {children}
                </div>;
            },
            dropSquareStyle: { boxShadow: "0 0 0px 5px #fff inset" }
        }}/>

        {promotionOpen && promotionMove && <div
            className={styles.promotionDialog}
            style={{
                top: promotionMove.colour == "w" ? 0 : "50%",
                left: `${squareFile(promotionMove.to) * 12.5}%`
            }}
        >
            {(promotionMove.colour == "w"
                ? getRoleChars(promotionMove.colour)
                : getRoleChars(promotionMove.colour).reverse()
            ).map(char => <div
                className={styles.promotionPiece}
                onClick={() => handlePromotion(
                    charToRole(char.charAt(1).toLowerCase() as RoleChar)
                )}
            >
                {defaultPieces[char]({ svgStyle: { width: "100%" } })}
            </div>)}
        </div>}
    </div>;
}

export default Board;